import {IMAGE_MIME_TYPE} from '@mantine/dropzone';
import {existsSync, readFileSync, unlinkSync, writeFileSync} from 'fs';
import cfg from 'lib/config';
import {isAdmin} from 'lib/permission';
import prisma from 'lib/prisma';
import {withMulter} from 'middleware/withMulter';
import {VoidRequest, VoidResponse} from 'middleware/withVoid';
import {resolve} from 'path';

// TODO: optimize image before writing, convert it to webp.

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser();
  if (!user) return res.unauthorized();
  const { id } = req.query;
  if (id && isAdmin(user.role.permissions) && req.method === 'GET') {
    const avatar = await prisma.avatar.findUnique({
      where: {
        userId: id.toString()
      }
    });
    const path = resolve(cfg.void.upload.outputDirectory, 'avatars', avatar.userId);
    if (avatar && existsSync(path)) {
      res.setHeader('Content-Type', avatar.mimetype);
      return res.end(readFileSync(path));
    } else return res.notFound('Avatar for provided it was not found.');
  }
  const path = resolve(cfg.void.upload.outputDirectory, 'avatars', user.id);
  switch (req.method) {
  case 'POST': {
    if (!req.file)
      return res.error('No avatar uploaded.');
    if (req.file.size >= 5 * 1048576)
      return res.forbid('File size must not exceed 5 megabytes.');
    writeFileSync(path, req.file.buffer);
    await prisma.avatar.upsert({
      where: {
        userId: user.id
      },
      update: {
        mimetype: req.file.mimetype
      },
      create: {
        mimetype: req.file.mimetype,
        userId: user.id
      }
    });
    return res.success();
  }
  case 'GET': {
    const avatar = await prisma.avatar.findUnique({
      where: {
        userId: user.id
      }
    });
    if (!(avatar && existsSync(path)))
      return res.notFound('Avatar not found.');
    res.setHeader('Content-Type', avatar.mimetype);
    return res.end(readFileSync(path));
  }
  case 'DELETE': {
    const avatar = await prisma.avatar.delete({
      where: {
        userId: user.id
      }
    });
    if (!(avatar && existsSync(path)))
      return res.notFound('Avatar not found.');
    unlinkSync(resolve(cfg.void.upload.outputDirectory, 'avatars', user.id));
    return res.success();
  }
  default:
    return res.notAllowed();
  }
}

export const config = {
  api: {
    bodyParser: false,
  }
};


export default withMulter(handler, false, IMAGE_MIME_TYPE);
