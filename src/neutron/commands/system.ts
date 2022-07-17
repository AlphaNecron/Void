import {MessageEmbed} from 'discord.js';
import type {NeutronCommand} from 'neutron/types';
import {uptime} from 'os';
import pretty from 'pretty-ms';

import {neutronVersion, version} from 'packageInfo';

export default {
  name: 'system',
  description: 'View system info',
  async execute(interaction) {
    const vUptime = pretty(process.uptime() * 1e3, {secondsDecimalDigits: 0});
    const up = pretty(uptime() * 1e3, {secondsDecimalDigits: 0});
    const embed = new MessageEmbed()
      .setColor('#7289DA')
      .addFields(
        {
          name: 'Node version',
          value: process.version
        },
        {
          name: 'Void version',
          value: `v${version}`
        },
        {
          name: 'Neutron version',
          value: `v${neutronVersion}`
        },
        {
          name: 'Void uptime',
          value: vUptime},
        {
          name: 'System uptime',
          value: up
        });
    await interaction.reply({embeds: [embed]});
  }
} as NeutronCommand;
