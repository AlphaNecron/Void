import {MessageActionRow, MessageSelectMenu, Modal, ModalActionRowComponent, TextInputComponent} from 'discord.js';
import type {NeutronCommand} from 'neutron/types';

export default {
  name: 'upload',
  description: 'Upload a new file',
  async execute(interaction) {
    const makeOpts = (...values: string[][]) =>
      values.map(([label, value, description]) => ({
        label,
        value,
        description
      }));
    const url = new TextInputComponent()
      .setCustomId('url')
      .setLabel('URL to file')
      .setStyle('SHORT')
      .setRequired(true);
    const urlType = new MessageSelectMenu()
      .setCustomId('urlType')
      .setPlaceholder('Please select one!')
      .addOptions(makeOpts(['Invisible', 'invisible'], ['Emoji', 'emoji'], ['Alphanumeric', 'alphanumeric']));
    const flags = new MessageSelectMenu()
      .setCustomId('flags')
      .setPlaceholder('Flags')
      .addOptions(makeOpts(
        ['Exploding', 'exploding', 'The file will delete itself after being viewed for the first time.'],
        ['Private', 'private', 'Only you can view this file.']))
      .setMinValues(0)
      .setMaxValues(2);
    const row1 = new MessageActionRow<ModalActionRowComponent>().addComponents(url);
    const row2 = new MessageActionRow<ModalActionRowComponent>().addComponents(urlType);
    const row3 = new MessageActionRow<ModalActionRowComponent>().addComponents(flags);
    const modal = new Modal()
      .setCustomId('uploadModal')
      .setTitle('Upload');
    modal.addComponents(row1, row2, row3);
    await interaction.showModal(modal);
  }
} as NeutronCommand;
