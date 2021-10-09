import { Message, MessageEmbed } from 'discord.js';
import prisma from '../../src/lib/prisma';
import { pagify } from '../utils/utils';
import config from '../../src/lib/config';

const users = {
  command: 'users',
  description: 'View users',
  syntax: '{PREFIX}users',
  scopes: ['dm', 'text'],
  execute: async (msg: Message) => {
    const all = (await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        isAdmin: true
      }
    }) as any[]).map(user => ({
      name: user.username,
      value:
        `
        ID: ${user.id}
        Admin: ${user.isAdmin ? 'yes' : 'no'}
        `
    }));
    pagify('Users', all, msg)();
  }
};

export default users;