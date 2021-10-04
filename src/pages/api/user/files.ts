import config from 'lib/config';
import prisma from 'lib/prisma';
import { NextApiReq, NextApiRes, withVoid } from 'middleware/withVoid';

async function handler(req: NextApiReq, res: NextApiRes) {
  const user = await req.user();
  if (!user) return res.forbid('Unauthorized');
  if (req.method === 'GET') {
    let files = await prisma.file.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        fileName: true,
        origFileName: true,
        uploadedAt: true,
        mimetype: true,
        slug: true,
        views: true,
        deletionToken: true
      },
      orderBy: {
        id: 'asc',
      }
    });
    files.map(file => {
      const baseUrl = `http${config.core.secure ? 's' : ''}://${req.headers.host}/`;
      file['url'] = baseUrl + file.slug;
      file['rawUrl'] = baseUrl + 'r/' + file.fileName;
    });
    return res.json(files);
  } else {
    return res.forbid('Invalid method');
  }
}

export default withVoid(handler);