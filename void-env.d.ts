import type { PrismaClient } from '@prisma/client';
import type { Config } from './src/lib/types';
//import type { Logger } from './twilight/utils/logger';

declare global {
  namespace NodeJS {
    interface Global {
      prisma: PrismaClient;
      config: Config;
      secret: string;
//      logger: Logger;
    }
  }
}