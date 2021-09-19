import { join } from 'path';
import { NextApiReq, NextApiRes, withDraconic } from 'middleware/withDraconic';
import prisma from 'lib/prisma';
import { bytesToHr, sizeOfDir } from 'lib/utils';
import config from 'lib/config';

async function handler(req: NextApiReq, res: NextApiRes) {
  const user = await req.user();
  if (!user) return res.forbid('Unauthorized');
  const size = await sizeOfDir(join(process.cwd(), config.uploader.directory));
  const userCount = await prisma.user.count();
  const count = await prisma.file.count();
  if (count === 0) {
    return res.json({
      size: bytesToHr(0),
      sizeRaw: 0,
      avgSize: bytesToHr(0),
      count,
      viewCount: 0,
      userCount
    });
  }
  const byUser = await prisma.file.groupBy({
    by: ['userId'],
    _count: {
      _all: true
    }
  });
  const countByUser = [];
  for (let i = 0, L = byUser.length; i !== L; ++i) {
    const user = await prisma.user.findFirst({
      where: {
        id: byUser[i].userId
      }
    });
    countByUser.push({
      username: user.username,
      count: byUser[i]._count._all
    });
  }
  const viewsCount = await prisma.file.groupBy({
    by: ['views'],
    _sum: {
      views: true
    }
  });
  const typesCount = await prisma.file.groupBy({
    by: ['mimetype'],
    _count: {
      mimetype: true
    }
  });
  const countByType = [];
  for (let i = 0, L = typesCount.length; i !== L; ++i) {
    countByType.push({ mimetype: typesCount[i].mimetype, count: typesCount[i]._count.mimetype });
  }
  return res.json({
    size: bytesToHr(size),
    sizeRaw: size,
    avgSize: bytesToHr(isNaN(size / count) ? 0 : size / count),
    count,
    countByUser: countByUser.sort((x,y) => x.count - y.count),
    userCount,
    viewCount: (viewsCount[0]?._sum?.views ?? 0),
    countByType: countByType.sort((x,y) => x.count - y.count)
  });
}

export default withDraconic(handler);