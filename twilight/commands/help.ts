import { Message, MessageEmbed } from 'discord.js';
import { commands } from '../index';
import config from '../../src/lib/config';

const help = {
  command: 'help',
  description: 'Show this message',
  syntax: '{PREFIX}help',
  scopes: ['dm', 'text'],
  execute: async (msg: Message) => {
    const embed = new MessageEmbed().setTimestamp().setTitle('Help').setColor('#B794F4');
    commands.forEach(command =>
      embed.addField(command.syntax.replaceAll('{PREFIX}', config.bot.prefix),
        command.description));
    await msg.channel.send(embed);
  }
};

export default help;