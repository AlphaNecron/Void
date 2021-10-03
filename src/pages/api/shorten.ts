import { default as config } from 'lib/config';
import generate from 'lib/generators';
import { info } from 'lib/logger';
import { NextApiReq, NextApiRes, withVoid } from 'lib/middleware/withVoid';
import prisma from 'lib/prisma';
import { hashPassword } from 'lib/utils';

async function handler(req: NextApiReq, res: NextApiRes) {
  if (req.method !== 'POST') return res.forbid('Invalid method');
  const usr = await req.user();
  if (!(req.headers.authorization || usr)) return res.forbid('Unauthorized');
  if (!config.shortener.allow_vanity) return res.forbid('Vanity URLs are not allowed');
  const user = req.headers.authorization ? (await prisma.user.findFirst({
    where: {
      token: req.headers.authorization
    }
  })) : usr;
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
  const rand = generate(config.shortener.length);
  if (req.body.password) var password = await hashPassword(req.body.password);
  const url = await prisma.url.create({
    data: {
      short: req.body.vanity ? req.body.vanity : rand,
      destination: req.body.destination,
      userId: user.id,
      password
    }
  });
  info('URL', `User ${user.username} (${user.id}) shortened a URL: ${url.destination} (${url.id})`); 
  return res.json({
    url: `http${config.core.secure ? 's' : ''}://${req.headers.host}${config.shortener.route}/${url.short}`
  });
}

export default withVoid(handler);