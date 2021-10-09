import { Message, MessageEmbed } from 'discord.js';
import prisma from '../../src/lib/prisma';
import { pagify } from '../utils/utils';
import config from '../../src/lib/config';

const files = {
  command: 'files',
  description: 'View files',
  syntax: '{PREFIX}files',
  execute: async (msg: Message) => {
    const all = (await prisma.file.findMany({
      select: {
        id: true,
        fileName: true,
        origFileName: true,
        mimetype: true,
        uploadedAt: true,
        slug: true
      }
    }) as any[]).map(file => ({
      name: file.fileName,
      value:
        `
        ID: ${file.id}
        Original file name: ${file.origFileName}
        Mimetype: ${file.mimetype}
        Uploaded at: ${new Date(file.uploadedAt).toLocaleString()}
        [View](http${config.core.secure ? 's' : ''}://${config.bot.hostname}/${file.slug})
        `
    }));
    pagify('Files', all, msg)();
  }
};

export default files;