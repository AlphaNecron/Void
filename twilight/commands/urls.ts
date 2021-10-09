import { Message, MessageEmbed } from 'discord.js';
import prisma from '../../src/lib/prisma';
import { pagify } from '../utils/utils';
import config from '../../src/lib/config';

const urls = {
  command: 'urls',
  description: 'View urls',
  syntax: '{PREFIX}urls',
  scopes: ['dm', 'text'],
  execute: async (msg: Message) => {
    const all = (await prisma.url.findMany({
      select: {
        id: true,
        short: true,
        destination: true,
        createdAt: true,
        password: true
      }
    }) as any[]).map(url => ({
      name: url.short,
      value:
        `
        ID: ${url.id}
        Destination: ${url.destination}
        Created at: ${new Date(url.createdAt).toLocaleString()}
        Has password: ${url.password ? 'yes' : 'no'}
        [Go](http${config.core.secure ? 's' : ''}://${config.bot.hostname}${config.shortener.route}/${url.short})
        `
    }));
    pagify('URLs', all, msg)();
  }
};

export default urls;