import {addToDate} from 'lib/utils';
import type {NeutronCommand} from 'neutron/types';

export default {
  name: 'wave',
  description: 'Create an invite wave',
  async execute(interaction) {
    const users = await prisma.user.findMany({
      select: {
        id: true
      }
    });
    for (const { id } of users) {
      await prisma.user.update({
        where: {
          id
        },
        data: {
          referralCodes: {
            create: {
              expiresAt: addToDate(new Date(), 2592000)
            }
          }
        }
      });
    }
    await interaction.reply(`Successfully granted one invite code to ${users.length} users!`);
  }
} as NeutronCommand;
