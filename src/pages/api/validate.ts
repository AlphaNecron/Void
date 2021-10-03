import { NextApiReq, NextApiRes, withVoid } from 'lib/middleware/withVoid';
import prisma from 'lib/prisma';
import { verifyPassword } from 'lib/utils';

async function handler(req: NextApiReq, res: NextApiRes) {
  if (req.method !== 'POST') return res.forbid('Invalid method');
  if (!req.body) return res.forbid('No body');
  if (!(req.body.password || !req.body.id)) return res.forbid('No password or ID');
  const url = await prisma.url.findFirst({
    where: {
      id: +req.body.id
    },
    select: {
      password: true,
      destination: true
    }
  });
  const valid = await verifyPassword(req.body.password, url.password);
  if (!valid) return res.error('Wrong password');
  return res.json({
    success: true,
    destination: url.destination
  });
}

export default withVoid(handler);