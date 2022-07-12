import {verify} from 'argon2';
import {VoidRequest, VoidResponse, withVoid} from 'lib/middleware/withVoid';
import prisma from 'lib/prisma';

async function handler(req: VoidRequest, res: VoidResponse) {
  if (req.method !== 'POST') return res.notAllowed();
  const {username, password} = req.body;
  if (!(username && password)) return res.forbid('Invalid credentials.');
  const user = await prisma.user.findUnique({
    where: {
      username
    },
    select: {
      id: true,
      avatar: true,
      username: true,
      name: true,
      email: true,
      embedEnabled: true,
      embedSiteName: true,
      embedSiteNameUrl: true,
      embedTitle: true,
      embedColor: true,
      embedDescription: true,
      embedAuthor: true,
      embedAuthorUrl: true,
      role: true,
      privateToken: true,
      password: true
    }
  });
  if (!user) return res.notFound('User not found.');
  const validPwd = await verify(user.password, password);
  if (!validPwd) return res.forbid('Wrong password.');
  delete user.password;
  req.session.user = user;
  await req.session.save();
  return res.success();
}

export default withVoid(handler);
