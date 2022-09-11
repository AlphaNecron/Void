import {mkdirSync} from 'fs';
import {writeFile} from 'fs/promises';
import cfg from 'lib/config';
import {VoidRequest, VoidResponse} from 'lib/middleware/withVoid';
import {getMimetype, isType} from 'lib/mime';
import {hasPermission, Permission} from 'lib/permission';
import prisma from 'lib/prisma';
import generate from 'lib/urlGenerator';
import {withMulter} from 'middleware/withMulter';
import {join, resolve} from 'path';
import sharp from 'sharp';

async function handler(req: VoidRequest, res: VoidResponse) {
  const baseUrl = `http${cfg.void.useHttps ? 's' : ''}://${req.headers.host}`;
  switch (req.method) {
  case 'GET': {
    const user = await req.getUser();
    if (!user) return res.unauthorized();
    const bypass = hasPermission(user.role.permissions, Permission.BYPASS_LIMIT);
    return res.json({
      bypass,
      blacklistedExtensions: cfg.void.upload.blacklistedExtensions,
      maxSize: Number(user.role.maxFileSize),
      maxFileCount: user.role.maxFileCount
    });
  }
  case 'POST': {
    const user = await req.getUser(req.headers.authorization);
    if (!user) return res.unauthorized();
    if (!req.files || req.files.length === 0) return res.error('No files uploaded.');
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
      const ext = f.originalname.split('.').pop();
      const mimetype = f.mimetype === 'application/octet-stream' ? getMimetype(ext) || f.mimetype : f.mimetype;
      const file = await prisma.file.create({
        data: {
          slug,
          fileName: f.originalname,
          // resolves uploads from third party clients
          mimetype,
          isExploding: (req.headers.exploding || 'false') === 'true' && isType('image', mimetype),
          isPrivate: (req.headers.private || 'false') === 'true',
          size: f.size,
          userId: user.id
        }
      });
      const path = resolve(cfg.void.upload.outputDirectory, user.id);
      mkdirSync(path, {recursive: true});
      await writeFile(join(path, file.id), f.buffer);
      if (isType('image', file.mimetype))
        await sharp(f.buffer).resize(475, 125, {
          fit: 'cover'
        }).toFormat('webp').toFile(join(path, `${file.id}.preview`));
      responses.push({
        name: file.fileName,
        url: `${baseUrl}/${file.slug}`,
        deletionUrl: `${baseUrl}/api/delete?token=${file.deletionToken}`,
        thumbUrl: `${baseUrl}/api/file/${file.id}`
      });
    }
    return res.json(responses);
  }
  default: {
    return res.notAllowed();
  }
  }
}

export const config = {
  api: {
    bodyParser: false
  }
};

export default withMulter(handler);
