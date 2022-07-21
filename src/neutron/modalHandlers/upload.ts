import {mkdirSync} from 'fs';
import {writeFile} from 'fs/promises';
import config from 'lib/config';
import {getMimetype} from 'lib/mime';
import prisma from 'lib/prisma';
import generate from 'lib/urlGenerator';
import {NeutronModal} from 'neutron/types';
import {getExtension} from 'next/dist/server/serve-static';
import {join, resolve} from 'path';

export default {
  id: 'uploadModal',
  async handle(interaction, user) {
    const url = interaction.fields.getTextInputValue('url');
    const res = await fetch(url);
    const blob = await res.blob();
    const dataChunk = await blob.arrayBuffer();
    const slug = generate('alphanumeric', config.void.url.length);
    const ext = getExtension(blob.type);
    const file = await prisma.file.create({
      data: {
        slug,
        fileName: `unknown.${ext}`,
        mimetype: blob.type === 'application/octet-stream' ? getMimetype(ext) || blob.type : blob.type,
        size: blob.size,
        userId: user.id
      }
    });
    const path = resolve(config.void.upload.outputDirectory, user.id);
    mkdirSync(path, {recursive: true});
    await writeFile(join(path, file.id), Buffer.from(dataChunk));
    await interaction.reply('File uploaded!');
    await interaction.followUp(`${config.void.defaultDomain}/${slug}`);
  }
} as NeutronModal;
