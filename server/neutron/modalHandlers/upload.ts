import {mkdirSync} from 'fs';
import {writeFile} from 'fs/promises';
import internal from 'void/internal';
import {getMimetype} from 'lib/mime';
import generate from 'lib/urlGenerator';
import {NeutronModal} from 'neutron/types';
import {getExtension} from 'next/dist/server/serve-static';
import {join, resolve} from 'path';

export default {
  id: 'uploadModal',
  async handle(context, user) {
    const url = context.fields.getTextInputValue('url');
    const res = await fetch(url);
    if (res.ok) {
      const blob = await res.blob();
      const dataChunk = await blob.arrayBuffer();
      const slug = generate('alphanumeric', internal.config.void.url.length);
      const ext = getExtension(blob.type);
      const file = await internal.prisma.file.create({
        data: {
          slug,
          fileName: `unknown.${ext}`,
          mimetype: blob.type === 'application/octet-stream' ? getMimetype(ext) || blob.type : blob.type,
          size: blob.size,
          userId: user.id
        }
      });
      const path = resolve(internal.config.void.upload.outputDirectory, user.id);
      mkdirSync(path, {recursive: true});
      await writeFile(join(path, file.id), Buffer.from(dataChunk));
      await context.reply('File uploaded!');
      await context.followUp(`${internal.config.void.defaultDomain}/${slug}`);
    }
  }
} as NeutronModal;
