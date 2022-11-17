import { rm } from 'fs/promises';
import internal from 'void/internal';
import { hasPermission, highest, Permission } from 'lib/permission';
import { VoidRequest, VoidResponse, withVoid } from 'middleware/withVoid';
import { join, resolve } from 'path';

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
    const target = await internal.prisma.user.findUnique({
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
    await internal.prisma.user.delete({
      where: {
        id: target.id
      }
    });
    const uploadDir = resolve(internal.config.void.upload.outputDirectory);
    await rm(join(uploadDir, 'avatars', target.id), {
      force: true
    });
    await rm(join(uploadDir, target.id), {
      force: true
    });
    return res.success();
  }
  case 'GET': {
    const all = await internal.prisma.user.findMany({
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
