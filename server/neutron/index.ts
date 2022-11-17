import {SlashCommandBuilder} from '@discordjs/builders';
import {REST} from '@discordjs/rest';
import {ActivityType, GatewayIntentBits, Routes} from 'discord-api-types/v10';
import {Client} from 'discord.js';
import {readdirSync} from 'fs';
import internal from 'void/internal';
import {NeutronCommand, NeutronCommandGroup, NeutronModal} from 'neutron/types';
import withNeutron from 'neutron/withNeutron';
import {join, resolve} from 'path';
import {getVersion} from 'neutron/utils';

export class Neutron {
  private _rest: REST;
  private _client: Client;
  private readonly _clientId: string;

  private _modalHandlers: Record<string, NeutronModal> = {};
  private _commands: Record<string, NeutronCommand> = {};
  private _commandGroups: Record<string, NeutronCommandGroup> = {};

  constructor(token: string, clientId: string) {
    this._client = new Client({intents: [GatewayIntentBits.Guilds]});
    this._client.login(token);
    this._clientId = clientId;
    this._rest = new REST({version: '10'}).setToken(token);
    this._client.once('ready', () => {
      internal.logger.info(`Initialized neutron@${this.version}.`, 'Neutron');
      this.initPresenceStatus();
      this.initEvents();
      this.initCommands();
      this.initModalHandlers();
    });
  }

  get version(): string {
    return getVersion();
  }

  private initPresenceStatus() {
    setInterval(() =>
      internal.prisma.user.count().then(c => this._client.user.setActivity({
        name: `${c} user${c === 1 ? '' : 's'}.`,
        type: ActivityType.Watching
      })), 18e5);
  }

  private initModalHandlers() {
    this._modalHandlers = {};
    const basePath = resolve('server', 'neutron', 'modalHandlers');
    const files = readdirSync(basePath).filter(file => file.endsWith('.ts'));
    for (const file of files) {
      const m: NeutronModal = require(resolve(basePath, file)).default;
      this._modalHandlers[m.id] = m;
    }
    internal.logger.info(`Successfully loaded ${files.length} modal handlers.`, 'Neutron');
  }

  private initCommands() {
    this._commands = {};
    const basePath = resolve('server', 'neutron', 'commands');
    const groupPath = join(basePath, 'groups');
    const files = readdirSync(basePath).filter(f => f.endsWith('.ts'));
    const groups = readdirSync(groupPath, {withFileTypes: true}).filter(f => f.isDirectory());
    const payload = [];
    for (const file of files) {
      const m: NeutronCommand = require(join(basePath, file)).default;
      this._commands[m.name] = m;
      payload.push(new SlashCommandBuilder().setName(m.name).setDescription(m.description));
      m.name;
    }
    /*for (const group of groups) {
      const m: NeutronCommandGroup = require(join(groupPath, group.name)).default;
      const grp = new SlashCommandSubcommandGroupBuilder().setName(m.name).setDescription(m.description);
      for (const sub of m.commands)
        grp.addSubcommand(b => b.setName(sub.name).setDescription(sub.description));
      this._commandGroups[m.name] = m;
      // payload.push(grp);
    }*/
    if (payload.length === 0) return;
    internal.logger.info(`Successfully loaded ${files.length} commands.`, 'Neutron');
    this._rest.put(
      Routes.applicationGuildCommands(this._clientId, '895986508786458675'),
      {body: payload}
    ).catch(e => console.error(e)).then(() => internal.logger.info('Successfully pushed slash command payloads to the server.', 'Neutron'));
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
