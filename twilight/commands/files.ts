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
        uploadedAt: true,
        userId: true
      }
    });
    const pages: MessageEmbed[] = [];
    for (let i = 0; i < all.length; i += 4) {
      const files = all.slice(i, i + 4);
      const embed = new MessageEmbed()
        .setTitle('Files')
        .setColor('#B794F4')
        .setFooter(`Page ${i / 4 + 1}/${Math.ceil(all.length / 4)} | Total: ${all.length}`);
      files.forEach(file =>
        embed.addField(file.fileName,
          `ID: ${file.id}
          Original file name: ${file.origFileName}
          Mimetype: ${file.mimetype}
          Uploaded at: ${new Date(file.uploadedAt).toLocaleString()}`)
      );
      pages.push(embed);
    }
    // https://stackoverflow.com/a/60693028
    msg.channel.send(pages[0]).then(message => {
      if (pages.length <= 1) return;
      message.react('➡️');
      const collector = message.createReactionCollector(
        (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === msg.author.id,
        { time: 60000 }
      );
      let i = 0;
      collector.on('collect', async reaction => {
        await message.reactions.removeAll();
        reaction.emoji.name === '⬅️' ? i -= 1 : i += 1;
        await message.edit(pages[i]);
        if (i !== 0) await message.react('⬅️');
        if (i + 1 < pages.length) await message.react('➡️');
      });
    });
  }
};

export default files;