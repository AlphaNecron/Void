import {mkdir, stat} from 'fs/promises';
import {createServer} from 'http';
import next from 'next';
import deployDb from './scripts/deployDb';
import prismaRun from './scripts/prismaRun';
import {error, info} from './src/lib/logger';
import readConfig from './src/lib/configReader';
import {name, version} from './package.json';
import {PrismaClient} from '@prisma/client';

info('SERVER', `Starting ${name}@${version}`);

const dev = process.env.NODE_ENV === 'development';

(async () => {
  try {
    const config = readConfig();
    if (!global.config) global.config = config;
    process.env.DATABASE_URL = config.void.databaseUrl;
    if (!global.prisma) global.prisma = new PrismaClient();
    const data = await prismaRun(config.void.databaseUrl, ['migrate', 'status'], true);
    if (data.match(/Following migrations? have not yet been applied/)) {
      info('DB', 'Some migrations are not applied, applying them now...');
      await deployDb(config);
      info('DB', 'Finished applying migrations');
      await prismaRun(config.void.databaseUrl, ['db', 'seed']);
    }
    process.env.NEXT_PUBLIC_VOID_VERSION = `${name}@${version}`;
    await stat('./.next');
    await mkdir(config.void.file.outputDirectory, { recursive: true });
    const app = next({
      hostname: config.void.host,
      port: config.void.port,
      dir: '.',
      dev,
      quiet: dev
    });
    await app.prepare();
    const srv = createServer(app.getRequestHandler());
    if (dev)
      srv.on('request', (req, res) => {
        if (!(req.url.startsWith('/_next') || req.url.startsWith('/__nextjs'))) {
          res.statusCode < 400 ? info('ROUTER', `${res.statusCode} ${req.url}`) : error('URL', `${res.statusCode} ${req.url}`);
        }
      });
    srv.on('error', (e) => {
      error('SERVER', e);
      process.exit(1);
    });
    srv.on('listening', async () => {
      info('SERVER', `Listening on ${config.void.host}:${config.void.port}`);
    });
    srv.listen(config.void.port, config.void.host);
  } catch (e) {
    if (e.message && e.message.startsWith('Could not find a production')) {
      console.log(e.message);
      error('WEB', 'There is no production build - run yarn build');
    } else if (e.code && e.code === 'ENOENT') {
      if (e.path === './.next') error('WEB', 'There is no production build - run yarn build');
    } else {
      error('SERVER', e);
      process.exit(1);
    }
  }
})();
