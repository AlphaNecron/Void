import { hash } from 'argon2';
import internal from 'void/internal';
import { VoidRequest, VoidResponse, withVoid } from 'lib/middleware/withVoid';
import { hasPermission, Permission } from 'lib/permission';
import generate from 'lib/urlGenerator';

async function handler(req: VoidRequest, res: VoidResponse) {
  if (req.method !== 'POST') return res.notAllowed();
  const usr = await req.getUser(req.headers.authorization);
  if (!usr) return res.unauthorized();
  if (!hasPermission(usr.role.permissions, Permission.SHORTEN))
    return res.noPermission(Permission.SHORTEN);
  if (!req.body['Destination']) return res.forbid('No URL specified');
  if (req.body['Vanity']) {
    if (!internal.config.void.url.allowVanityUrl) return res.forbid('Vanity URLs are not allowed.');
    if (!hasPermission(usr.role.permissions, Permission.VANITY))
      return res.noPermission(Permission.VANITY);
    const existing = await internal.prisma.url.findFirst({
      where: {
        short: req.body['Vanity']
      }
    });
    if (existing) return res.forbid('Vanity is already taken');
  }
  let rand = generate('alphanumeric', internal.config.void.url.length);
  if (req.body['URL'] && ['emoji', 'invisible', 'alphanumeric'].includes(req.body['URL'].toString()))
    rand = generate(req.body['URL'].toString() as 'alphanumeric' | 'invisible' | 'emoji', internal.config.void.url.length);
  const password = req.body['Password'] ? await hash(req.body['Password']) : undefined;
  const url = await internal.prisma.url.create({
    data: {
      short: req.body['Vanity'] || rand,
      destination: req.body['Destination'],
      userId: usr.id,
      password
    }
  });
  return res.json({
    url: `http${internal.config.void.useHttps ? 's' : ''}://${req.headers.host}/${url.short}`
  });
}

export default withVoid(handler);
