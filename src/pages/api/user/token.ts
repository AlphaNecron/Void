import internal from 'void/internal';
import { generateToken } from 'lib/utils';
import { VoidRequest, VoidResponse, withVoid } from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser(req.headers.authorization);
  if (!user) return res.unauthorized();
  if (req.method === 'PATCH') {
    await internal.prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        privateToken: generateToken()
      }
    });
    return res.success();
  } else if (req.method === 'GET')
    return res.json({privateToken: user.privateToken});
  return res.notAllowed();
}

export default withVoid(handler);
