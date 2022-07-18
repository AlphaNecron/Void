import {SlashCommandBuilder} from '@discordjs/builders';
import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v10';
import {Client, Intents, MessageEmbed, TextChannel} from 'discord.js';
import {readdirSync} from 'fs';
import logger from 'lib/logger';
import {isAdmin} from 'lib/permission';
import {CachedUser, NeutronCommand, NeutronModal} from 'neutron/types';
import {neutronVersion} from 'packageInfo';
import {resolve} from 'path';

export class Neutron {
  private _rest: REST;
  private _client: Client;
  private readonly _clientId: string;
  private readonly _guildId: string;
  
  private _modalHandlers: Record<string, NeutronModal> = {};
  private _commands: Record<string, NeutronCommand> = {};
  private _userCache: Record<string, CachedUser> = {};
  
  private _logChannel: TextChannel;
  
  constructor(token: string, clientId: string, guildId: string, logChannel: string) {
    this._client = new Client({intents: [Intents.FLAGS.GUILDS]});
    this._client.login(token);
    this._clientId = clientId;
    this._guildId = guildId;
    this._rest = new REST({version: '10'}).setToken(token);
    this._client.once('ready', () => {
      logger.info(`Initialized neutron@${neutronVersion}`, 'Neutron');
      if (logChannel?.length > 0)
        this._logChannel = this._client.guilds.cache.get(guildId).channels.cache.get(logChannel) as TextChannel;
    });
    this.initEvents();
    this.initCommands();
    this.initModalHandlers();
  }
  
  public log(event: string, message: string, alt: string) {
    if (!this._logChannel) return;
    const embed = new MessageEmbed().setTitle(event).setFields({ name: message, value: alt });
    this._logChannel.send({ embeds: [embed] });
  }
  
  protected resetCache = () => this._userCache = {};
  
  private async initModalHandlers() {
    this._modalHandlers = {};
    const basePath = resolve('src', 'neutron', 'modalHandlers');
    const files = readdirSync(basePath).filter(file => file.endsWith('.ts'));
    for (const file of files) {
      const m: NeutronModal = require(resolve(basePath, file)).default;
      this._modalHandlers[m.id] = m;
    }
    logger.info(`Successfully loaded ${files.length} modal handlers.`, 'Neutron');
  }
  
  private async initCommands() {
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
    await this._rest.put(
      Routes.applicationGuildCommands(this._clientId, this._guildId),
      {body: payload}
    );
  }
  
  private initEvents() {
    this._client.on('interactionCreate', async interaction => {
      const id = interaction.member.user.id;
      let user = this._userCache[id];
      if (!user) {
        const query = await global.prisma.discord.findUnique({
          where: {
            id
          },
          select: {
            user: {
              select: {
                id: true,
                role: {
                  select: {
                    permissions: true
                  }
                }
              }
            }
          }
        });
        this._userCache[id] = query ? {
          id: query.user.id,
          isAdmin: isAdmin(query.user.role.permissions)
        } : {
          id: null
        };
        user = this._userCache[id];
      }
      if (interaction.isCommand()) {
        const {commandName} = interaction;
        const cmd = this._commands[commandName];
        if (!cmd) return interaction.reply({content: 'This command does not exist!', ephemeral: true});
        return !user.id || cmd.requiresAdmin && !user.isAdmin ? await interaction.reply({
          content: 'You do not have permissions to execute this command!',
          ephemeral: true
        }) : await cmd.execute(interaction, user);
      } else if (interaction.isModalSubmit()) {
        const { customId } = interaction;
        const handler = this._modalHandlers[customId];
        if (!handler) return;
        await handler.handle(interaction, user);
      }
    });
  }
}

export function initNeutron(token: string, clientId: string, guildId: string, logChannel: string) {
  if (!(token && clientId && guildId)) return;
  global.neutron = new Neutron(token, clientId, guildId, logChannel);
}
