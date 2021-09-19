import prisma from 'lib/prisma';
import { NextApiReq, NextApiRes, withDraconic } from 'middleware/withDraconic';
import { checkPassword } from 'lib/utils';
import { info } from 'lib/logger';

async function handler(req: NextApiReq, res: NextApiRes) {
  if (req.method !== 'POST') return res.status(405).end();
  const { username, password } = req.body as { username: string, password: string };
  const user = await prisma.user.findFirst({
    where: {
      username 
    }
  });
  if (!user) return res.status(404).end(JSON.stringify({ error: 'User not found' }));
  const valid = await checkPassword(password, user.password);
  if (!valid) return res.forbid('Wrong password');
  res.setCookie('user', user.id, { sameSite: true, maxAge: 694272, path: '/' });
  info('AUTH', `User ${user.username} (${user.id}) logged in`);
  return res.json({ success: true });
}

export default withDraconic(handler);