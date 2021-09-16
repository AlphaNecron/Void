import prisma from '../../lib/prisma';
import cfg from '../../lib/config';
import { NextApiReq, NextApiRes, withAxtral } from '../../lib/middleware/withAxtral';
import { rm } from 'fs/promises';
import { join } from 'path';
import { info } from '../../lib/logger';

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
        success: 'false'
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

export default withAxtral(handler);