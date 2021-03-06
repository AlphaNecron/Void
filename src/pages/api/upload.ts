import { writeFile } from 'fs/promises';
import cfg from 'lib/config';
import generate, { emoji, zws } from 'lib/generators';
import { info } from 'lib/logger';
import { NextApiReq, NextApiRes, withVoid } from 'lib/middleware/withVoid';
import { mimetypes } from 'lib/constants';
import prisma from 'lib/prisma';
import multer from 'multer';
import { join } from 'path';

const uploader = multer({
  storage: multer.memoryStorage(),
});

async function handler(req: NextApiReq, res: NextApiRes) {
  const usr = await req.user();
  if (req.method !== 'POST') return res.forbid('Invalid method');
  if (!(req.headers.authorization || usr)) return res.forbid('Unauthorized');
  const user = usr || await prisma.user.findFirst({
    where: {
      token: req.headers.authorization
    }
  });
  if (!user) return res.forbid('Unauthorized');
  if (!req.file) return res.error('No file specified');
  const ext = req.file.originalname.includes('.') ? req.file.originalname.split('.').pop() : req.file.originalname;
  if (cfg.uploader.blacklisted.includes(ext) && !user.isAdmin) return res.error(`Blacklisted extension received: ${ext}`);
  if (req.file.size > cfg.uploader.max_size && !user.isAdmin) return res.error('The file is too big');
  const rand = generate(cfg.uploader.length);
  const slug = req.headers.generator === 'zws' ? zws(cfg.uploader.length) : req.headers.generator === 'emoji' ? emoji(cfg.uploader.length) : rand;
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
  try {
    global.logger.logFile(file, user.username);
  }
  catch {}
  const baseUrl = `http${cfg.core.secure ? 's' : ''}://${req.headers.host}`;
  return res.json({
    url: `${baseUrl}/${file.slug}`,
    deletionUrl: `${baseUrl}/api/delete?token=${deletionToken}`,
    thumbUrl: `${baseUrl}/${cfg.uploader.raw_route}/${file.fileName}`
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
  return withVoid(handler)(req, res);
};

export const config = {
  api: {
    bodyParser: false,
  },
};
