import {PrismaAdapter} from '@next-auth/prisma-adapter';
import {verify} from 'argon2';
import config from 'lib/config';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';
import NextAuth, {User} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import DiscordProvider from 'next-auth/providers/discord';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res,{
    adapter: PrismaAdapter(prisma),
    pages: {
      signIn: '/auth/login',
      signOut: '/auth/logout',
      error: '/auth/error'
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
      maxAge: req.body['rememberMe'] ? 30 * 24 * 60 * 60 : 60 * 60,
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
      })
    ]
  });
}
