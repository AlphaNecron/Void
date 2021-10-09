import Discord, { Message, MessageEmbed } from 'discord.js';
import { readdir } from 'fs';
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
  readdir(`${__dirname}/commands`, (err, files) => {
    if(err) error('BOT', err.message);
    files.forEach(file => {
      if (file.toString().includes('.ts')) {
        import(`${__dirname}/commands/${file.toString()}`).then(command => commands.push(command.default));
        info('COMMAND', `Loaded command: ${file.toString().split('.').shift()}`);}
    });
  });
});

client.on('message', (msg: Message) => {
  if ((config.admins).includes(msg.author.id) && msg.content.startsWith(config.prefix)) {
    const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toString().toLowerCase();
    commands.forEach(command => {
      if (command.command === cmd)
        if (command.scopes.includes(msg.channel.type))
          command.execute(msg, args, client);
        else msg.channel.send(`This command can only be executed in ${command.scopes.map(scope => `\`${scope}\``).join(' or ')}`);
    });
  }
});

export default function start({ bot }) {
  config = bot;
  client.login(config.token);
}