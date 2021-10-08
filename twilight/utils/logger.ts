import { Client, MessageEmbed, TextChannel } from 'discord.js';
import config from '../../src/lib/config';
import { name, version } from '../../package.json';

export class Logger {
  channel: TextChannel;
  client: Client;

  constructor(client: Client) {
    if (!config.bot.log_channel) return;
    this.client = client;
    this.channel = client.channels.cache.find(c => c.type === 'text' && c.id === config.bot.log_channel) as TextChannel;
  }

  log(msg: MessageEmbed | string) {
    if (!this.channel) return;
    this.channel.send(typeof msg === 'string' ? new MessageEmbed()
      .setTitle(msg)
      .setColor('#B794F4')
      .setTimestamp()
      .setFooter(`${name}@${version}`, this.client.user.displayAvatarURL())
      .setThumbnail(this.client.user.displayAvatarURL()) : msg);
  }
}
