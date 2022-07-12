import {blue} from '@colors/colors';
import {PrismaClient} from '@prisma/client';
import DiscordOAuth from 'discord-oauth2';
import {mkdirSync} from 'fs';
import {createServer} from 'http';
import {DateTime} from 'luxon';
import next from 'next';
import {resolve} from 'path';
import {createLogger, format, transports} from 'winston';
import {name, version} from './package.json';
import {deploy, injectBigIntSerializer, readConfig, runPrisma, throwAndExit} from './src/lib/serverUtils';
import validate from './src/lib/validate';

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

async function initServer() {
  global.logger = logger;
  try {
    injectBigIntSerializer();
    const config = await validate(readConfig());
    global.config = config;
    if (config.void.discordProvider.clientSecret && config.void.discordProvider.clientId) {
      const { defaultDomain, discordProvider: { clientSecret, clientId } } = config.void;
      global.discordOauth = new DiscordOAuth({
        clientSecret,
        clientId,
        redirectUri: `${defaultDomain}/api/discord/callback`
      });
    }
    process.env.DATABASE_URL = config.void.databaseUrl;
    global.prisma = new PrismaClient();
    const data = await runPrisma(config.void.databaseUrl, ['migrate', 'status'], true);
    if (data.match(/Following migrations? have not yet been applied/)) {
      logger.info('Some migrations are not applied, applying them now...');
      await deploy(config);
      logger.info('Finished applying migrations');
      await runPrisma(config.void.databaseUrl, ['db', 'seed']);
    }
    mkdirSync(resolve(config.void.upload.outputDirectory, 'avatars'), {recursive: true});
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
      srv.on('error', e => throwAndExit(e.message));
      srv.on('listening', async () =>
        logger.info(`Listening on ${config.void.host}:${config.void.port}`));
      srv.listen(config.void.port, config.void.host);
    });
  } catch (e) {
    if ((e.message && e.message.startsWith('Could not find a production')) || (e.code && e.code === 'ENOENT' && e.path === './.next')) {
      logger.error('There is no production build - run yarn build');
    } else throwAndExit(e);
  }
}

initServer();
