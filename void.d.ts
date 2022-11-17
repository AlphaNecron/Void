/* eslint-disable no-var */

import type {SessionUser} from 'lib/types';
import type {Server} from 'void';
import type {Logger} from 'lib/logger';
import type {Neutron} from 'neutron';
import type TTLCache from '@isaacs/ttlcache';

declare global {
  var
    cache: TTLCache<string, number>,
    neutron: Neutron,
    server: Server,
    logger: Logger;
}

declare module 'iron-session' {
  interface IronSessionData {
    user?: SessionUser;
  }
}


