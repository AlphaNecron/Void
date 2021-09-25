import { Message, MessageEmbed } from 'discord.js';
import prisma from '../../src/lib/prisma';
import { createToken, hashPassword } from '../../src/lib/utils';
import { logger } from '../index';

const createUser = {
  command: 'createuser',
  description: 'Create a new user',
  syntax: '{PREFIX}createuser <username> <password>',
  scopes: ['dm'],
  execute: async (msg: Message, args: string[]) => {
    const username = args[0];
    const password = args[1];
    if (!username) return msg.reply('Please provide a username');
    if (!password) return msg.reply('Please provide a password');
    const existing = await prisma.user.findFirst({
      where: {
        username
      }
    });
    if (existing) return msg.reply('Username is already taken');
    const hashed = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        username,
        token: createToken(),
        password: hashed,
      }
    });
    logger.log(new MessageEmbed()
      .setTitle('Created a new user')
      .setColor('#B794F4')
      .addFields(
        { name: 'id', value: newUser.id, inline: true },
        { name: 'Username', value: newUser.username, inline: true }
      ));
    msg.channel.send(new MessageEmbed()
      .setTitle('Created a new user')
      .setColor('#B794F4')
      .addFields(
        { name: 'id', value: newUser.id, inline: true },
        { name: 'Username', value: newUser.username, inline: true },
        { name: 'Token', value: newUser.token, inline: true }
      ));
  }
};

export default createUser;