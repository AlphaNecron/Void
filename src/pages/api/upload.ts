import { writeFile } from 'fs/promises';
import cfg from 'lib/config';
import generate, { emoji, zws } from 'lib/generators';
import { info } from 'lib/logger';
import { NextApiReq, NextApiRes, withDraconic } from 'lib/middleware/withDraconic';
import mimetypes from 'lib/mimetype';
import prisma from 'lib/prisma';
import multer from 'multer';
import { join } from 'path';

const uploader = multer({
  storage: multer.memoryStorage(),
});

async function handler(req: NextApiReq, res: NextApiRes) {
  if (req.method !== 'POST') return res.forbid('Invalid method');
  if (!req.headers.token) return res.forbid('Unauthorized');
  const user = await prisma.user.findFirst({
    where: {
      token: req.headers.token
    }
  });
  if (!user) return res.forbid('Unauthorized');
  if (!req.file) return res.error('No file specified');
  const ext = req.file.originalname.includes('.') ? req.file.originalname.split('.').pop() : req.file.originalname;
  if (cfg.uploader.blacklisted.includes(ext)) return res.error('Blacklisted extension received: ' + ext);
  const rand = generate(cfg.uploader.length);
  let slug;
  switch (req.headers.generator) {
  case 'zws': {
    slug = zws(cfg.uploader.length);
    break;
  }
  case 'emoji': {
    slug = emoji(cfg.uploader.length);
    break;
  }
  default: {
    slug = rand;
    break;
  }
  }
  const deletionToken = generate(15);
  function getMimetype(current, ext) {
    if (current === 'application/octet-stream') {
      if (mimetypes[`.${ext}`]) {
        return mimetypes[`.${ext}`];
      }
      return current;
    }
    return current;
  }
  const file = await prisma.file.create({
    data: {
      slug,
      origFileName: req.headers.preservefilename ? req.file.originalname : `${rand}.${ext}`,
      fileName: `${rand}.${ext}`,
      mimetype: getMimetype(req.file.mimetype, ext),
      userId: user.id,
      deletionToken
    }
  });
  await writeFile(join(process.cwd(), cfg.uploader.directory, file.fileName), req.file.buffer);
  info('FILE', `User ${user.username} (${user.id}) uploaded a file: ${file.fileName} (${file.id})`);
  const baseUrl = `http${cfg.core.secure ? 's' : ''}://${req.headers.host}`;
  return res.json({
    url: `${baseUrl}/${file.slug}`,
    deletionUrl: `${baseUrl}/api/delete?token=${deletionToken}`,
    thumbUrl: `${baseUrl}/raw/${file.fileName}`
  });
}

function run(middleware: any) {
  return (req, res) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result) => {
        if (result instanceof Error) reject(result);
        resolve(result);
      });
    });
}

export default async function handlers(req, res) {
  await run(uploader.single('file'))(req, res);
  return withDraconic(handler)(req, res);
};

export const config = {
  api: {
    bodyParser: false,
  },
};