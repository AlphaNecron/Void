import { PrismaClient } from '@prisma/client';
import { mkdir, readFile, stat } from 'fs/promises';
import { createServer } from 'http';
import next from 'next';
import { extname, join } from 'path';
import deployDb from './scripts/deployDb';
import prismaRun from './scripts/prismaRun';
import { error, info } from './src/lib/logger';
import { mimetypes } from './src/lib/constants';
import validate from './src/lib/validateConfig';
import readConfig from './src/lib/configReader';
import start from './twilight/twilight';
import { name, version } from './package.json';

info('SERVER', `Starting ${name}@${version}`);

const dev = process.env.NODE_ENV === 'development';

(async () => {
  try {
    const config = await validate(readConfig());
    const data = await prismaRun(config.core.database_url, ['migrate', 'status'], true);
    if (data.match(/Following migrations? have not yet been applied/)) {
      info('DB', 'Some migrations are not applied, applying them now...');
      await deployDb(config);
      info('DB', 'Finished applying migrations');
      await prismaRun(config.core.database_url, ['db', 'seed'])
    }
    process.env.DATABASE_URL = config.core.database_url;
    if (config.bot.enabled) {
      if (!config.bot.token) error('BOT', 'Token is not specified');
      else start(config);
    }
    await stat('./.next');
    await mkdir(config.uploader.directory, { recursive: true });
    const app = next({
      dir: '.',
      dev,
      quiet: dev
    });
    await app.prepare();
    const handle = app.getRequestHandler();
    const prisma = new PrismaClient();
    const srv = createServer(async (req, res) => {
      if (req.url.startsWith(config.uploader.raw_route)) {
        const fileName = (req.url.split('/')[2] ?? '').replace(/[\#\?].*$/ig, '');
        if (!fileName || fileName === '') return;
        let data;
        try {
          data = await readFile(join(process.cwd(), config.uploader.directory, fileName));
        }
        catch {
          app.render404(req, res);
        }
        if (!data) {
          app.render404(req, res);
        } else {
          let file = await prisma.file.findFirst({
            where: {
              fileName,
            }
          });
          if (file) {
            res.setHeader('Content-Type', file.mimetype);
          } else {
            const mimetype = mimetypes[extname(fileName)] ?? 'application/octet-stream';
            res.setHeader('Content-Type', mimetype);
          }
          res.setHeader('Content-Length', data.byteLength);
          res.setHeader('Content-Disposition', `filename="${file.origFileName}"`);
          res.end(data);
        }
      } else {
        handle(req, res);
      }
      if (!(req.url.startsWith('/_next') || req.url.startsWith('/__nextjs'))) {
        res.statusCode === 200 ? info('ROUTER', `${res.statusCode} ${req.url}`) : error('URL', `${res.statusCode} ${req.url}`);
      }
    });
    srv.on('error', (e) => {
      error('SERVER', e);
      process.exit(1);
    });
    srv.on('listening', async () => {
      info('SERVER', `Listening on ${config.core.host}:${config.core.port}`);
    });
    srv.listen(config.core.port, config.core.host);
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
