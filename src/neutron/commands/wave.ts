import {addToDate} from 'lib/utils';
import type {NeutronCommand} from 'neutron/types';

export default {
  name: 'wave',
  description: 'Create an invite wave',
  async execute(interaction) {
    const users = await prisma.user.findMany({
      where: {
        role: {
          maxRefCodes: {
            gt: 0
          }
        }
      },
      select: {
        referralCodes: {
          where: {
            consumedBy: {
              not: null
            }
          },
          select: {
            expiresAt: true
          }
        },
        role: {
          select: {
            maxRefCodes: true
          }
        },
        id: true
      }
    });
    const current = new Date();
    const date = addToDate(current, 2592000);
    const eligible = users.filter(user => user.referralCodes.filter(ref => ref.expiresAt.getTime() > current.getTime()).length < user.role.maxRefCodes);
    for (const { id } of eligible) {
      await prisma.user.update({
        where: {
          id
        },
        data: {
          referralCodes: {
            create: {
              expiresAt: date
            }
          }
        }
      });
    }
    await interaction.reply(`Successfully granted one invite code to ${eligible.length} users!`);
  }
} as NeutronCommand;
