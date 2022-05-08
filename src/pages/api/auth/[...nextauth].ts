import {PrismaAdapter} from '@next-auth/prisma-adapter';
import {verify} from 'argon2';
import config from 'lib/config';
import logger from 'lib/logger';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';
import NextAuth, {User} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import DiscordProvider from 'next-auth/providers/discord';
import GitHubProvider from 'next-auth/providers/github';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res,{
    adapter: PrismaAdapter(prisma),
    pages: {
      signIn: '/auth/login',
      signOut: '/auth/logout',
      error: '/auth/error'
    },
    logger: {
      error(code, metadata) {
        logger.error(code, metadata);
      },
      warn(code) {
        logger.warn(code);
      },
      debug(code, metadata) {
        logger.debug(code, metadata);
      }
    },
    events: {
      signIn({ user, account, isNewUser }) {
        logger.info(`User ${user.id} has logged in with ${account.provider}${isNewUser ? ' as a new user' : ''}.`, { meta: { user } });
      }
    },
    callbacks: {
      async jwt({ token, account, user }) {
        if (account) {
          token.accessToken = account.access_token;
        }
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      async session({ session, user, token }) {
        const usr = await prisma.user.findUnique({
          where: {
            id: user?.id || token.id
          },
          include: {
            role: true
          }
        });
        if (!session.user.name) session.user.name = usr.name || usr.username;
        if (!session.user.image) session.user.image = usr.image;
        session.user.id = usr.id;
        session.user.role = usr.role.name;
        session.user.permissions = usr.role.permissions;
        return session;
      }
    },
    useSecureCookies: process.env.NODE_ENV !== 'development' && config.void.useHttps,
    session: {
      strategy: 'jwt'
    },
    debug: process.env.NODE_ENV === 'development',
    providers: [
      CredentialsProvider({
        id: 'credentials',
        name: 'Credentials',
        credentials: {
          username: { label: 'Username', type: 'text' },
          password: { label: 'Password', type: 'password' }
        },
        authorize: async (credentials): Promise<User> => {
          const user = await prisma.user.findUnique({
            where: {
              username: credentials.username
            }
          });
          if (!user) return null;
          if (user.password) {
            const isValid = await verify(user.password, credentials.password);
            return isValid ? ({
              id: user.id,
              email: user.email,
              image: user.image,
            }) : null;
          }
          return null;
        }
      }),
      DiscordProvider({
        clientId: config.void.authProviders.discord.clientId,
        clientSecret: config.void.authProviders.discord.clientSecret
      }),
      GitHubProvider({
        clientId: config.void.authProviders.github.clientId,
        clientSecret: config.void.authProviders.github.clientSecret
      })
    ]
  });
}
