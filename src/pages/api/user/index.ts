import {hash} from 'argon2';
import logger from 'lib/logger';
import prisma from 'lib/prisma';
import {validateHex} from 'lib/utils';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser();
  if (!user) return res.unauthorized();
  switch (req.method) {
  case 'PATCH': {
    const data = { embed: {} };
    if (req.body.password) {
      data['password'] = await hash(req.body.password);
    }
    if (req.body.username && req.body.username.toLowerCase() !== user.username.toLowerCase()) {
      const existing = await prisma.user.findUnique({
        where: {
          username: req.body.username
        }
      });
      if (existing)
        return res.forbid('Username is already taken');
      data['username'] = req.body.username;
    }
    /// TODO: OPTIMIZE THIS SH!T
    if (req.body.name)
      data['name'] = req.body.name;
    if (req.body.embed) {
      if (req.body.embed.enabled !== undefined)
        data['embed']['enabled'] = req.body.embed.enabled === true;
      if (req.body.embed.siteName)
        data['embed']['siteName'] = req.body.embed.siteName;
      if (req.body.embed.siteNameUrl)
        data['embed']['siteNameUrl'] = req.body.embed.siteNameUrl;
      if (req.body.embed.title)
        data['embed']['title'] = req.body.embed.title;
      if (req.body.embed.color && validateHex(req.body.embed.color))
        data['embed']['color'] = req.body.embed.color;
      if (req.body.embed.description)
        data['embed']['description'] = req.body.embed.description;
      if (req.body.embed.author)
        data['embed']['author'] = req.body.embed.author;
      if (req.body.embed.authorUrl)
        data['embed']['authorUrl'] = req.body.embed.authorUrl;
    }
    if (data !== { embed: {} }) {
      const updated = await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          ...data,
          ...(data['embed'] !== {} && {
            embed: {
              upsert: {
                update: data['embed'],
                create: data['embed']
              }
            }
          })
        },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          embed: true,
          role: true,
          privateToken: true
        }
      });
      logger.info(`User ${user.id} was updated`);
      req.session.user = updated;
      await req.session.save();
      return res.success();
    }
    return res.error('Nothing was updated.');
  }
  case 'GET': {
    delete user.email;
    delete user.privateToken;
    return res.json(user);
  }
  default:
    return res.notAllowed();
  }
}

export default withVoid(handler);
