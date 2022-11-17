import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from 'discord.js';
import type {NeutronCommand} from 'neutron/types';

export default {
  name: 'upload',
  description: 'Upload a new file',
  requiresAdmin: true,
  async execute(context) {
    /*const makeOpts = (...values: string[][]) =>
      values.map(([label, value, description]) => ({
        label,
        value,
        description
      }));*/
    const url = new TextInputBuilder()
      .setCustomId('url')
      .setLabel('URL to file')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    /*const urlType = new SelectMenuComponent()
      .setCustomId('urlType')
      .setPlaceholder('Please select one!')
      .addOptions(...makeOpts(['Invisible', 'invisible'], ['Emoji', 'emoji'], ['Alphanumeric', 'alphanumeric']));
    const flags = new SelectMenuComponent()
      .setCustomId('flags')
      .setPlaceholder('Flags')
      .addOptions(...makeOpts(
        ['Exploding', 'exploding', 'The file will delete itself after being viewed for the first time.'],
        ['Private', 'private', 'Only you can view this file.']))
      .setMinValues(0)
      .setMaxValues(2);*/
    const modal = new ModalBuilder()
      .setCustomId('uploadModal')
      .setTitle('Upload')
      .addComponents(new ActionRowBuilder<TextInputBuilder>().setComponents(url));
    await context.showModal(modal);
  }
} as NeutronCommand;
