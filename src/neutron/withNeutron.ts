import type {Interaction} from 'discord.js';
import {hasPermission, isAdmin, Permission} from 'lib/permission';
import type {Context} from 'neutron/types';

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
      const discordUser = await prisma.discord.findUnique({
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
    handler(ctx);
  };
}
