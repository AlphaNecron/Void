import {hash} from 'argon2';
import logger from 'lib/logger';
import {hasPermission, Permission} from 'lib/permission';
import prisma from 'lib/prisma';
// import { generateToken, hashPassword } from 'lib/utils';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';

function maskEmail(email: string): string {
  const parts = email.split('@');
  const domain = parts.pop();
  const toMask = parts.shift();
  const mLength = Math.ceil(toMask.length * 2/3);
  return '*'.repeat(mLength) + toMask.substring(mLength) + '@' + domain;
}

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser(req.headers.authorization);
  if (!user || !user.role) return res.unauthorized();
  const isAdmin = hasPermission(user.role.permissions, Permission.ADMINISTRATION);
  if (!isAdmin) return res.forbid('You are not an administrator.');
  switch (req.method) {
  case 'DELETE': {
    const {id} = req.body;
    if (!id) return res.forbid('No ID.');
    if (id === user.id) return res.forbid('You can not delete your own user.');
    const target = await prisma.user.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        role: true
      }
    });
    if (!target) return res.notFound('Target user not found.');
    if (user.role.permissions < target.role.permissions || user.role.rolePriority < target.role.rolePriority)
      return res.forbid('You are not allowed to delete this user.');
    break;
  }
  case 'POST': {
    const {username, password} = req.body;
    if (!username) return res.bad('No username was provided');
    if (!password) return res.bad('No password was provided');
    const existing = await prisma.user.findFirst({
      where: {
        username
      }
    });
    if (existing) return res.forbid('Username is already taken');
    const newUser = await prisma.user.create({
      data: {
        password: await hash(password),
        username,
        roleName: 'User'
      }
    });
    delete newUser.password;
    delete newUser.email;
    logger.info('Created a new user.', newUser);
    return res.json(newUser);
  }
  default: {
    const all = await prisma.user.findMany({
      select: {
        username: true,
        name: true,
        email: true,
        image: true,
        id: true,
        embedEnabled: true,
        embedSiteName: true,
        embedColor: true,
        embedTitle: true,
        embedAuthor: true,
        embedAuthorUrl: true
      }
    });
    return res.json(all.map(user => {
      if (user.email)
        user.email = maskEmail(user.email);
      return user;
    }));
  }
  }
}

export default withVoid(handler);
