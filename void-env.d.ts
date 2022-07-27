/* eslint-disable no-var */

import type TTLCache from '@isaacs/ttlcache';
import type {PrismaClient} from '@prisma/client';
import type DiscordOAuth from 'discord-oauth2';
import type {Config, SessionUser} from 'lib/types';
import type {Neutron} from 'neutron';
import type {Logger} from 'winston';

declare global {
  var
    prisma: PrismaClient,
    config: Config,
    logger: Logger,
    cache: TTLCache,
    logCache: TTLCache,
    discordOauth: DiscordOAuth,
    neutron: Neutron;
}

declare module 'iron-session' {
  interface IronSessionData {
    user?: SessionUser;
  }
}


