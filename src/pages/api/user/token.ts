import logger from 'lib/logger';
import prisma from 'lib/prisma';
import {generateToken} from 'lib/utils';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser(req.headers.authorization);
  if (!user) return res.unauthorized();
  if (req.method === 'PATCH') {
    const updated = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        privateToken: generateToken()
      }
    });
    logger.info(`User ${user.username} (${user.id}) reset their token`);
    return res.success({ newToken: updated.privateToken });
  }
  else if (req.method === 'GET')
    return res.json({ privateToken: user.privateToken });
  return res.notAllowed();
}

export default withVoid(handler);
