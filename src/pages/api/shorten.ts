import { default as cfg, default as config } from 'lib/config';
import generate from 'lib/generators';
import { info } from 'lib/logger';
import { NextApiReq, NextApiRes, withDraconic } from 'lib/middleware/withDraconic';
import prisma from 'lib/prisma';

async function handler(req: NextApiReq, res: NextApiRes) {
  if (req.method !== 'POST') return res.forbid('Invalid method');
  const usr = await req.user();
  if (!(req.headers.token || usr)) return res.forbid('Unauthorized');
  if (!config.shortener.allow_vanity) return res.forbid('Vanity URLs are not allowed');
  const user = await prisma.user.findFirst({
    where: {
      token: req.headers.token
    }
  }) || usr;
  if (!user) return res.forbid('Unauthorized');
  if (!req.body.destination) return res.error('No URL specified');
  if (req.body.vanity) {
    const existing = await prisma.url.findFirst({
      where: {
        short: req.body.vanity
      }
    });
    if (existing) return res.error('Vanity is already taken');
  }
  const rand = generate(cfg.shortener.length);
  const url = await prisma.url.create({
    data: {
      short: req.body.vanity ? req.body.vanity : rand,
      destination: req.body.destination,
      userId: user.id,
    },
  });
  info('URL', `User ${user.username} (${user.id}) shortened a URL: ${url.destination} (${url.id})`); 
  return res.json({
    url: `http${cfg.core.secure ? 's' : ''}://${req.headers.host}${cfg.shortener.route}/${url.short}`
  });
}

export default withDraconic(handler);