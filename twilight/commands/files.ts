import prisma from '../../src/lib/prisma';
import { Message, MessageEmbed } from 'discord.js';

const users = {
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
    const embed = new MessageEmbed()
      .setTimestamp()
      .setTitle('Files')
      .setColor('#B794F4')
      .setFooter(`Total: ${all.length}`);
    all.forEach(file => {
      embed.addField(`${file.fileName}`,
        `ID: ${file.id}
              Original file name: ${file.origFileName}
              Mimetype: ${file.mimetype}
              Uploaded at: ${new Date(file.uploadedAt).toLocaleString()}`);

    });
    await msg.channel.send(embed);
  }
};

export default users;