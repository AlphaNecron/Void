import { Message } from 'discord.js';
import schemify from 'url-schemify';
import config from '../../src/lib/config';
import generate from '../../src/lib/generators';
import { info } from '../../src/lib/logger';
import prisma from '../../src/lib/prisma';

const shorten = {
  command: 'shorten',
  description: 'Shorten a URL',
  syntax: '{PREFIX}shorten <url> [vanity]',
  scopes: ['dm', 'text'],
  execute: async (msg: Message, args: string[]) => {
    const dest = args[0];
    const vanity = args[1];
    if (!dest) return msg.channel.send('Please specify a URL to shorten');
    if (!dest.includes('.')) return msg.channel.send('Please specify a valid URL.');
    if (vanity) {
      const existing = await prisma.url.findFirst({
        where: {
          short: vanity
        }
      });
      if (existing) {
        return msg.reply('Vanity is already taken');
      }
    }
    const user = await prisma.user.findFirst({
      where: {
        id: 1
      },
    });
    const rand = generate(config.shortener.length);
    const url = await prisma.url.create({
      data: {
        short: vanity ? vanity : rand,
        destination: schemify(dest),
        userId: config.bot.default_uid,
      },
    });
    info('URL', `User ${msg.author.username}#${msg.author.discriminator} shortened a URL: ${url.destination} (${url.id})`);
    global.logger.log(`User ${msg.author.username}#${msg.author.discriminator} shortened a URL: ${url.destination} (${url.id})`);
    msg.channel.send(`http${config.core.secure ? 's' : ''}://${config.bot.hostname}${config.shortener.route}/${url.short}`);
  }
};

export default shorten;