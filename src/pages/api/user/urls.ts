import config from 'lib/config';
import { info } from 'lib/logger';
import prisma from 'lib/prisma';
import { NextApiReq, NextApiRes, withDraconic } from 'middleware/withDraconic';

async function handler(req: NextApiReq, res: NextApiRes) {
  const user = await req.user();
  if (!user) return res.forbid('Unauthorized');
  if (req.method === 'DELETE') {
    if (!req.body.id) return res.forbid('No URL ID');
    const url = await prisma.url.delete({
      where: {
        id: req.body.id
      }
    });
    if (!url) return res.error('URL not found');
    info('URL', `User ${user.username} (${user.id}) deleted a url ${url.destination} (${url.id})`);
    return res.json(url);
  } else {
    let urls = await prisma.url.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        createdAt: true,
        short: true,
        destination: true,
        views: true
      },
      orderBy: {
        id: 'asc',
      }
    });
    urls.map(url => url.url = `http${config.core.secure ? 's' : ''}://${req.headers.host}${config.shortener.route}/${url.short}`);
    return res.json(urls);
  }
}

export default withDraconic(handler);