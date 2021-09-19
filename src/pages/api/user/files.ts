import { NextApiReq, NextApiRes, withDraconic } from 'middleware/withDraconic';
import prisma from 'lib/prisma';

async function handler(req: NextApiReq, res: NextApiRes) {
  const user = await req.user();
  if (!user) return res.forbid('Unauthorized');
  const mediaFiles = ['audio', 'video', 'image'];
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
      file.url = req.headers.host + '/' + file.slug;
      file.rawUrl = req.headers.host + '/raw/' + file.fileName;
    });
    return res.json(files);
  } else {
    return res.forbid('Invalid method');
  }
}

export default withDraconic(handler);