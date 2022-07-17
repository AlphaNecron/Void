import {CommandInteraction} from 'discord.js';
import type {NeutronCommand} from 'neutron/types';

export default {
  name: 'reloadcache',
  description: 'Reload internal user cache',
  requiresAdmin: true,
  async execute(interaction) {
    global.neutron.resetCache();
    return interaction.reply({ content: 'Successfully reloaded internal user cache!', ephemeral: true });
  }
} as NeutronCommand;
