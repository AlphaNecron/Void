import { info } from 'lib/logger';
import prisma from 'lib/prisma';
import { generateToken, hashPassword } from 'lib/utils';
import { NextApiReq, NextApiRes, withVoid } from 'middleware/withVoid';

async function handler(req: NextApiReq, res: NextApiRes) {
  const user = await req.user();
  if (!user) return res.forbid('Unauthorized');
  if (!user.isAdmin) return res.forbid('You aren\'t an administrator');
  if (req.method === 'DELETE') {
    if (req.body.id === user.id) return res.forbid('You can\'t delete your own account');
    const userToDelete = await prisma.user.findFirst({
      where: {
        id: req.body.id
      }
    });
    if (!userToDelete) return res.error('User not found');
    await prisma.user.delete({
      where: {
        id: userToDelete.id
      }
    });
    delete userToDelete.password;
    info('USER', `Deleted user ${userToDelete.username} (${userToDelete.id})`);
    global.logger.logUser('delete', userToDelete);
    return res.json(userToDelete);
  } else if (req.method === 'POST') {
    const { username, password, isAdmin } = req.body as { username: string, password: string, isAdmin: boolean };
    if (!username) return res.bad('No username provided');
    if (!password) return res.bad('No password provided');
    const existing = await prisma.user.findFirst({
      where: {
        username
      }
    });
    if (existing) return res.forbid('Username is already taken');
    const hashed = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        password: hashed,
        username,
        token: generateToken(),
        isAdmin
      }
    });
    delete newUser.password;
    info('USER', `Created user ${newUser.username} (${newUser.id})`);
    global.logger.logUser('create', newUser);
    return res.json(newUser);
  } else {
    const all = await prisma.user.findMany({
      select: {
        username: true,
        id: true,
        isAdmin: true,
        token: true,
        useEmbed: true,
        embedSiteName: true,
        embedColor: true,
        embedTitle: true,
        embedDesc: true
      }
    });
    return res.json(all);
  }
}

export default withVoid(handler);