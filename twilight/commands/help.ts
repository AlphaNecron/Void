import { Message, MessageEmbed } from 'discord.js';
import config from '../../src/lib/config';
import { commands } from '../twilight';
import { defaultEmbed } from '../utils/utils';

const help = {
  command: 'help',
  description: 'Show this message',
  syntax: '{PREFIX}help',
  scopes: ['dm', 'text'],
  execute: async (msg: Message) => {
    const embed = defaultEmbed().setTitle('Help');
    commands.forEach(command =>
      embed.addField(command.syntax.replace(/{PREFIX}/g, config.bot.prefix),
        command.description));
    await msg.channel.send(embed);
  }
};

export default help;