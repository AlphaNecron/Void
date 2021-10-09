import { Client, MessageEmbed, TextChannel } from 'discord.js';
import config from '../../src/lib/config';
import { name, version } from '../../package.json';
import { avatarUrl } from '../twilight';
import { defaultEmbed } from '../utils/utils';
import prisma from '../../src/lib/prisma';

export class Logger {
  channel: TextChannel;
  client: Client;

  constructor(client: Client) {
    if (!config.bot.log_channel) return;
    this.client = client;
    this.channel = client.channels.cache.find(c => c.type === 'text' && c.id === config.bot.log_channel) as TextChannel;
  }

  logFile(file: { id, fileName, origFileName, mimetype, uploadedAt, slug }, username: string) {
    if (!this.channel) return;
    this.channel.send(defaultEmbed(`By ${username}`)
      .setTitle('File uploaded')
      .setThumbnail(`http${config.core.secure ? 's' : ''}://${config.bot.hostname}/${file.fileName}`)
      .addField('ID', file.id)
      .addField('File name', file.fileName)
      .addField('Original file name', file.origFileName || 'None')
      .addField('Mime type', file.mimetype)
      .addField('Uploaded at', file.uploadedAt)
      .addField('View', `http${config.core.secure ? 's' : ''}://${config.bot.hostname}${config.uploader.raw_route}/${file.fileName}`));
  }

  logUser(action: 'create' | 'update' | 'delete', user: { id, username, isAdmin }) {
    if (!this.channel) return;
    this.channel.send(defaultEmbed()
      .setTitle(`User ${action}d`)
      .addField('ID', user.id)
      .addField('Username', user.username)
      .addField('Role', user.isAdmin ? 'Administrator' : 'User'));
  }

  logUrl(url: { id, short, destination, createdAt, password }, username: string) {
    if (!this.channel) return;
    this.channel.send(defaultEmbed(`By ${username}`)
      .setTitle('URL shortened')
      .addField('ID', url.id)
      .addField('Destination', url.destination)
      .addField('Created at', url.createdAt)
      .addField('Has password', url.password ? 'yes' : 'no')
      .addField('Go', `http${config.core.secure ? 's' : ''}://${config.bot.hostname}${config.shortener.route}/${url.short}`));
  }

  log(msg: string) {
    if (!this.channel) return;
    this.channel.send(defaultEmbed().setTitle(msg))
  }
}
