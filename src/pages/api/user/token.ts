import { NextApiReq, NextApiRes, withAxtral } from 'middleware/withAxtral';
import prisma from 'lib/prisma';
import { createToken } from 'lib/utils';
import { info } from 'lib/logger';

async function handler(req: NextApiReq, res: NextApiRes) {
  const user = await req.user();
  if (!user) return res.forbid('Unauthorized');

  if (req.method === 'PATCH') {
    const updated = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        token: createToken()
      }
    });
    info('USER', `User ${user.username} (${user.id}) reset their token`);
    return res.json({ success: true, token: updated.token });
  }
  else {
    return res.forbid('Invalid method');
  }
}

export default withAxtral(handler);