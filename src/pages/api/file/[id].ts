import {readFileSync} from 'fs';
import {rm} from 'fs/promises';
import cfg from 'lib/config';
import {VoidRequest, VoidResponse, withVoid} from 'lib/middleware/withVoid';
import {isType} from 'lib/mime';
import prisma from 'lib/prisma';
import {resolve} from 'path';

async function handler(req: VoidRequest, res: VoidResponse) {
  const fileId = req.query.id.toString();
  if (!fileId || fileId.trim() === '') return;
  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
    },
    select: {
      id: true,
      fileName: true,
      mimetype: true,
      size: true,
      isPrivate: true,
      isExploding: true,
      user: true,
      views: true
    }
  });
  if (file) {
    if (file.isPrivate) {
      const user = await req.getUser(req.headers.authorization);
      if (!user) return res.unauthorized();
    }
    else if (file.isExploding) {
      if (file.views === 0) {
        const user = await req.getUser(req.headers.authorization);
        if (user?.id !== file.user.id) return res.forbid('Exploding image.');
      }
    }
    res.setHeader('Content-Type', file.mimetype);
    let data;
    try {
      data = readFileSync(resolve(cfg.void.upload.outputDirectory, file.user.id, file.id));
    }
    catch {
      if (!data) return res.notFound('File cannot be read.');
    }
    res.setHeader('Content-Length', Number(file.size));
    res.setHeader('Content-Disposition', `filename="${file.fileName}"`);
    if (file.isExploding && file.views > 0) {
      const path = resolve(cfg.void.upload.outputDirectory, file.user.id, file.id);
      await prisma.file.delete({
        where: {
          id: file.id,
        }
      });
      await rm(path);
    }
    if (isType('video', file.mimetype) || isType('audio', file.mimetype)) {
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Range', 'bytes');
    }
    res.end(data);
  } else {
    return res.notFound('File not found.');
  }
}

export const config = {
  api: {
    responseLimit: false
  }
};

export default withVoid(handler);
