import { Client, MessageEmbed, TextChannel } from 'discord.js';
import config from '../../src/lib/config';
import { name, version } from '../../package.json';
import { avatarUrl } from '../twilight';
import { defaultEmbed } from '../utils/utils';

export class Logger {
  channel: TextChannel;
  client: Client;

  constructor(client: Client) {
    if (!config.bot.log_channel) return;
    this.client = client;
    this.channel = client.channels.cache.find(c => c.type === 'text' && c.id === config.bot.log_channel) as TextChannel;
  }

  logFile(file: any, user: any) {

  }

  logUrl(url: any, user: any) {
    
  }

  log(msg: string) {
    if (!this.channel) return;
    this.channel.send(defaultEmbed().setTitle(msg))
  }
}
