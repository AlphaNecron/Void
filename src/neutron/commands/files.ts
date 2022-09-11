import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} from 'discord.js';
import config from 'lib/config';
import prisma from 'lib/prisma';
import type {NeutronCommand} from 'neutron/types';

export default {
  name: 'files',
  description: 'View your files',
  type: 'command',
  async execute(context, user) {
    const files = await prisma.file.findMany({
      where: {
        userId: user.id
      },
      select: {
        fileName: true,
        slug: true
      }
    });
    if (!files || files.length === 0) await context.whisper('You have not uploaded any files!');
    else {
      let page = 0;
      const maxPage = Math.ceil(files.length / 8) - 1;
      const createRow = () => new ActionRowBuilder<ButtonBuilder>()
        .setComponents(
          new ButtonBuilder()
            .setCustomId('filesPrev')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page <= 0),
          new ButtonBuilder()
            .setCustomId('filesNext')
            .setLabel('Next')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page >= maxPage)
        );
      const buildEmbed = () => new EmbedBuilder()
        .setTitle('Your files')
        .addFields(files.slice(page * 8, Math.min(files.length, (page + 1) * 8)).map(file => ({
          name: file.fileName,
          value: `[View](${config.void.defaultDomain}/${file.slug})`
        })))
        .setFooter({text: `Page ${page + 1} / ${maxPage + 1}`});
      const filter = i => i.customId === 'filesNext' || i.customId === 'filesPrev';
      const collector = context.channel.createMessageComponentCollector({filter, time: 15000});
      await context.whisper({embeds: [buildEmbed()], components: [createRow()]});
      collector.on('collect', async i => {
        if (i.customId === 'filesNext' && page < maxPage)
          page++;
        else if (i.customId === 'filesPrev' && page > 0)
          page--;
        await i.update({embeds: [buildEmbed()], components: [createRow()]});
      });
    }
  }
} as NeutronCommand;
