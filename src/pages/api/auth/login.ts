import { info } from 'lib/logger';
import prisma from 'lib/prisma';
import { checkPassword, createToken, hashPassword } from 'lib/utils';
import { NextApiReq, NextApiRes, withDraconic } from 'middleware/withDraconic';

async function handler(req: NextApiReq, res: NextApiRes) {
  if (req.method !== 'POST') return res.status(405).end();
  const { username, password } = req.body as { username: string, password: string };
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    const user = await prisma.user.create({
      data: {
        username: 'admin',
        password: await hashPassword('draconicuser'),
        token: createToken(),
        isAdmin: true
      }
    });
    info('SEED', `Created default user with username "${user.username}" and password "draconicuser"`);
  }
  const user = await prisma.user.findFirst({
    where: {
      username 
    }
  });
  if (!user) return res.status(404).end(JSON.stringify({ error: 'User not found' }));
  const valid = await checkPassword(password, user.password);
  if (!valid) return res.forbid('Wrong password');
  res.setCookie('user', user.id, { sameSite: true, maxAge: 604800, path: '/' });
  info('AUTH', `User ${user.username} (${user.id}) logged in`);
  return res.json({ success: true });
}

export default withDraconic(handler);