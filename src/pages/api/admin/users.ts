import {hash} from 'argon2';
import {unlinkSync} from 'fs';
import config from 'lib/config';
import logger from 'lib/logger';
import {hasPermission, Permission} from 'lib/permission';
import prisma from 'lib/prisma';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';
import {resolve} from 'path';

function maskEmail(email: string): string {
  if (!email) return null;
  const parts = email.split('@');
  const domain = parts.pop();
  const toMask = parts.shift();
  const mLength = Math.ceil(toMask.length * 2/3);
  return '*'.repeat(mLength) + toMask.substring(mLength) + '@' + domain;
}

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser(req.headers.authorization);
  if (!user) return res.unauthorized();
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
    await prisma.user.delete({
      where: {
        id: target.id
      }
    });
    unlinkSync(resolve(config.void.upload.outputDirectory, 'avatars', target.id));
    unlinkSync(resolve(config.void.upload.outputDirectory, target.id));
    return res.success();
  }
  case 'POST': {
    const {username, password} = req.body;
    if (!(username && password)) return res.error('Invalid credentials.');
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
    logger.info('Created a new user.');
    return res.json(newUser);
  }
  case 'GET': {
    const all = await prisma.user.findMany({
      orderBy: [
        {
          role: {
            permissions: 'desc'
          }
        },
        {
          role: {
            rolePriority: 'asc'
          }
        }
      ],
      select: {
        username: true,
        name: true,
        email: true,
        id: true,
        embed: true,
        role: true
      }
    });
    return res.json(all.map(usr => ({ ...usr, email: maskEmail(usr.email) })));
  }
  default:
    return res.notAllowed();
  }
}

export default withVoid(handler);
