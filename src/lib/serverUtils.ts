import {Migrate} from '@prisma/migrate/dist/Migrate';
import {ensureDatabaseExists} from '@prisma/migrate/dist/utils/ensureDatabaseExists';
import {executeSeedCommand} from '@prisma/migrate/dist/utils/seed';
import {existsSync, readFileSync} from 'fs';
import {EOL} from 'os';
import logger from 'lib/logger';
import type {Config} from 'lib/types';
import {resolve} from 'path';

export function getStacktrace(err: Error): string {
  if (!err.stack) return '';
  return err.stack.split(EOL).slice(1).join(EOL);
}

export async function prismaCheck() { // https://github.com/diced/zipline/blob/trunk/src/server/util.ts
  const schemaPath = resolve('prisma', 'schema.prisma');
  const migrator = new Migrate(schemaPath);
  await ensureDatabaseExists('apply', true, schemaPath);
  const diagnose = await migrator.diagnoseMigrationHistory({
    optInToShadowDatabase: false
  });
  if (diagnose.history?.diagnostic === 'databaseIsBehind')
    try {
      logger.info('Applying Prisma migrations.');
      await migrator.applyMigrations();
      await migrator.tryToRunGenerate();
      await executeSeedCommand('ts-node-esm --compiler-options {\"module\":\"CommonJS\"} --transpile-only prisma/seed.ts');
      logger.info('Finished applying migrations.');
    } catch (e) {
      throwAndExit(e);
    } finally {
      migrator.stop();
    }
  else migrator.stop();
}

export function throwAndExit(err: Error | string) {
  logger.error(err);
  process.exit(1);
}

export function readConfig(): Config | void {
  if (!existsSync(resolve('config.json'))) {
    return throwAndExit('Config file not found, please create one.');
  } else {
    logger.info('Reading config file');
    const str = readFileSync(resolve('config.json'), 'utf8');
    return JSON.parse(str);
  }
}

export function isUnicodeSupported() { // from is-unicode-supported
  return (!(process.platform === 'win32' || process.env.TERM == 'linux')) || Boolean(process.env.CI)
    || Boolean(process.env.WT_SESSION)
    || process.env.ConEmuTask === '{cmd::Cmder}'
    || process.env.TERM_PROGRAM === 'vscode'
    || process.env.TERM === 'xterm-256color'
    || process.env.TERM === 'alacritty'
    || process.env.TERMINAL_EMULATOR === 'JetBrains-JediTerm';
}

export function injectBigIntSerializer() {
  // eslint-disable-next-line
  (BigInt.prototype as any).toJSON = function () {
    return Number(this);
  };
}
