import internal from 'void/internal';
import { VoidRequest, VoidResponse, withVoid } from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser(req.headers.authorization);
  if (!user) return res.unauthorized();
  const users = await internal.prisma.user.findMany({
    take: 10,
    select: {
      username: true,
      name: true,
      _count: {
        select: {
          urls: true,
          files: true
        }
      }
    }
  });
  const userCount = await internal.prisma.user.count();
  const domainCount = await internal.prisma.domain.count();
  const roleCount = await internal.prisma.role.count();
  const urlAgg = await internal.prisma.url.aggregate({
    _sum: {
      clicks: true
    },
    _count: true
  });
  const usr = await internal.prisma.user.findUnique({
    where: {
      id: user.id
    },
    select: {
      _count: {
        select: {
          urls: true,
          files: true
        }
      }
    }
  });
  const agg = await internal.prisma.file.aggregate({
    _sum: {
      size: true,
      views: true
    },
    _avg: {
      size: true
    },
    _count: true
  });
  return res.json({
    stats: {
      domainCount,
      roleCount,
      urls: urlAgg._count,
      views: {
        files: agg._sum.views || 0,
        urls: urlAgg._sum.clicks || 0
      },
      upload: {
        totalSize: Number(agg._sum.size),
        totalFiles: agg._count,
        averageSize: Number(agg._avg.size)
      },
      users: {
        count: userCount,
        top: users.map(user => ({
          username: user.username,
          displayName: user.name,
          files: user._count.files,
          urls: user._count.urls
        })).sort((a, b) => (b.files + b.urls) - (a.files + a.urls))
      },
      user: {
        role: user.role.name,
        ...usr._count
      }
    }
  });
}

export default withVoid(handler);
