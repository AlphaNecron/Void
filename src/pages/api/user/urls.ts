import {hasPermission, Permission} from 'lib/permission';
import prisma from 'lib/prisma';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser();
  if (!user) return res.unauthorized();
  if (!hasPermission(user.role.permissions, Permission.SHORTEN)) return res.noPermission(Permission.SHORTEN);
  if (req.method === 'DELETE') {
    if (!req.body.id) return res.forbid('No URL ID.');
    const url = await prisma.url.findUnique({
      where: {
        id: req.body.id
      },
      include: {
        user: true
      }
    });
    if (!url) return res.notFound('URL not found.');
    if (url.user.id !== user.id) return res.forbid('You are not allowed to delete this URL.');
    await prisma.url.delete({
      where: {
        id: url.id
      }
    });
    return res.success();
  } else {
    const urls = await prisma.url.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        createdAt: true,
        short: true,
        destination: true,
        clicks: true,
        password: true
      },
      orderBy: {
        createdAt: 'asc',
      }
    });
    return res.json(urls.map(url => ({...url, password: url.password?.length > 0})));
  }
}

export default withVoid(handler);
