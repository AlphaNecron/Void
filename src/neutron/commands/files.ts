import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, time} from 'discord.js';
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
        slug: true,
        uploadedAt: true
      }
    });
    if (!files || files.length === 0) await context.whisper('You have not uploaded any files!');
    else {
      let page = 0;
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
            .setDisabled(page >= files.length)
        );
      const buildEmbed = () => new EmbedBuilder()
        .setTitle(files[page].fileName)
        .addFields({
          name: 'Uploaded at',
          value: time(files[page].uploadedAt)
        })
        .setFooter({text: `File ${page + 1} / ${files.length + 1}`});
      const filter = i => i.customId === 'filesNext' || i.customId === 'filesPrev';
      const collector = context.channel.createMessageComponentCollector({filter, time: 15000});
      await context.whisper({embeds: [buildEmbed()], components: [createRow()]});
      collector.on('collect', async i => {
        if (i.customId === 'filesNext' && page < files.length)
          page++;
        else if (i.customId === 'filesPrev' && page > 0)
          page--;
        await i.update({embeds: [buildEmbed()], components: [createRow()]});
      });
    }
  }
} as NeutronCommand;
