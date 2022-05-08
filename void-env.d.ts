import type {PrismaClient} from '@prisma/client';
import type {Logger} from 'winston';
import type {Config} from './src/lib/types';

declare global {
  namespace NodeJS {
    interface Global {
      prisma: PrismaClient;
      config: Config;
      logger: Logger;
    }
  }
}
