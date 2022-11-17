import { Migrate } from '@prisma/migrate/dist/Migrate';
import { ensureDatabaseExists } from '@prisma/migrate/dist/utils/ensureDatabaseExists';
import { executeSeedCommand } from '@prisma/migrate/dist/utils/seed';
import { resolve } from 'path';
import voidPkg from 'packageInfo';
import { bold, magenta } from 'picocolors';
import { EOL } from 'os';
import internal from 'void/internal';

export async function prismaCheck() { // https://github.com/diced/zipline/blob/trunk/src/server/util.ts
  const schemaPath = resolve('prisma', 'schema.prisma');
  const migrator = new Migrate(schemaPath);
  await ensureDatabaseExists('apply', true, schemaPath);
  const diagnose = await migrator.diagnoseMigrationHistory({
    optInToShadowDatabase: false
  });
  if (diagnose.history?.diagnostic === 'databaseIsBehind')
    try {
      internal.logger.info('Applying Prisma migrations.');
      await migrator.applyMigrations();
      await migrator.tryToRunGenerate();
      await executeSeedCommand('tsx prisma/seed.ts');
      internal.logger.info('Finished applying migrations.');
    } catch (e) {
      throwAndExit(e);
    } finally {
      migrator.stop();
    }
  else migrator.stop();
}

export function throwAndExit(err: Error | string) {
  internal.logger.error(err);
  process.exit(1);
}

export function getVersion(): string {
  return voidPkg.version;
}

export async function checkForUpdate() {
  if (process.env.CHECK_FOR_UPDATE !== 'true') return;
  try {
    const res = await fetch('https://api.github.com/repos/AlphaNecron/Void/releases').then(r => r.json());
    if (!res || res.length === 0) return;
    const latest = res[0];
    if (latest.tag_name !== getVersion())
      internal.logger.info(`A new ${latest.prerelease ? 'prerelease' : 'release'} is available: ${bold(magenta(latest.name.length > 0 ? latest.name : latest.tag_name))}`);
  } catch (e) {
    internal.logger.error('Could not check for updates.');
  }
}

export function getStacktrace(err: Error): string {
  if (!err.stack) return '';
  return err.stack.split(EOL).slice(1).join(EOL);
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
  BigInt.prototype['toJSON'] = function () {
    return Number(this);
  };
}
