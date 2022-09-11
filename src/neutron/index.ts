import {SlashCommandBuilder} from '@discordjs/builders';
import {REST} from '@discordjs/rest';
import {ActivityType, GatewayIntentBits, Routes} from 'discord-api-types/v10';
import {Client} from 'discord.js';
import {readdirSync} from 'fs';
import logger from 'lib/logger';
import {NeutronCommand, NeutronModal} from 'neutron/types';
import withNeutron from 'neutron/withNeutron';
import {neutronVersion} from 'packageInfo';
import {resolve} from 'path';

export class Neutron {
  private _rest: REST;
  private _client: Client;
  private readonly _clientId: string;
  private readonly _guildId: string;
  
  private _modalHandlers: Record<string, NeutronModal> = {};
  private _commands: Record<string, NeutronCommand> = {};
  
  constructor(token: string, clientId: string, guildId: string) {
    this._client = new Client({intents: [GatewayIntentBits.Guilds]});
    this._client.login(token);
    this._clientId = clientId;
    this._guildId = guildId;
    this._rest = new REST({version: '10'}).setToken(token);
    this._client.once('ready', () => {
      logger.info(`Initialized neutron@${neutronVersion}.`, 'Neutron');
      this.initPresenceStatus();
      this.initEvents();
      this.initCommands();
      this.initModalHandlers();
    });
  }
  
  private initPresenceStatus() {
    prisma.user.count().then(c => this._client.user.setActivity({
      name: `${c} user${c === 1 ? '' : 's'}.`,
      type: ActivityType.Watching
    }));
  }
  
  private initModalHandlers() {
    this._modalHandlers = {};
    const basePath = resolve('src', 'neutron', 'modalHandlers');
    const files = readdirSync(basePath).filter(file => file.endsWith('.ts'));
    for (const file of files) {
      const m: NeutronModal = require(resolve(basePath, file)).default;
      this._modalHandlers[m.id] = m;
    }
    logger.info(`Successfully loaded ${files.length} modal handlers.`, 'Neutron');
  }
  
  private initCommands() {
    this._commands = {};
    const basePath = resolve('src', 'neutron', 'commands');
    const files = readdirSync(basePath).filter(file => file.endsWith('.ts'));
    const payload = [];
    for (const file of files) {
      const m: NeutronCommand = require(resolve(basePath, file)).default;
      this._commands[m.name] = m;
      payload.push(new SlashCommandBuilder().setName(m.name).setDescription(m.description));
    }
    if (payload.length === 0) return;
    logger.info(`Successfully loaded ${files.length} commands.`, 'Neutron');
    this._rest.put(
      Routes.applicationGuildCommands(this._clientId, this._guildId),
      {body: payload}
    ).then(() => logger.info('Successfully pushed command payloads to the server.', 'Neutron'));
  }
  
  private initEvents() {
    this._client.on('interactionCreate', withNeutron(async context => {
      const user = await context.getUser();
      if (context.isChatInputCommand()) {
        const {commandName} = context;
        const cmd = this._commands[commandName];
        if (!cmd) await context.whisper('This command does not exist!');
        else if (!user?.canUseBot || cmd.requiresAdmin && !user.isAdmin)
          await context.whisper('You do not have permissions to execute this command!');
        else await cmd.execute(context, user);
      } else if (context.isModalSubmit()) {
        const {customId} = context;
        const handler = this._modalHandlers[customId];
        if (handler)
          await handler.handle(context, user);
      }
    }));
  }
}

export function initNeutron(token: string, clientId: string, guildId: string) {
  if (!(token && clientId && guildId)) return;
  global.neutron = new Neutron(token, clientId, guildId);
}
