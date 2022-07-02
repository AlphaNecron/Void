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
    if (req.body.password) {
      data['password'] = await hash(req.body.password);
    }
    if (req.body.username) {
      const existing = await prisma.user.findUnique({
        where: {
          username: req.body.username
        }
      });
      if (existing && user.username !== req.body.username) {
        return res.forbid('Username is already taken');
      }
      data['username'] = req.body.username;
    }
    /// TODO: OPTIMIZE THIS SH!T
    if (req.body.name)
      data['name'] = req.body.name;
    if ('embedEnabled' in req.body)
      data['embedEnabled'] = req.body.embedEnabled === true;
    if (req.body.embedSiteName)
      data['embedSiteName'] = req.body.embedSiteName;
    if (req.body.embedSiteNameUrl)
      data['embedSiteNameUrl'] = req.body.embedSiteNameUrl;
    if (req.body.embedTitle)
      data['embedTitle'] = req.body.embedTitle;
    if (req.body.embedColor && validateHex(req.body.embedColor))
      data['embedColor'] = req.body.embedColor;
    if (req.body.embedDescription)
      data['embedDescription'] = req.body.embedDescription;
    if (req.body.embedAuthor)
      data['embedAuthor'] = req.body.embedAuthor;
    if (req.body.embedAuthorUrl)
      data['embedAuthorUrl'] = req.body.embedAuthorUrl;
    if (data !== {}) {
      const updated = await prisma.user.update({
        where: {
          id: user.id
        },
        data,
        select: {
          username: true,
          name: true,
          embedEnabled: true,
          embedSiteName: true,
          embedSiteNameUrl: true,
          embedTitle: true,
          embedColor: true,
          embedDescription: true,
          embedAuthor: true,
          embedAuthorUrl: true
        }
      });
      logger.info(`User ${user.id} was updated`, updated);
      return res.json(updated);
    }
    res.bad('Nothing was updated.');
    break;
  }
  case 'GET': {
    delete user.email;
    delete user.privateToken;
    delete user.role;
    res.json(user);
    break;
  }
  default:
    res.notAllowed();
  }
}

export default withVoid(handler);
