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
  execute: async (msg: Message, args: string[]) => {
    const [dest, vanity] = args;
    if (!dest) return msg.channel.send('Please specify a URL to shorten');
    if (!dest.match(/((?:(?:http?|ftp)[s]*:\/\/)?[a-z0-9-%\/\&=?\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?)/i)) return msg.channel.send('Please specify a valid URL.');
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
      }
    });
    const url = await prisma.url.create({
      data: {
        short: vanity ?? generate(config.shortener.length),
        destination: schemify(dest),
        userId: config.bot.default_uid,
      }
    });
    info('URL', `User ${msg.author.tag} shortened a URL: ${url.destination} (${url.id})`);
    global.logger.logUrl(url, msg.author.tag);
    msg.channel.send(`http${config.core.secure ? 's' : ''}://${config.bot.hostname}${config.shortener.route}/${url.short}`);
  }
};

export default shorten;