import { Message, MessageEmbed } from 'discord.js';
import prisma from '../../src/lib/prisma';

const files = {
  command: 'files',
  description: 'View files',
  syntax: '{PREFIX}files',
  scopes: ['dm', 'text'],
  execute: async (msg: Message) => {
    const all = await prisma.file.findMany({
      select: {
        id: true,
        fileName: true,
        origFileName: true,
        mimetype: true,
        uploadedAt: true
      }
    });
    for (let i = 0; i < all.length; i += 4) {
      const files = all.slice(i, i + 4);
      const embed = new MessageEmbed()
        .setTitle('Files')
        .setColor('#B794F4');
      files.forEach(file => {
        embed.addField(`${file.fileName}`,
          `ID: ${file.id}
          Original file name: ${file.origFileName}
          Mimetype: ${file.mimetype}
          Uploaded at: ${new Date(file.uploadedAt).toLocaleString()}`)
          .setFooter(`Page ${i / 4 + 1}/${Math.ceil(all.length / 4)}`);
      });
      msg.channel.send(embed);
    }
  }
};

export default files;