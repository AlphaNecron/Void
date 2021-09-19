import { NextApiReq, NextApiRes, withDraconic } from 'middleware/withDraconic';
import prisma from 'lib/prisma';

async function handler(req: NextApiReq, res: NextApiRes) {
  const user = await req.user();
  if (!user) return res.forbid('Unauthorized');
  if (req.method === 'GET') {
    let files = await prisma.file.findMany({
      where: {
        userId: user.id,
      },
      select: {
        uploadedAt: true,
        fileName: true,
        origFileName: true,
        mimetype: true,
        id: true,
        slug: true,
        deletionToken: true
      }
    });
    if (req.query.filter) files = files.filter(file => file.mimetype.startsWith(req.query.filter));
    return res.json(files);
  } else {
    return res.forbid('Invalid method');
  }
}

export default withDraconic(handler);