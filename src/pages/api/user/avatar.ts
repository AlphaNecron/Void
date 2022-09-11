import {IMAGE_MIME_TYPE} from '@mantine/dropzone';
import {existsSync, readFileSync, unlinkSync} from 'fs';
import cfg from 'lib/config';
import {isAdmin} from 'lib/permission';
import {withMulter} from 'middleware/withMulter';
import {VoidRequest, VoidResponse} from 'middleware/withVoid';
import {resolve} from 'path';
import sharp from 'sharp';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser();
  if (!user) return res.unauthorized();
  const {id} = req.query;
  if (id && isAdmin(user.role.permissions) && req.method === 'GET') {
    const path = resolve(cfg.void.upload.outputDirectory, 'avatars', id.toString());
    if (existsSync(path)) {
      res.setHeader('Content-Type', 'image/webp');
      return res.end(readFileSync(path));
    } else return res.notFound('Avatar for provided user was not found.');
  }
  const path = resolve(cfg.void.upload.outputDirectory, 'avatars', user.id);
  switch (req.method) {
  case 'PATCH': {
    if (!req.file)
      return res.error('No avatar uploaded.');
    if (req.file.size >= 2 * 1048576)
      return res.forbid('File size must not exceed 5 megabytes.');
    await sharp(req.file.buffer, {
      sequentialRead: true
    }).resize(128, 128).toFormat('webp').toFile(path);
    return res.success();
  }
  case 'GET': {
    if (!existsSync(path))
      return res.notFound('Avatar not found.');
    res.setHeader('Content-Type', 'image/webp');
    return res.end(readFileSync(path));
  }
  case 'DELETE': {
    if (!existsSync(path))
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
