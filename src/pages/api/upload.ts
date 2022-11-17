import { mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import internal from 'void/internal';
import { VoidRequest, VoidResponse } from 'lib/middleware/withVoid';
import { getMimetype, isType } from 'lib/mime';
import { hasPermission, Permission } from 'lib/permission';
import generate from 'lib/urlGenerator';
import { withMulter } from 'middleware/withMulter';
import { join, resolve } from 'path';
import sharp from 'sharp';

async function handler(req: VoidRequest, res: VoidResponse) {
  const baseUrl = `http${internal.config.void.useHttps ? 's' : ''}://${req.headers.host}`;
  switch (req.method) {
  case 'GET': {
    const user = await req.getUser();
    if (!user) return res.unauthorized();
    const bypass = hasPermission(user.role.permissions, Permission.BYPASS_LIMIT);
    return res.json({
      bypass,
      blacklistedExtensions: internal.config.void.upload.blacklistedExtensions,
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
      if (req.files.some(file => file.size > user.role.maxFileSize || internal.config.void.upload.blacklistedExtensions.includes(file.originalname.split('.').pop())))
        return res.forbid('Blacklisted extension or file size exceeds allowed.');
      if (req.files.length > user.role.maxFileCount)
        return res.forbid('File count exceeds maximum.');
      if (req.files.map(f => f.size).reduce((x, y) => x + y) > quota.remaining)
        return res.forbid('File size exceeds storage quota.');
    }
    const responses = [];
    for (const f of req.files) {
      let slug = generate('alphanumeric', internal.config.void.url.length);
      if (req.headers.url && ['emoji', 'invisible'].includes(req.headers.url.toString()))
        slug = generate(req.headers.url.toString() as 'invisible' | 'emoji', internal.config.void.url.length);
      const ext = f.originalname.split('.').pop();
      const mimetype = f.mimetype === 'application/octet-stream' ? getMimetype(ext) || f.mimetype : f.mimetype;
      const file = await internal.prisma.file.create({
        data: {
          slug,
          fileName: f.originalname,
          // resolves uploads from third party clients
          mimetype,
          // exploding is not supported for non-image files
          isExploding: (req.headers.exploding || 'false') === 'true' && isType('image', mimetype),
          isPrivate: (req.headers.private || 'false') === 'true',
          size: f.size,
          userId: user.id
        }
      });
      const path = resolve(internal.config.void.upload.outputDirectory, user.id);
      mkdirSync(path, {recursive: true});
      await writeFile(join(path, file.id), f.buffer);
      if (isType('image', file.mimetype) && ['png', 'jpg', 'jpeg', 'tiff'].includes(ext))
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
