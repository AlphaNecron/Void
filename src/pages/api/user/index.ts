import { info } from 'lib/logger';
import prisma from 'lib/prisma';
import { hashPassword } from 'lib/utils';
import { NextApiReq, NextApiRes, withVoid } from 'middleware/withVoid';

async function handler(req: NextApiReq, res: NextApiRes) {
  const user = await req.user();
  if (!user) return res.forbid('Unauthorized');
  if (req.method === 'PATCH') {
    if (req.body.password) {
      const hashed = await hashPassword(req.body.password);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed }
      });
    }
    if (req.body.username) {
      const existing = await prisma.user.findFirst({
        where: {
          username: req.body.username
        }
      });
      if (existing && user.username !== req.body.username) { 
        return res.forbid('Username is already taken');
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { username: req.body.username }
      });
    }
    if (req.body.useEmbed) await prisma.user.update({
      where: { id: user.id },
      data: { useEmbed: req.body.useEmbed === 'true' }
    });
    if (req.body.embedSiteName) await prisma.user.update({
      where: { id: user.id },
      data: { embedSiteName: req.body.embedSiteName }
    });
    if (req.body.embedTitle) await prisma.user.update({
      where: { id: user.id },
      data: { embedTitle: req.body.embedTitle }
    });
    if (req.body.embedColor) await prisma.user.update({
      where: { id: user.id },
      data: { embedColor: req.body.embedColor }
    });
    if (req.body.embedDesc) await prisma.user.update({
      where: { id: user.id },
      data: { embedDesc: req.body.embedDesc }
    });
    const newUser = await prisma.user.findFirst({
      where: {
        id: +user.id
      },
      select: {
        isAdmin: true,
        useEmbed: true,
        embedSiteName: true,
        embedColor: true,
        embedTitle: true,
        embedDesc: true,
        id: true,
        files: false,
        password: false,
        token: true,
        username: true
      }
    });
    info('USER', `User ${user.username} (${newUser.username}) (${newUser.id}) was updated`);
    return res.json(newUser);
  } else {
    delete user.password;
    return res.json(user);
  }
}

export default withVoid(handler);