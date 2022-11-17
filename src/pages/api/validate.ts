import { verify } from 'argon2';
import { VoidRequest, VoidResponse, withVoid } from 'lib/middleware/withVoid';
import internal from 'void/internal';

async function handler(req: VoidRequest, res: VoidResponse) {
  if (req.method !== 'POST') return res.notAllowed();
  const {id, password} = req.body;
  if (!(id && password)) res.error('Invalid request.');
  const url = await internal.prisma.url.findUnique({
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
  await internal.prisma.url.update({
    where: {
      id: url.id
    },
    data: {
      clicks: {
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
