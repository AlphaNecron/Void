import Discord, { Message, MessageEmbed } from 'discord.js';
import { readdir } from 'fs';
import { exit } from 'process';
import config from '../src/lib/config';
import { error, info } from '../src/lib/logger';
import { Logger } from './utils/logger';

if (!config.bot.enabled) exit(0);
process.env.DATABASE_URL = config.core.database_url;
if (!config.bot.token) exit(1);

export let logger;

const client = new Discord.Client();

export const commands = [];

client.once('ready', () => {
  info('BOT', 'Twilight is ready');
  logger = new Logger(client);
  logger.log(new MessageEmbed()
    .setTitle('Twilight is ready')
    .setColor('#B794F4'));
  readdir(`${__dirname}/commands`, (err, files) => {
    if(err) error('BOT', err.message);
    files.forEach(file => {
      if (file.toString().includes('.ts')) {
        commands.push(require(`${__dirname}/commands/${file.toString()}`).default);
        info('COMMAND', `Loaded command: ${file.toString().split('.').slice(0, -1)}`);}
    });
  });
});

client.on('message', (msg: Message) => {
  if (config.bot.admin.includes(msg.author.id) && msg.content.startsWith(config.bot.prefix)) {
    const args = msg.content.slice(config.bot.prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toString().toLowerCase();
    commands.forEach(command => {
      if (command.command === cmd)
        if (command.scopes.includes(msg.channel.type))
          command.execute(msg, args, client);
        else msg.channel.send(`This command can only be executed in ${command.scopes.join(' or ')}`);
    });
  }
});

client.login(config.bot.token);
