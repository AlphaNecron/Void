import { Message, MessageEmbed } from 'discord.js';
import { join } from 'path';
import config from '../../src/lib/config';
import prisma from '../../src/lib/prisma';
import { bytesToHr, sizeOfDir } from '../../src/lib/utils';

const stats = {
  command: 'stats',
  description: 'View server stats',
  syntax: '{PREFIX}stats',
  scopes: ['dm', 'text'],
  execute: async (msg: Message) => {
    const size = await sizeOfDir(join(process.cwd(), config.uploader.directory));
    const userCount = await prisma.user.count();
    const fcount = await prisma.file.count();
    const ucount = await prisma.url.count();
    const viewCount = await prisma.file.groupBy({
      by: ['views'],
      _sum: {
        views: true
      }
    });
    await msg.channel.send(new MessageEmbed().addFields(
      { name: 'Size', value: bytesToHr(size) },
      { name: 'Average size', value: bytesToHr(isNaN(size / fcount) ? 0 : size / fcount) },
      { name: 'File count', value: fcount },
      { name: 'URL count', value: ucount },
      { name: 'User count', value: userCount },
      { name: 'View count', value: viewCount[0]?._sum?.views ?? 0 }
    ).setAuthor('Server stats').setTimestamp().setColor('#B794F4'));
  }
};

export default stats;