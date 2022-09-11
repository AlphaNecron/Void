import {unlinkSync} from 'fs';
import config from 'lib/config';
import {hasPermission, highest, Permission} from 'lib/permission';
import prisma from 'lib/prisma';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';
import {join, resolve} from 'path';

function maskEmail(email: string): string {
  if (!email) return null;
  const parts = email.split('@');
  const domain = parts.pop();
  const toMask = parts.shift();
  const mLength = Math.ceil(toMask.length * 2 / 3);
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
    if (highest(user.role.permissions) <= highest(target.role.permissions))
      return res.forbid('You are not allowed to delete this user.');
    await prisma.user.delete({
      where: {
        id: target.id
      }
    });
    const uploadDir = resolve(config.void.upload.outputDirectory);
    unlinkSync(join(uploadDir, 'avatars', target.id));
    unlinkSync(join(uploadDir, target.id));
    return res.success();
  }
  case 'GET': {
    const all = await prisma.user.findMany({
      orderBy:
          {
            role: {
              permissions: 'desc'
            }
          },
      select: {
        username: true,
        name: true,
        email: true,
        id: true,
        embed: true,
        role: true
      }
    });
    return res.json(all.map(usr => ({...usr, email: maskEmail(usr.email)})));
  }
  default:
    return res.notAllowed();
  }
}

export default withVoid(handler);
