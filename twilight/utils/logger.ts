import { Client, MessageEmbed, TextChannel } from 'discord.js';
import config from '../../src/lib/config';

export class Logger {
  channel: TextChannel;
  
  constructor(client: Client) {
    if (!config.bot.log_channel) return;
    this.channel = client.channels.cache.find(c => c.type === 'text' && c.id === config.bot.log_channel) as TextChannel;
  }

  log(msg: MessageEmbed | string) {
    if (!this.channel) return;
    this.channel.send(msg);
  }
}