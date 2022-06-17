import {hash} from 'argon2';
import config from 'lib/config';
import cfg from 'lib/config';
import {VoidRequest, VoidResponse, withVoid} from 'lib/middleware/withVoid';
import {hasPermission, Permission} from 'lib/permission';
import prisma from 'lib/prisma';
import generate from 'lib/urlGenerator';

async function handler(req: VoidRequest, res: VoidResponse) {
  if (req.method !== 'POST') return res.notAllowed();
  const usr = await req.getUser(req.headers.authorization);
  if (!usr) return res.unauthorized();
  if (!hasPermission(usr.role.permissions, Permission.SHORTEN)) {
    return res.noPermission(Permission.SHORTEN);
  }
  if (!req.body['Destination']) return res.forbid('No URL specified');
  if (req.body['Vanity']) {
    if (!config.void.url.allowVanityUrl) return res.forbid('Vanity URLs are not allowed.');
    if (!hasPermission(usr.role.permissions, Permission.VANITY)) {
      return res.noPermission(Permission.VANITY);
    }
    const existing = await prisma.url.findFirst({
      where: {
        short: req.body['Vanity']
      }
    });
    if (existing) return res.forbid('Vanity is already taken');
  }
  let rand = generate('alphanumeric', cfg.void.url.length);
  if (req.body['URL'] && ['emoji', 'invisible', 'alphanumeric'].includes(req.body['URL'].toString()))
    rand = generate(req.body['URL'].toString() as 'alphanumeric' | 'invisible' | 'emoji', cfg.void.url.length);
  let password;
  if (req.body['Password']) password = await hash(req.body['Password']);
  const url = await prisma.url.create({
    data: {
      short: req.body['Vanity'] || rand,
      destination: req.body['Destination'],
      userId: usr.id,
      password
    }
  });
  return res.json({
    url: `http${config.void.useHttps ? 's' : ''}://${req.headers.host}/${url.short}`
  });
}

export default withVoid(handler);
