import { Message, MessageEmbed } from 'discord.js';
import prisma from '../../src/lib/prisma';
import { createToken, hashPassword } from '../../src/lib/utils';
import { logger } from '../index';

const user = {
  command: 'user',
  description: 'Create a new user or delete an existing user',
  syntax: '{PREFIX}user create <username> <password>\n{PREFIX}user delete <id>',
  scopes: ['dm'],
  execute: async (msg: Message, args: string[]) => {
    const action = args[0];
    if (!['create','delete'].includes(action)) {
      return msg.channel.send('Invalid action');
    }
    switch (action) {
    case 'create': {
      const username = args[1];
      const password = args[2];
      const existing = await prisma.user.findFirst({
        where: {
          username
        }
      });
      if (!username) return msg.channel.send('Please provide a username');
      if (!password) return msg.channel.send('Please provide a password');
      if (existing) return msg.channel.send('Username is already taken');
      const hashed = await hashPassword(password);
      const newUser = await prisma.user.create({
        data: {
          username,
          token: createToken(),
          password: hashed,
        }
      });
      const embed = new MessageEmbed()
        .setTitle('Created a new user')
        .setColor('#B794F4')
        .addFields(
          { name: 'id', value: newUser.id },
          { name: 'Username', value: newUser.username }
        );
      logger.log();
      msg.channel.send(embed.addField('Token', newUser.token)); 
    }
    case 'delete': {
      const id = parseInt(args[1]);
      if (!id || isNaN(id)) return msg.channel.send('Please specify a valid ID');
      let userToDelete;
      try {
        userToDelete = await prisma.user.delete({
          where: {
            id
          }
        });
      }
      catch (err) { return msg.channel.send(`Failed to delete user with id: ${id}\nError: ${err.meta?.cause}`); }
      const embed = new MessageEmbed()
        .setTitle('Deleted user')
        .setColor('#B794F4')
        .setFooter(`By: ${msg.author.username}#${msg.author.discriminator}`)
        .addField('Username', userToDelete.username, true);
      logger.log(embed);
      msg.channel.send(embed);
    }
    }
  }
};

export default user;