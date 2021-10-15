import { Message } from 'discord.js';
import { writeFile } from 'fs/promises';
import fetch from 'node-fetch';
import { extname, join } from 'path';
import url from 'url';
import config from '../../src/lib/config';
import generate, { emoji, zws } from '../../src/lib/generators';
import { info, error } from '../../src/lib/logger';
import mimetypes from '../../src/lib/mimetypes';
import prisma from '../../src/lib/prisma';
import schemify from 'url-schemify';

const upload = {
  command: 'upload',
  description: 'Upload a new file',
  syntax: '{PREFIX}upload <url> [generator]',
  execute: async (msg: Message, args: string[]) => {
    if (!args[0]) return msg.channel.send('No URL.');
    let buffer, res;
    try {
      res = await fetch(schemify(args[0]));
      if (!res.ok) return msg.channel.send('Unable to fetch the file.');
      buffer = await res.buffer();
    }
    catch (e) {
      error('BOT', e.message);
      return msg.channel.send(e.message);
    }
    const fileName = url.parse(args[0]).pathname;
    const ext = extname(fileName);
    const rand = generate(config.uploader.length);
    const slug = args[1] === 'zws' ? zws(config.uploader.length) : args[1] === 'emoji' ? emoji(config.uploader.length) : rand;
    const deletionToken = generate(15);
    function getMimetype(current, ext) {
      if (current === 'application/octet-stream') {
        if (mimetypes[ext]) {
          return mimetypes[ext];
        }
        return current;
      }
      return current;
    }
    const file = await prisma.file.create({
      data: {
        slug,
        origFileName: fileName.split('/').pop(),
        fileName: `${rand}${ext}`,
        mimetype: getMimetype(res.headers.get('Content-Type').trim().split(';').shift(), ext),
        userId: config.bot.default_uid,
        deletionToken
      }
    });
    await writeFile(join(process.cwd(), config.uploader.directory, file.fileName), buffer);
    info('FILE', `User ${msg.author.tag} uploaded a file: ${file.fileName} (${file.id})`);
    global.logger.logFile(file, msg.author.tag);
    msg.channel.send(`http${config.core.secure ? 's' : ''}://${config.bot.hostname}/${file.slug}`);
  }
};

export default upload;