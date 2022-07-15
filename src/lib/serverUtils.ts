import {Migrate} from '@prisma/migrate/dist/Migrate';
import {ensureDatabaseExists} from '@prisma/migrate/dist/utils/ensureDatabaseExists';
import {executeSeedCommand} from '@prisma/migrate/dist/utils/seed';
import {existsSync, readFileSync} from 'fs';
import type {Config} from 'lib/types';
import {resolve} from 'path';

export async function prismaCheck() { // https://github.com/diced/zipline/blob/trunk/src/server/util.ts
  const schemaPath = resolve('prisma', 'schema.prisma');
  const migrator = new Migrate(schemaPath);
  await ensureDatabaseExists('apply', true, schemaPath);
  const diagnose = await migrator.diagnoseMigrationHistory({
    optInToShadowDatabase: false
  });
  if (diagnose.history?.diagnostic === 'databaseIsBehind')
    try {
      global.logger.info('Applying Prisma migrations.');
      await migrator.applyMigrations();
      await executeSeedCommand('ts-node-esm --compiler-options {\"module\":\"CommonJS\"} --transpile-only prisma/seed.ts');
      global.logger.info('Finished applying migrations.');
    } catch (e) {
      throwAndExit(e);
    } finally {
      migrator.stop();
    }
  else migrator.stop();
}

export function throwAndExit(msg: string) {
  global.logger.error(msg);
  process.exit(1);
}

export function readConfig(): Config | void {
  if (!existsSync(resolve('config.json'))) {
    return throwAndExit('Config file not found, please create one.');
  } else {
    global.logger.info('Reading config file');
    const str = readFileSync(resolve('config.json'), 'utf8');
    return JSON.parse(str);
  }
}

export function injectBigIntSerializer() {
  // eslint-disable-next-line
  (BigInt.prototype as any).toJSON = function () {
    return Number(this);
  };
}
