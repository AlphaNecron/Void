import type TTLCache from '@isaacs/ttlcache';
import type {PrismaClient} from '@prisma/client';
import type DiscordOAuth from 'discord-oauth2';
import type {Config, SessionUser} from 'lib/types';
import type {Logger} from 'winston';
import type { Neutron } from 'neutron';

declare global {
  declare namespace NodeJS {
    declare interface Global {
      prisma: PrismaClient;
      config: Config;
      logger: Logger;
      cache: TTLCache;
      discordOauth: DiscordOAuth;
      Neutron: Neutron;
    }
  }
}

declare module 'iron-session' {
  interface IronSessionData {
    user?: SessionUser;
  }
}


