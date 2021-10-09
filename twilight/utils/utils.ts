import { Message, MessageEmbed } from 'discord.js';
import { name, version } from '../../package.json';
import config from '../../src/lib/config';
import { avatarUrl } from '../twilight';

export function pagify(title: string, items: any[], msg: Message): Function {
	const pages: MessageEmbed[] = [];
	for (let i = 0; i < items.length; i += 6) {
		const sliced = items.slice(i, i + 6);
		const embed = defaultEmbed(`Page ${i / 6 + 1}/${Math.ceil(items.length / 6)} | Total: ${items.length}`)
			.setTitle(title)
		sliced.forEach(item =>
			embed.addField(item.name, item.value)
		);
		pages.push(embed);
	}
	// https://stackoverflow.com/a/60693028
	return () => {
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
	};
}

export const defaultEmbed = (footer?: string) => new MessageEmbed().setColor('#B794F4')
	.setAuthor('Twilight', avatarUrl).setTimestamp().setFooter(`${name}@${version}${footer ? ` | ${footer}` : ''}`, `http${config.core.secure ? 's' : ''}://${config.bot.hostname}/logo.png`);