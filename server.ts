import {blue} from '@colors/colors';
import {PrismaClient} from '@prisma/client';
import {spawn} from 'child_process';
import {existsSync, readFileSync} from 'fs';
import {mkdir, stat} from 'fs/promises';
import {createServer} from 'http';
import {DateTime} from 'luxon';
import next from 'next';
import {resolve} from 'path';
import {createLogger, format, transports} from 'winston';
import {name, version} from './package.json';
import type {Config} from './src/lib/types';
import generate from './src/lib/urlGenerator';
import validate from './src/lib/validateConfig';

const dev = process.env.NODE_ENV === 'development';

const logger = createLogger({
  level: 'info',
  format: format.splat(),
  transports: [
    new transports.File({ filename: `logs/void_${DateTime.now().toFormat('yyyy_MM_dd_HH_mm_ss')}.log`, format: format.combine(
      format.timestamp(),
      format.prettyPrint(),
      format.json()
    )}),
    new transports.Console({
      level: 'debug',
      format: format.combine(
        format.timestamp({ format: 'DD/MM/YYYY - HH:mm:ss' }),
        format.colorize(),
        format.simple(),
        format.printf(({ level, message, timestamp }) => `[${blue(timestamp)}] ${level}: ${message}`)
      )})
  ],
});

async function runPrisma(url: string, args: string[], nostdout?: boolean): Promise<string> {
  return new Promise((res, rej) => {
    const proc = spawn(resolve('node_modules', '.bin', 'prisma'), args, {
      env: {
        DATABASE_URL: url,
        ...process.env
      },
    });
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

function throwAndExit(msg: string) {
  logger.error(msg);
  process.exit(1);
}

function readConfig(): Config | void {
  if (!existsSync(resolve('config.json'))) {
    return throwAndExit('Config file not found, please create one.');
  } else {
    logger.info('Reading config file');
    const str = readFileSync(resolve('config.json'), 'utf8');
    return JSON.parse(str);
  }
}

async function deploy(config) {
  try {
    await runPrisma(config.core.database_url, ['migrate', 'deploy']);
    await runPrisma(config.core.database_url, ['generate'], true);
  } catch (e) {
    console.log(e);
    throwAndExit('There was an error, exiting...');
  }
}

async function initServer() {
  try {
    global.logger = logger;
    const config = await validate(readConfig());
    global.config = config;
    process.env.DATABASE_URL = config.void.databaseUrl;
    global.prisma = new PrismaClient();
    const data = await runPrisma(config.void.databaseUrl, ['migrate', 'status'], true);
    if (data.match(/Following migrations? have not yet been applied/)) {
      logger.info('Some migrations are not applied, applying them now...');
      await deploy(config);
      logger.info('Finished applying migrations');
      await runPrisma(config.void.databaseUrl, ['db', 'seed']);
    }
    process.env.NEXT_PUBLIC_VOID_VERSION = `${name}@${version}`;
    process.env.NEXTAUTH_SECRET = Buffer.from(generate('alphanumeric', 32)).toString('base64');
    process.env.NEXTAUTH_URL = config.void.defaultDomain;
    await stat('./.next');
    await mkdir(config.void.upload.outputDirectory, {recursive: true});
    logger.info(`Initialized ${name}@${version}`);
    const app = next({
      hostname: config.void.host,
      port: config.void.port,
      dir: '.',
      dev,
      quiet: !dev
    });
    const handler = app.getRequestHandler();
    app.prepare().then(() => {
      const srv = createServer(handler);
      if (dev)
        srv.on('request', (req, res) => {
          if (!(req.url.startsWith('/_next') || req.url.startsWith('/__nextjs'))) {
            res.statusCode < 400 ? logger.debug(`${res.statusCode} ${req.url}`) : logger.debug(`${res.statusCode} ${req.url}`);
          }
        });
      srv.on('error', (e) => throwAndExit(e.message));
      srv.on('listening', async () => {
        logger.info(`Listening on ${config.void.host}:${config.void.port}`);
      });
      srv.listen(config.void.port, config.void.host);
    });
  } catch (e) {
    if ((e.message && e.message.startsWith('Could not find a production')) || (e.code && e.code === 'ENOENT' && e.path === './.next')) {
      logger.error('There is no production build - run yarn build');
    } else throwAndExit(e);
  }
}

initServer();
