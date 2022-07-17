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
    const data = {};
    const embedData = {};
    if (req.body.password) {
      data['password'] = await hash(req.body.password);
    }
    if (req.body.username) {
      const existing = await prisma.user.findUnique({
        where: {
          username: req.body.username
        }
      });
      if (existing && user.username !== req.body.username)
        return res.forbid('Username is already taken');
      data['username'] = req.body.username;
    }
    /// TODO: OPTIMIZE THIS SH!T
    if (req.body.name)
      data['name'] = req.body.name;
    if (req.body.enabled !== undefined)
      embedData['enabled'] = req.body.enabled === true;
    if (req.body.siteName)
      embedData['siteName'] = req.body.siteName;
    if (req.body.siteNameUrl)
      embedData['siteNameUrl'] = req.body.siteNameUrl;
    if (req.body.title)
      embedData['title'] = req.body.title;
    if (req.body.color && validateHex(req.body.color))
      embedData['color'] = req.body.color;
    if (req.body.description)
      embedData['description'] = req.body.description;
    if (req.body.author)
      embedData['author'] = req.body.author;
    if (req.body.authorUrl)
      embedData['authorUrl'] = req.body.authorUrl;
    console.log({
      where: {
        id: user.id
      },
      data: {
        ...data,
        ...(embedData !== {} && {
          embed: {
            update: embedData
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
    if (data !== {}) {
      const updated = await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          ...data,
          ...(embedData !== {} && {
            embed: {
              upsert: {
                update: embedData,
                create: embedData
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
