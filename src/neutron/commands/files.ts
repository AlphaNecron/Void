import {MessageActionRow, MessageButton, MessageEmbed} from 'discord.js';
import config from 'lib/config';
import prisma from 'lib/prisma';
import type {NeutronCommand} from 'neutron/types';

export default {
  name: 'files',
  description: 'View your files',
  type: 'command',
  async execute(interaction, user) {
    const files = await prisma.file.findMany({
      where: {
        userId: user.id
      },
      select: {
        fileName: true,
        slug: true
      }
    });
    if (!files || files.length === 0) return await interaction.reply({
      content: 'You do not have any files!',
      ephemeral: true
    });
    let page = 0;
    const maxPage = Math.ceil(files.length / 8) - 1;
    const createRow = () => new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('filesPrev')
          .setLabel('Previous')
          .setStyle('PRIMARY')
          .setDisabled(page <= 0),
        new MessageButton()
          .setCustomId('filesNext')
          .setLabel('Next')
          .setStyle('PRIMARY')
          .setDisabled(page >= maxPage)
      );
    const buildEmbed = () => new MessageEmbed()
      .setTitle('Your files')
      .addFields(files.slice(page * 8, Math.min(files.length, (page + 1) * 8)).map(file => ({
        name: file.fileName,
        value: `[View](${config.void.defaultDomain}/${file.slug})`
      })))
      .setFooter({text: `Page ${page + 1} / ${maxPage + 1}`});
    const filter = i => i.customId === 'filesNext' || i.customId === 'filesPrev';
    const collector = interaction.channel.createMessageComponentCollector({filter, time: 15000});
    await interaction.reply({embeds: [buildEmbed()], components: [createRow()], ephemeral: true});
    collector.on('collect', async i => {
      if (i.customId === 'filesNext' && page < maxPage)
        page++;
      else if (i.customId === 'filesPrev' && page > 0)
        page--;
      await i.update({embeds: [buildEmbed()], components: [createRow()]});
    });
  }
} as NeutronCommand;
