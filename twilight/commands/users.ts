import prisma from '../../src/lib/prisma';
import { Message, MessageEmbed } from 'discord.js';

const users = {
  command: 'users',
  description: 'View user stats',
  syntax: '{PREFIX}users',
  scopes: ['dm', 'text'],
  execute: async (msg: Message) => {
    const all = await prisma.user.findMany({
      select: {
        username: true,
        id: true,
        isAdmin: true
      }
    });
    const embed = new MessageEmbed()
      .setTimestamp()
      .setTitle('Users')
      .setColor('#B794F4')
      .setFooter(`Total: ${all.length}`);
    all.forEach(user => {
      embed.addField(`${user.username}`, `ID: ${user.id}\nAdmin: ${user.isAdmin ? 'yes' : 'no'}`);
    });
    msg.channel.send(embed);
  }
};

export default users;