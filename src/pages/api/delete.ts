import {rm} from 'fs/promises';
import {resolve} from 'path';
import cfg from '../../lib/config';
import {info} from '../../lib/logger';
import {VoidRequest, VoidResponse, withVoid} from '../../lib/middleware/withVoid';
import prisma from '../../lib/prisma';

async function handler(req: VoidRequest, res: VoidResponse) {
  if (!req.query.token) return res.forbid('No deletion token provided');
  try {
    const file = await prisma.file.delete({
      where: {
        deletionToken: req.query.token as string
      },
      include: {
        user: true
      }
    });
    if (!file) {
      return res.forbid('File not found');
    }
    await rm(resolve(cfg.void.file.outputDirectory, file.user.id, file.id));
    info('USER', `Deleted ${file.fileName} (${file.id})`);
    return res.json({
      success: true
    });
  }
  catch {
    return res.forbid('Failed to delete the file');
  }
}

function run(middleware: any) {
  return (req, res) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result) => {
        if (result instanceof Error) reject(result);
        resolve(result);
      });
    });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default withVoid(handler);
