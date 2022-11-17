import {ButtonBuilder, ButtonStyle, time} from 'discord.js';
import type {NeutronCommand} from 'neutron/types';
import {prettyBytes} from 'lib/utils';
import internal from 'void/internal';

export default {
  name: 'files',
  description: 'View your files',
  type: 'command',
  async execute(context, user) {
    const getItems = async () => await internal.prisma.file.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        fileName: true,
        slug: true,
        uploadedAt: true,
        views: true,
        size: true
      }
    });
    const initialItems = await getItems();
    if (initialItems.length === 0)
      await context.whisper('You have not uploaded any files!');
    else

      await context.paginate({
        getItems,
        initialItems,
        itemBuilder: file => ({
          title: file.fileName,
          fields: [
            {name: 'Size', value: prettyBytes(Number(file.size))},
            {name: 'Uploaded at', value: time(file.uploadedAt)},
            {name: 'Views', value: file.views.toString()}
          ],
          buttons: [
            new ButtonBuilder().setURL(`${internal.config.void.defaultDomain}/${file.slug}`).setStyle(ButtonStyle.Link).setLabel('View'),
            new ButtonBuilder().setEmoji('🗑️').setLabel('Delete').setStyle(ButtonStyle.Danger).setCustomId('deleteFile')
          ]
        }),
        onButtonInvoked(id, file, mutate) {
          if (id === 'deleteFile')
            internal.prisma.file.delete({
              where: {
                id: file.id
              }
            }).finally(mutate);
        }
      });
  }
} as NeutronCommand;
