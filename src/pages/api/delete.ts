import { rm } from 'fs/promises';
import { join } from 'path';
import cfg from '../../lib/config';
import { info } from '../../lib/logger';
import { NextApiReq, NextApiRes, withDraconic } from '../../lib/middleware/withDraconic';
import prisma from '../../lib/prisma';

async function handler(req: NextApiReq, res: NextApiRes) {
  if (!req.query.token) return res.forbid('No deletion token provided');
  try {
    const file = await prisma.file.delete({
      where: {
        deletionToken: req.query.token
      }
    });
    if (!file) {
      return res.json({
        success: false
      });
    }
    await rm(join(process.cwd(), cfg.uploader.directory, file.fileName));
    info('USER', `Deleted ${file.fileName} (${file.id})`);
    return res.json({
      success: true
    });
  }
  catch {
    return res.json({
      success: false
    });
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

export default withDraconic(handler);