import {resolve} from 'path';
import {readFileSync} from 'fs';
import {VoidRequest, VoidResponse, withVoid} from 'lib/middleware/withVoid';
import config from 'lib/config';
import prisma from 'lib/prisma';

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
      user: true
    }
  });
  if (file) {
    if (file.isPrivate) {
      const user = await req.getUser(req.headers.authorization);
      if (!user) return res.unauthorized();
    }
    if (file.isExploding) {
      const user = await req.getUser(req.headers.authorization);
      if (user?.id !== file.user.id) return res.forbid('Exploding image.');
    }
    res.setHeader('Content-Type', file.mimetype);
    let data;
    try {
      data = readFileSync(resolve(config.void.file.outputDirectory, file.user.id, file.id));
    }
    catch {
      if (!data) return res.notFound('File cannot be read.');
    }
    res.setHeader('Content-Length', Number(file.size));
    res.setHeader('Content-Disposition', `filename="${file.fileName}"`);
    res.end(data);
  } else {
    return res.notFound('File not found.');
  }
}

export default withVoid(handler);
