import oauth from 'lib/oauth';
import prisma from 'lib/prisma';
import {addToDate} from 'lib/utils';
import {VoidRequest, VoidResponse, withVoid} from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser();
  if (!user) return res.unauthorized();
  if (!oauth) return res.forbid('Discord OAuth is not enabled.');
  const discord = await prisma.discord.findUnique({
    where: {
      userId: user.id
    },
    select: {
      id: true,
      username: true,
      tag: true,
      avatar: true,
      expiresIn: true,
      refreshToken: true,
      accessToken: true
    }
  });
  if (!discord) return res.notFound('Discord profile not found, user is not linked with Discord.');
  const expired = discord.expiresIn <= new Date();
  switch (req.method) {
  case 'GET': {
    if (expired) {
      try {
        const data = await oauth.tokenRequest({
          refreshToken: discord.refreshToken,
          grantType: 'refresh_token',
          scope: ['identify']
        });
        const date = addToDate(new Date(), data.expires_in);
        const r = await prisma.discord.update({
          where: {
            id: discord.id
          },
          data: {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: date
          },
          select: {
            id: true,
            username: true,
            tag: true,
            avatar: true
          }
        });
        return res.json(r);
      } catch (e) {}
    }
    delete discord.expiresIn;
    delete discord.refreshToken;
    delete discord.accessToken;
    return res.json(discord);
  }
  case 'DELETE': {
    if (!expired) {
      try {
        await oauth.revokeToken(discord.accessToken);
      } catch {}
    }
    await prisma.discord.delete({
      where: {
        id: discord.id
      }
    });
    return res.success();
  }
  default:
    return res.notAllowed();
  }
 
}

export default withVoid(handler);
