import {VoidRequest, VoidResponse, withVoid} from 'lib/middleware/withVoid';
import prisma from 'lib/prisma';
import {verify} from 'argon2';

// import { verifyPassword } from 'lib/utils';

async function handler(req: VoidRequest, res: VoidResponse) {
  if (req.method !== 'POST') return res.notAllowed();
  if (!req.body) return res.forbid('No body');
  if (!(req.body.password || !req.body.id)) return res.forbid('No password or ID');
  const url = await prisma.url.findFirst({
    where: {
      id: req.body.id
    },
    select: {
      id: true,
      password: true,
      destination: true
    }
  });
  const valid = await verify(url.password, req.body.password);
  if (!valid) return res.error('Wrong password');
  await prisma.url.update({
    where: {
      id: url.id
    },
    data: {
      views: {
        increment: 1
      }
    }
  });
  return res.json({
    success: true,
    destination: url.destination
  });
}

export default withVoid(handler);
