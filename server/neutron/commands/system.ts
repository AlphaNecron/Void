import {EmbedBuilder, time} from 'discord.js';
import type {NeutronCommand} from 'neutron/types';
import {uptime} from 'os';
import {getRelativeDate} from 'neutron/utils';
import internal from 'void/internal';

export default {
  name: 'system',
  description: 'View system info',
  execute: async function (context) {
    const embed = new EmbedBuilder()
      .setColor('#7289DA')
      .addFields(
        {
          name: 'Node version',
          value: process.version
        },
        {
          name: 'Void version',
          value: `v${internal.server.version}`
        },
        {
          name: 'Neutron version',
          value: `v${internal.neutron.version}`
        },
        {
          name: 'Void uptime',
          value: time(getRelativeDate(-process.uptime() * 1e3), 'R')
        },
        {
          name: 'System uptime',
          value: time(getRelativeDate(-uptime() * 1e3), 'R')
        });
    await context.whisper({embeds: [embed]});
  }
} as NeutronCommand;
