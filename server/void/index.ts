import { PrismaClient } from '@prisma/client';
import DiscordOAuth from 'discord-oauth2';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { createServer } from 'http';
import { checkForUpdate, getVersion, injectBigIntSerializer, prismaCheck, throwAndExit } from 'void/utils';
import { validateConfig } from 'lib/validate';
import { Neutron } from 'neutron';
import next from 'next';
import { resolve } from 'path';
import type { Config } from 'lib/types';
import type { NextServer } from 'next/dist/server/next';
import internal from 'void/internal';

export class Server {
  private readonly _dev: boolean;
  private _neutron: Neutron;
  private _server: NextServer;

  constructor(isDev = false) {
    this._dev = isDev;
  }

  get version(): string {
    return getVersion();
  }

  private _oauth: DiscordOAuth;

  get oauth(): DiscordOAuth {
    return this._oauth;
  }

  private _prisma: PrismaClient;

  get prisma(): PrismaClient {
    return this._prisma;
  }

  private _config: Config;

  get config(): Config {
    return this._config;
  }

  async init() {
    try {
      injectBigIntSerializer();
      await checkForUpdate();
      const config = await validateConfig(this.readConfig());
      this._config = config;
      process.env.DATABASE_URL = config.void.databaseUrl;
      await prismaCheck();
      this._prisma = new PrismaClient();
      if (config.void.discordProvider.clientSecret && config.void.discordProvider.clientId) {
        const {defaultDomain, discordProvider: {clientSecret, clientId}} = config.void;
        this._oauth = new DiscordOAuth({
          clientSecret,
          clientId,
          redirectUri: `${defaultDomain}/auth/callback`
        });
      }
      mkdirSync(resolve(config.void.upload.outputDirectory, 'avatars'), {recursive: true});
      this._server = next({
        hostname: config.void.host,
        port: config.void.port,
        dir: '.',
        dev: this._dev,
        quiet: !this._dev
      });
      await this.postInit();
    } catch (e) {
      internal.logger.error(e);
    }
  }

  private async postInit() {
    internal.logger.info(`Initialized void@${this.version}${this._dev ? ' [dev]' : ''}.`);
    if (this._config.neutron.enabled)
      internal.neutron = new Neutron(this._config.neutron.token, this._config.neutron.clientId);
    await this.start();
  }

  private async start() {
    try {
      this._server.prepare().then(() => {
        const srv = createServer(this._server.getRequestHandler());
        if (process.env.VERBOSE === 'true' && this._dev)
          srv.on('request', (req, res) => {
            if (!(req.url.startsWith('/_next') || req.url.startsWith('/__nextjs')))
              internal.logger.debug(`${res.statusCode} ${req.url}`);
          });
        srv.on('error', e => throwAndExit(e));
        srv.listen(this._config.void.port, this._config.void.host, null,
          () => internal.logger.info(`Listening on ${this._config.void.host}:${this._config.void.port}.`));
      });
    } catch (e) {
      throwAndExit(e);
    }
  }

  private readConfig(): Config | void {
    if (!existsSync(resolve('config.json'))) {
      return throwAndExit('Config file not found, please create one.');
    } else {
      internal.logger.info('Reading config file');
      const str = readFileSync(resolve('config.json'), 'utf8');
      return JSON.parse(str);
    }
  }
}
