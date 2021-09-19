const next = require('next');
const { createServer } = require('http');
const { stat, mkdir } = require('fs/promises');
const { extname } = require('path');
const { PrismaClient } = require('@prisma/client');
const validateConfig = require('./validateConfig');
const { info, error } = require('../src/lib/logger');
const getFile = require('./static');
const prismaRun = require('../scripts/prismaRun');
const configReader = require('../src/lib/configReader');
const mimes = require('../src/lib/mimetype');
const deployDb = require('../scripts/deployDb');

info('SERVER', 'Starting Draconic server');

const dev = process.env.NODE_ENV === 'development';

(async () => {
  try {
    const config = configReader();
    await validateConfig(config);
    const data = await prismaRun(config.core.database_url, ['migrate', 'status'], true);
    if (data.includes('Following migration have not yet been applied:')) {
      info('DB', 'Some migrations are not applied, applying them now...');
      await deployDb(config);
      info('DB', 'Finished applying migrations');
    }
    process.env.DATABASE_URL = config.core.database_url;
    await stat('./.next');
    await mkdir(config.uploader.directory, { recursive: true });
    const app = next({
      dir: '.',
      dev,
      quiet: dev
    }, config.core.port, config.core.host);
    await app.prepare();
    const handle = app.getRequestHandler();
    const prisma = new PrismaClient();
    const srv = createServer(async (req, res) => {
      if (req.url.startsWith('/raw')) {
        const parts = req.url.split('/');
        if (!parts[2] || parts[2] === '') return;
        const data = await getFile(config.uploader.directory, parts[2]);
        if (!data) {
          app.render404(req, res);
        } else {
          let file = await prisma.file.findFirst({
            where: {
              fileName: parts[2],
            }
          });
          if (file) {
            await prisma.file.update({
              where: {
                id: file.id,
              },
              data: {
                views: {
                  increment: 1
                }
              }
            });
            res.setHeader('Content-Type', file.mimetype);
          } else {
            const mimetype = mimes[extname(parts[2])] ?? 'application/octet-stream';
            res.setHeader('Content-Type', mimetype);
          }
          res.end(data);
        }
      } else {
        handle(req, res);
      }
      if (!(req.url.startsWith('/_next') || req.url.startsWith('/__nextjs'))) {
        res.statusCode === 200 ? info('URL', `${res.statusCode} ${req.url}`) : error('URL', `${res.statusCode} ${req.url}`);
      }
    });
    srv.on('error', (e) => {
      error('SERVER', e);
      process.exit(1);
    });
    srv.on('listening', async () => {
      info('SERVER', `Listening on ${config.core.host}:${config.core.port}`);
      const users = await prisma.user.findMany();
      if (users.length === 0) {
        await prismaRun(config.core.database_url, ['db', 'seed']);
      }
    });
    srv.listen(config.core.port, config.core.host ?? '0.0.0.0');
  } catch (e) {
    if (e.message && e.message.startsWith('Could not find a production')) {
      error('WEB', 'There is no production build - run yarn build');
    } else if (e.code && e.code === 'ENOENT') {
      if (e.path === './.next') error('WEB', 'There is no production build - run yarn build');
    } else {
      error('SERVER', e);
      process.exit(1);
    }
  }
})();
