import internal from 'void/internal';
import { addToDate } from 'lib/utils';
import { VoidRequest, VoidResponse, withVoid } from 'middleware/withVoid';

async function handler(req: VoidRequest, res: VoidResponse) {
  const user = await req.getUser();
  if (!user) return res.unauthorized();
  if (!internal.oauth) return res.forbid('Discord OAuth is not enabled.');
  const discord = await internal.prisma.discord.findUnique({
    where: {
      userId: user.id
    },
    select: {
      id: true,
      username: true,
      tag: true,
      avatar: true,
      expiresAt: true,
      refreshToken: true,
      accessToken: true
    }
  });
  if (!discord) return res.notFound('Discord profile not found, user is not linked with Discord.');
  const expired = discord.expiresAt <= new Date();
  switch (req.method) {
  case 'GET': {
    if (expired) {
      try {
        const data = await internal.oauth.tokenRequest({
          refreshToken: discord.refreshToken,
          grantType: 'refresh_token',
          scope: ['identify']
        });
        const date = addToDate(new Date(), data.expires_in);
        const r = await internal.prisma.discord.update({
          where: {
            id: discord.id
          },
          data: {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: date
          },
          select: {
            id: true,
            username: true,
            tag: true,
            avatar: true
          }
        });
        return res.json(r);
      } catch (e) {
      }
    }
    delete discord.expiresAt;
    delete discord.refreshToken;
    delete discord.accessToken;
    return res.json(discord);
  }
  case 'DELETE': {
    if (!expired) {
      try {
        await internal.oauth.revokeToken(discord.accessToken);
      } catch {
      }
    }
    await internal.prisma.discord.delete({
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
