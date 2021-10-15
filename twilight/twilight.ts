import Discord, { Message, MessageEmbed } from 'discord.js';
import { readdirSync } from 'fs';
import { error, info } from '../src/lib/logger';
import { Logger } from './utils/logger';

let config;

const client = new Discord.Client();

export let avatarUrl = '';

export const commands = [];

client.once('ready', () => {
  info('BOT', 'Twilight is ready');
  avatarUrl = client.user.displayAvatarURL();
  global.logger = new Logger(client);
  global.logger.log('Twilight is ready');
  readdirSync(`${__dirname}/commands`)
    .map(file => file.toString())
    .filter(file => file.endsWith('.ts'))
    .forEach(file => {
      import(`${__dirname}/commands/${file.toString()}`).then(command => commands.push(command.default));
      info('COMMAND', `Loaded command: ${file.toString().split('.').shift()}`);
    });
});

client.on('message', (msg: Message) => {
  if ((config.admins).includes(msg.author.id) && msg.content.startsWith(config.prefix)) {
    const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toString().toLowerCase();
    commands.forEach(command => {
      if (command.command === cmd)
        command.execute(msg, args, client);
    });
  }
});

export default function start({ bot }) {
  config = bot;
  client.login(config.token);
}