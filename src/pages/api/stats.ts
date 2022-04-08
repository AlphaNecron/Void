import prisma from 'lib/prisma';
// import { bytesToHr, sizeOfDir } from 'lib/utils';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser(req.headers.authorization);
  if (!user) return res.forbid('Unauthorized');
  // const size = await sizeOfDir(join(process.cwd(), config.uploader.directory));
  const userCount = await prisma.user.count();
  const fileCount = await prisma.file.count();
  const urlCount = await prisma.url.count();
  if (fileCount === 0 && urlCount === 0) {
    return res.json({
      // size: bytesToHr(0),
      sizeRaw: 0,
      // avgSize: bytesToHr(0),
      fileCount,
      urlCount,
      viewCount: 0,
      userCount
    });
  }
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          urls: true,
          files: true
        }
      }
    }
  });
  const countByUser = [];
  for (let i = 0, L = users.length; i !== L; ++i) {
    countByUser.push({
      username: users[i].username,
      fileCount: users[i]._count.files,
      urlCount: users[i]._count.urls
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
    // size: bytesToHr(size),
    // sizeRaw: size,
    // avgSize: bytesToHr(isNaN(size / fileCount) ? 0 : size / fileCount),
    fileCount,
    urlCount,
    countByUser: countByUser,
    userCount,
    viewCount: (viewsCount[0]?._sum?.views ?? 0),
    countByType: countByType.sort((x,y) => x.count - y.count)
  });
}

export default withVoid(handler);
