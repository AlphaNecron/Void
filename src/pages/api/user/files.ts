import config from 'lib/config';
import prisma from 'lib/prisma';
import { NextApiReq, NextApiRes, withDraconic } from 'middleware/withDraconic';

async function handler(req: NextApiReq, res: NextApiRes) {
  const user = await req.user();
  if (!user) return res.forbid('Unauthorized');
  const mediaFiles = ['video', 'image'];
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
        deletionToken: true
      }
    });
    if (req.query.filter) files = files.filter(file => (req.query.filter === 'media'
      ? mediaFiles.includes(file.mimetype.split('/')[0])
      : file.mimetype.startsWith(req.query.filter)));
    files.forEach(file => {
      const baseUrl = `http${config.core.secure ? 's' : ''}://${req.headers.host}/`;
      file.url = baseUrl + file.slug;
      file.rawUrl = baseUrl + 'r/' + file.fileName;
    });
    return res.json(files);
  } else {
    return res.forbid('Invalid method');
  }
}

export default withDraconic(handler);