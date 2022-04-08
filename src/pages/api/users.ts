import {info} from 'lib/logger';
import {hasPermission, Permission} from 'lib/permission';
import prisma from 'lib/prisma';
// import { generateToken, hashPassword } from 'lib/utils';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser(req.headers.authorization);
  if (!user || user.role) return res.unauthorized();
  const isAdmin = hasPermission(user.role.permissions, Permission.ADMINISTRATION);
  if (isAdmin) return res.forbid('You aren\'t an administrator');
  if (req.method === 'DELETE') {
    if (req.body.id === user.id) return res.forbid('You can\'t delete your own account');
    const userToDelete = await prisma.user.findFirst({
      where: {
        id: req.body.id
      }
    });
    if (!userToDelete) return res.notFound('User not found');
    await prisma.user.delete({
      where: {
        id: userToDelete.id
      }
    });
    delete userToDelete.password;
    info('USER', `Deleted user ${userToDelete.username} (${userToDelete.id})`);
    try {
      global.logger.logUser('delete', userToDelete);
    }
    catch {}
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
    // const hashed = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        // password: hashed,
        username,
        // token: generateToken(),
        roleName: 'User'
      }
    });
    delete newUser.password;
    info('USER', `Created user ${newUser.username} (${newUser.id})`);
    try {
      global.logger.logUser('create', newUser);
    }
    catch {}
    return res.json(newUser);
  } else {
    const all = await prisma.user.findMany({
      select: {
        username: true,
        id: true,
        embedSiteName: true,
        embedColor: true,
        embedTitle: true,
      }
    });
    return res.json(all);
  }
}

export default withVoid(handler);
