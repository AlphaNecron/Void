import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser();
  if (!user) return res.unauthorized();
  switch (req.method) {
  case 'GET': {
    const ref = await prisma.referralCode.findMany({
      where: {
        userId: user.id
      },
      select: {
        code: true,
        createdAt: true,
        expiresAt: true,
        consumedBy: true
      }
    });
    return res.json(ref);
  }
  default:
    return res.notAllowed();
  }
}

export default withVoid(handler);
