import { Message, MessageEmbed } from 'discord.js';
import { info } from '../../src/lib/logger';
import prisma from '../../src/lib/prisma';
import { generateToken, hashPassword } from '../../src/lib/utils';
import { defaultEmbed } from '../utils/utils';

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
      const [_, username, password] = args;
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
          token: generateToken(),
          password: hashed,
        }
      });
      const embed = defaultEmbed()
        .addFields(
          { name: 'id', value: newUser.id },
          { name: 'Username', value: newUser.username }
        );
      global.logger.log(embed);
      msg.channel.send(embed.addField('Token', newUser.token));
      info('USER',`${msg.author.username}#${msg} created a user: ${newUser.username}`);
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
      global.logger.log(`User deleted: ${userToDelete.username} (${userToDelete.id})`);
      msg.channel.send(defaultEmbed()
        .setTitle('User deleted')
        .setFooter(`By: ${msg.author.tag}`)
        .setFooter(`By: ${msg.author.tag}`)
        .addField('Username', userToDelete.username, true));
      info('USER',`${msg.author.tag} deleted a user: ${userToDelete.username} (${userToDelete.id})`);
    }
    }
  }
};

export default user;