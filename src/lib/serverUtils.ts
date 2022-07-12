import {spawn} from 'child_process';
import {existsSync, readFileSync} from 'fs';
import type {Config} from 'lib/types';
import {resolve} from 'path';

export async function runPrisma(url: string, args: string[], nostdout = false): Promise<string> {
  return new Promise((res, rej) => {
    const proc = spawn(resolve('node_modules', '.bin', 'prisma'), args);
    let a = '';
    proc.stdout.on('data', d => {
      if (!nostdout) console.log(d.toString());
      a += d.toString();
    });
    proc.stderr.on('data', d => {
      if (!nostdout) console.log(d.toString());
      rej(d.toString());
    });
    proc.stdout.on('end', () => res(a));
    proc.stdout.on('close', () => res(a));
  });
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

export async function deploy(config: Config) {
  try {
    await runPrisma(config.void.databaseUrl, ['migrate', 'deploy']);
    await runPrisma(config.void.databaseUrl, ['generate'], true);
  } catch (e) {
    console.log(e);
    throwAndExit('There was an error, exiting...');
  }
}

export function injectBigIntSerializer() {
  // eslint-disable-next-line
  (BigInt.prototype as any).toJSON = function () {
    return Number(this);
  };
}
