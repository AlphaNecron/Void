import {Role} from '@prisma/client';
import {check} from 'lib/cache';
import config from 'lib/config';
import {hasPermission, Permission} from 'lib/permission';
import type {NextApiRequest, NextApiResponse} from 'next';
import {getSession} from 'next-auth/react';
import prisma from '../prisma';

export interface VoidFile {
  fieldname: string,
  originalname: string,
  encoding: string,
  mimetype: string,
  buffer: Buffer,
  size: number;
}

export type VoidUser = {
  id: string,
  username?: string,
  name?: string,
  email?: string,
  role: Role,
  embedEnabled: boolean;
  embedSiteName: string,
  embedTitle?: string,
  embedColor: string,
  embedDescription?: string,
  embedAuthor?: string,
  embedAuthorUrl?: string,
  privateToken?: string
}

export type VoidRequest = NextApiRequest & {
  getUser: (privateToken?: string) => Promise<VoidUser | null>;
  getUserQuota: (user: VoidUser) => Promise<{
    role: string;
    used: number;
    remaining: number;
    total: number;
  } | null>;
  files?: VoidFile[];
  check: () => Promise<boolean>;
}

export type VoidResponse = NextApiResponse & {
  error: (message: string, code?: number) => void;
  forbid: (message: string) => void;
  notFound: (message: string) => void;
  notAllowed: () => void;
  unauthorized: () => void;
  noPermission: (permission: Permission) => void;
  rateLimited: () => void;
  bad: (message: string) => void;
}

export const withVoid = (handler: (req: NextApiRequest, res: NextApiResponse) => unknown) => async (req: VoidRequest, res: VoidResponse) => {
  res.error = (message: string, code = 400) => res.status(code).json({
    error: message
  });
  res.forbid = (message: string) => res.error(message, 403);
  res.bad = (message: string) => res.error(message, 401);
  res.notFound = (message: string) => res.error(message, 404);
  res.notAllowed = () => res.error('Method is not allowed', 405);
  res.unauthorized = () => res.forbid('Unauthorized');
  res.noPermission = (permission: Permission) => res.forbid(`Current user does not have ${Permission[permission]} permission.`);
  res.rateLimited = () => res.status(429).json({ error: 'You are being rate-limited.', nextReset: res.getHeader('x-ratelimit-reset') });
  req.getUserQuota = async (user: VoidUser) => {
    const agg = await prisma.file.aggregate({
      where: {
        userId: user.id
      },
      _sum: {
        size: true
      }
    });
    return {
      role: user.role.name,
      used: Number(agg._sum.size) || 0,
      remaining: Number(user.role.storageQuota) - Number(agg._sum.size),
      total: Number(user.role.storageQuota),
    };
  };
  const session = await getSession({req});
  req.getUser = async (privateToken?: string) => {
    if (!(privateToken || session)) return null;
    return await prisma.user.findUnique({
      where: {
        [privateToken ? 'privateToken' : 'id']: privateToken || session.user.id
      },
      select: {
        id: true,
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
        privateToken: true
      }
    });
  };
  const ip = req.headers['x-forwarded-for']?.toString().split(',').shift() || req.headers['x-real-ip'] || req.connection.remoteAddress;
  const rateLimited = check(res, config.void.rateLimit, ip.toString()) && !hasPermission(session?.user?.permissions, Permission.ADMINISTRATION);
  return rateLimited ? res.rateLimited() : handler(req, res);
};
