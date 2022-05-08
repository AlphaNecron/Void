import {mkdirSync} from 'fs';
import {writeFile} from 'fs/promises';
import cfg from 'lib/config';
import {VoidRequest, VoidResponse, withVoid} from 'lib/middleware/withVoid';
import {getMimetype} from 'lib/mime';
import {hasPermission, Permission} from 'lib/permission';
import prisma from 'lib/prisma';
import generate from 'lib/urlGenerator';
import multer from 'multer';
import {join, resolve} from 'path';

const uploader = multer();

async function handler(req: VoidRequest, res: VoidResponse) {
  if (req.method === 'GET') {
    const user = await req.getUser(req.headers.authorization);
    if (!user || !user.role) return res.unauthorized();
    const quota = await req.getUserQuota(user);
    const bypass = [Permission.BYPASS_LIMIT, Permission.ADMINISTRATION, Permission.OWNER].some(perm => hasPermission(user.role.permissions, perm));
    return res.json({
      bypass,
      blacklistedExtensions: cfg.void.upload.blacklistedExtensions,
      maxSize: Number(user.role.maxFileSize),
      maxFileCount: user.role.maxFileCount,
      quota
    });
  }
  else if (req.method === 'POST') {
    const user = await req.getUser(req.headers.authorization);
    if (!user || !user.role) return res.unauthorized();
    if (!req.files || req.files.length === 0) return res.bad('No files uploaded.');
    const quota = await req.getUserQuota(user);
    if (!hasPermission(user.role.permissions, Permission.BYPASS_LIMIT)) {
      if (req.files.some(file => file.size > user.role.maxFileSize || cfg.void.upload.blacklistedExtensions.includes(file.originalname.split('.').pop())))
        return res.forbid('Blacklisted extension or file size exceeds allowed.');
      if (req.files.length > user.role.maxFileCount)
        return res.forbid('File count exceeds maximum.');
      if (req.files.map(f => f.size).reduce((x, y) => x + y) > quota.remaining)
        return res.forbid('File size exceeds storage quota.');
    }
    const responses = [];
    for (const f of req.files) {
      let slug = generate('alphanumeric', cfg.void.url.length);
      if (req.headers.url && ['emoji', 'invisible'].includes(req.headers.url.toString()))
        slug = generate(req.headers.url.toString() as 'invisible' | 'emoji', cfg.void.url.length);
      const deletionToken = generate('alphanumeric', cfg.void.url.length * 4);
      const ext = f.originalname.split('.').pop();
      const file = await prisma.file.create({
        data: {
          slug,
          fileName: f.originalname,
          // resolves uploading from third party clients
          mimetype: f.mimetype === 'application/octet-stream' ? getMimetype(ext) || f.mimetype : f.mimetype,
          isExploding: (req.headers.exploding || 'false') === 'true',
          isPrivate: (req.headers.private || 'false') === 'true',
          size: f.size,
          userId: user.id,
          deletionToken
        }
      });
      const path = resolve(cfg.void.upload.outputDirectory, user.id);
      mkdirSync(path, { recursive: true });
      await writeFile(join(path, file.id), f.buffer);
      const baseUrl = `http${cfg.void.useHttps ? 's' : ''}://${req.headers.host}`;
      responses.push({
        url: `${baseUrl}/${file.slug}`,
        deletionUrl: `${baseUrl}/api/delete?token=${deletionToken}`,
        thumbUrl: `${baseUrl}/api/file/${file.id}`
      });
    }
    return res.json(responses);
  }
  return res.notAllowed();
}

function run(middleware) {
  return (req, res) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result) => {
        if (result instanceof Error) reject(result);
        resolve(result);
      });
    });
}

export default async function handlers(req: VoidRequest, res: VoidResponse) {
  await run(uploader.array('files'))(req, res);
  return withVoid(handler)(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
