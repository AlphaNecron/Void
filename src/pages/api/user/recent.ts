import { NextApiReq, NextApiRes, withAxtral } from 'middleware/withAxtral';
import prisma from 'lib/prisma';

async function handler(req: NextApiReq, res: NextApiRes) {
  const user = await req.user();
  if (!user) return res.forbid('Unauthorized');
  const take = Number(req.query.take ?? 3);
  if (take > 50) return res.error('Take query can\'t be more than 50');
  const files = await prisma.file.findMany({
    take,
    orderBy: {
      uploadedAt: 'desc'
    },
    where: {
      userId: user.id,
    },
    select: {
      uploadedAt: true,
      slug: true,
      fileName: true,
      mimetype: true
    }
  });
  return res.json(files);
}

export default withAxtral(handler);