import {Avatar, Button, Stack, Text} from '@mantine/core';
import Container from 'components/Container';
import StyledTooltip from 'components/StyledTooltip';
import {withIronSessionSsr} from 'iron-session/next';
import oauth from 'lib/oauth';
import prisma from 'lib/prisma';
import {DateTime} from 'luxon';
import {ironOptions} from 'middleware/withVoid';
import {GetServerSideProps} from 'next';
import {useRouter} from 'next/router';
import {useEffect} from 'react';
import {FiChevronLeft} from 'react-icons/fi';

export default function CallbackPage({id, username, tag, avatar, current}) {
  const router = useRouter();
  useEffect(() => {
    router.replace('/auth/callback', null, {shallow: true});
  }, []);
  return (
    <Container p='xl'>
      <Stack align='center'>
        <div style={{display: 'inline-flex', textAlign: 'center'}}>
          <Text size='xl' weight={700}>
            Successfully linked your account to
          </Text>
          <Text ml={4} size='xl' weight={700} color='void'>
            {current}
          </Text>
        </div>
        <Avatar size={128} src={`${avatar}?size=128`} radius={100} mt='md' mx='md'/>
        <StyledTooltip label={id}>
          <div style={{display: 'inline-flex', textAlign: 'center'}}>
            <Text size='lg' weight={700}>
              {username}
            </Text>
            <Text color='dimmed' size='lg' weight={700}>
              #{tag}
            </Text>
          </div>
        </StyledTooltip>
        <Button leftIcon={<FiChevronLeft/>} onClick={() => router.push('/dash/account')}>Back to Account</Button>
      </Stack>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = withIronSessionSsr<any>(async ({req, query}) => {
  const {code, state} = query;
  const rUser = req.session.user;
  if (!(code && state)) return {
    notFound: true
  };
  try {
    const data = await oauth.tokenRequest({
      code: code.toString(),
      scope: ['identify'],
      grantType: 'authorization_code'
    });
    const user = await oauth.getUser(data.access_token);
    const dUser = await prisma.user.findFirst({
      where: {
        discord: {
          id: user.id
        }
      },
      select: {
        id: true,
        avatar: true,
        username: true,
        name: true,
        email: true,
        embed: true,
        role: true,
        privateToken: true,
        password: true,
        discord: true
      }
    });
    if (!rUser && !(dUser && dUser.discord)) return {
      redirect: {
        destination: '/auth/login',
        statusCode: 308
      }
    };
    const avatar = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;
    const pData = {
      username: user.username,
      avatar,
      tag: user.discriminator,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: DateTime.now().plus({second: data.expires_in}).toJSDate()
    };
    const r = await prisma.discord.upsert({
      where: {
        id: user.id
      },
      create: {
        ...pData,
        id: user.id,
        userId: (rUser || dUser).id
      },
      update: pData,
      include: {
        user: {
          select: {
            username: true
          }
        }
      }
    });
    if (!rUser) {
      req.session.user = dUser;
      await req.session.save();
      return {
        redirect: {
          destination: '/dash',
          statusCode: 307
        }
      };
    }
    return {
      props: {
        id: user.id,
        username: user.username,
        tag: user.discriminator,
        avatar,
        current: r.user.username
      }
    };
  } catch (e) {
    console.log(e);
    return {
      notFound: true
    };
  }
  
}, ironOptions);
