import {verify} from 'argon2';
import {VoidRequest, VoidResponse, withVoid} from 'lib/middleware/withVoid';
import prisma from 'lib/prisma';

async function handler(req: VoidRequest, res: VoidResponse) {
  if (req.method !== 'POST') return res.notAllowed();
  const { id, password } = req.body;
  if (!(id && password)) res.error('Invalid request.');
  const url = await prisma.url.findUnique({
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
  if (!valid) return res.error('Wrong password.');
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
