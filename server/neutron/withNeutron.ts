import type {CollectedMessageInteraction, Interaction} from 'discord.js';
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} from 'discord.js';
import {hasPermission, isAdmin, Permission} from 'lib/permission';
import type {Context} from 'neutron/types';
import generate from 'lib/urlGenerator';
import internal from 'void/internal';

export default function withNeutron<T extends Interaction = Interaction>(handler: (context: Context<T>) => Promise<void>): (interaction: T) => void {
  return interaction => {
    const ctx = interaction as Context<T>;
    ctx.whisper = async message => {
      if (interaction.isChatInputCommand()) {
        if (typeof message === 'string')
          return await interaction.reply({content: message, ephemeral: true});
        else return await interaction.reply({...message, ephemeral: true});
      } else return null;
    };
    ctx.getUser = async () => {
      const discordUser = await internal.prisma.discord.findUnique({
        where: {
          id: interaction.user.id
        },
        select: {
          user: {
            select: {
              id: true,
              role: {
                select: {
                  permissions: true
                }
              }
            }
          }
        }
      });
      if (!discordUser) return null;
      const userIsAdmin = isAdmin(discordUser.user.role.permissions);
      return {
        id: discordUser.user.id,
        canUseBot: hasPermission(discordUser.user.role.permissions, Permission.USE_BOT) || userIsAdmin,
        isAdmin: userIsAdmin
      };
    };
    ctx.paginate = async ({getItems, itemBuilder, onButtonInvoked}) => {
      let
        items = await getItems(),
        maxPage = items.length - 1,
        page = 0;
      const
        current = () => items[page],
        prevId = generate('alphanumeric', 6),
        nextId = generate('alphanumeric', 6),
        createRow = () => {
          const row = new ActionRowBuilder<ButtonBuilder>()
            .setComponents(
              new ButtonBuilder()
                .setCustomId(prevId)
                .setLabel('Previous')
                .setEmoji('◀')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page <= 0),
              new ButtonBuilder()
                .setCustomId(nextId)
                .setLabel('Next')
                .setEmoji('▶')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page >= maxPage)
            );
          const item = itemBuilder(current());
          if (item.buttons)
            row.addComponents(item.buttons);
          return row;
        },
        buildEmbed = () => {
          const item = itemBuilder(current());
          return new EmbedBuilder()
            .setTitle(item.title)
            .setFields(item.fields)
            .setThumbnail('https://raw.githubusercontent.com/AlphaNecron/Void/v1/public/banner.png')
            .setFooter({
              text: `Page ${page + 1}/${maxPage + 1}`
            });
        },
        filter = i => i.customId === nextId || i.customId === prevId,
        collector = interaction.channel.createMessageComponentCollector({filter, time: 3e4});
      await ctx.whisper({embeds: [buildEmbed()], components: [createRow()]});
      collector.on('collect', async (i: CollectedMessageInteraction) => {
        if (i.customId === nextId && page < maxPage)
          page++;
        else if (i.customId === prevId && page > 0)
          page--;
        else if (onButtonInvoked)
          onButtonInvoked(i.customId, current(), async () => {
            items = await getItems();
            maxPage = items.length - 1;
            page = Math.min(page, maxPage);
            await i.update({embeds: [buildEmbed()], components: [createRow()]});
          });
        await i.update({embeds: [buildEmbed()], components: [createRow()]});
      });
    };
    handler(ctx);
  };
}
