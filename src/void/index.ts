import {PrismaClient} from '@prisma/client';
import DiscordOAuth from 'discord-oauth2';
import {mkdirSync} from 'fs';
import {createServer} from 'http';
import logger from 'lib/logger';
import {injectBigIntSerializer, prismaCheck, readConfig, throwAndExit} from 'lib/serverUtils';
import {validateConfig} from 'lib/validate';
import {initNeutron} from 'neutron';
import next from 'next';
import {name, version} from 'packageInfo';
import {resolve} from 'path';

const dev = process.env.NODE_ENV === 'development';

async function initServer() {
  try {
    injectBigIntSerializer();
    const config = await validateConfig(readConfig());
    global.config = config;
    process.env.DATABASE_URL = config.void.databaseUrl;
    await prismaCheck();
    global.prisma = new PrismaClient();
    if (config.void.discordProvider.clientSecret && config.void.discordProvider.clientId) {
      const {defaultDomain, discordProvider: {clientSecret, clientId}} = config.void;
      global.discordOauth = new DiscordOAuth({
        clientSecret,
        clientId,
        redirectUri: `${defaultDomain}/auth/callback`
      });
    }
    mkdirSync(resolve(config.void.upload.outputDirectory, 'avatars'), {recursive: true});
    logger.info(`Initialized ${name}@${version}.`);
    const app = next({
      hostname: config.void.host,
      port: config.void.port,
      dir: '.',
      dev,
      quiet: !dev
    });
    const handler = app.getRequestHandler();
    if (config.neutron.enabled && config.neutron.token && config.neutron.clientId && config.neutron.guildId)
      initNeutron(config.neutron.token, config.neutron.clientId, config.neutron.guildId);
    app.prepare().then(() => {
      const srv = createServer(handler);
      if (process.env.VERBOSE === 'true' && dev)
        srv.on('request', (req, res) => {
          if (!(req.url.startsWith('/_next') || req.url.startsWith('/__nextjs')))
            logger.debug(`${res.statusCode} ${req.url}`);
        });
      srv.on('error', e => throwAndExit(e));
      srv.listen(config.void.port, config.void.host, null,
        () => logger.info(`Listening on ${config.void.host}:${config.void.port}.`));
    });
  } catch (e) {
    if ((e.message && e.message.startsWith('Could not find a production')) || (e.code && e.code === 'ENOENT' && e.path === './.next')) {
      global.logger.error('There is no production build - run yarn build.');
    } else throwAndExit(e);
  }
}

initServer();
