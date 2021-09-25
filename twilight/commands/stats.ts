import { bytesToHr, sizeOfDir } from '../../src/lib/utils';
import config from '../../src/lib/config';
import prisma from '../../src/lib/prisma';
import { Message, MessageEmbed } from 'discord.js';
import { join } from 'path';

const stats = {
  command: 'stats',
  description: 'View server stats',
  syntax: '{PREFIX}stats',
  scopes: ['dm', 'text'],
  execute: async (msg: Message) => {
    const size = await sizeOfDir(join(process.cwd(), config.uploader.directory));
    const userCount = await prisma.user.count();
    const count = await prisma.file.count();
    const viewsCount = await prisma.file.groupBy({
      by: ['views'],
      _sum: {
        views: true
      }
    });
    msg.channel.send(new MessageEmbed().addFields(
      { name: 'Size', value: bytesToHr(size) },
      { name: 'Average size', value: bytesToHr(isNaN(size / count) ? 0 : size / count) },
      { name: 'File count', value: count },
      { name: 'User count', value: userCount },
      { name: 'View count', value: viewsCount[0]?._sum?.views ?? 0 }
    ).setAuthor('Server stats').setTimestamp().setColor('#B794F4'));
  }
};

export default stats;