import {Logger} from 'lib/logger';
import type {Config} from 'lib/types';
import type DiscordOAuth from 'discord-oauth2';
import type {PrismaClient} from '@prisma/client';
import type {Server} from 'void';
import type {Neutron} from 'neutron';
import TTLCache from '@isaacs/ttlcache';

export default class Internal {
  static get server(): Server {
    return globalThis.server;
  }

  static set server(value) {
    globalThis.server = value;
  }

  static get cache(): TTLCache<string, number> {
    if (!globalThis.cache) globalThis.cache = new TTLCache({
      max: 100, // allow 1000 users concurrently
      ttl: 60 * 60 * 1e3,
      noUpdateTTL: true
    });
    return globalThis.cache;
  }

  static get logger(): Logger {
    if (globalThis.logger == null) globalThis.logger = new Logger();
    return globalThis.logger;
  }

  static get config(): Config {
    return this.server?.config;
  }

  static get neutron(): Neutron {
    return globalThis.neutron;
  }

  static set neutron(value) {
    globalThis.neutron = value;
  }

  static get oauth(): DiscordOAuth {
    return this.server?.oauth;
  }

  static get prisma(): PrismaClient {
    return this.server?.prisma;
  }
}
