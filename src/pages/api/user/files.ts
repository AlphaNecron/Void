import prisma from 'lib/prisma';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';
import {getSession} from 'next-auth/react';

async function handler(req: VoidRequest, res: VoidResponse) {
  const session = await getSession({ req });
  if (!session) return res.forbid('Unauthorized');
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    }
  });
  if (!user) return res.forbid('Unauthorized');
  if (req.method === 'GET') {
    const total = await prisma.file.count({
      where: {
        userId: user.id
      }
    });
    if (total === 0) return res.json({ page: 0, totalPages: 0, totalFiles: 0, filesPerPage: +req.query.chunk, files: [] });
    const chunk = Number(req.query.chunk || total);
    if (chunk < 1) return res.forbid('Invalid chunk.');
    const maxPage = Math.ceil(total / chunk);
    const page = +req.query.page > maxPage ? maxPage : (+req.query.page > 1 ? +req.query.page : 1) || 1;
    const files = await prisma.file.findMany({
      ...(req.query.page && { skip: (page-1)*chunk }),
      ...(req.query.chunk && { take: chunk }),
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        fileName: true,
        uploadedAt: true,
        mimetype: true,
        slug: true,
        views: true,
        deletionToken: true,
        isExploding: true,
        isPrivate: true
      },
      orderBy: {
        uploadedAt: req.query.order === 'ascending' ? 'asc' : 'desc',
      }
    });
    return res.json({
      page: page,
      totalPages: maxPage,
      totalFiles: total,
      filesPerPage: chunk,
      files
    });
  } else {
    return res.forbid('Invalid method');
  }
}

export default withVoid(handler);
