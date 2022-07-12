import type TTLCache from '@isaacs/ttlcache';
import type {PrismaClient} from '@prisma/client';
import type DiscordOAuth from 'discord-oauth2';
import type {Config} from 'lib/types';
import type {VoidUser} from 'middleware/withVoid';
import type {Logger} from 'winston';

declare global {
  namespace NodeJS {
    interface Global {
      prisma: PrismaClient;
      config: Config;
      logger: Logger;
      cache: TTLCache;
      discordOauth: DiscordOAuth
    }
  }
}

declare module 'iron-session' {
  interface IronSessionData {
    user?: VoidUser
  }
}


