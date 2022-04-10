import {info} from 'lib/logger';
import prisma from 'lib/prisma';
// import { hashPassword } from 'lib/utils';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';
import {hash} from 'argon2';
import {validateHex} from 'lib/utils';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser();
  if (!user) return res.unauthorized();
  if (req.method === 'PATCH') {
    let data = {};
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
      info('USER', `User ${user.username} (${updated.username}) (${user.id}) was updated`);
      return res.json(updated);
    }
    return res.bad('Nothing was updated.');
  }
  else if (req.method === 'GET') {
    delete user.email;
    delete user.privateToken;
    delete user.role;
    return res.json(user);
  } else return res.notAllowed();
}

export default withVoid(handler);
