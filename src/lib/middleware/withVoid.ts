import {EmbedOptions, Role} from '@prisma/client';
import {IronSessionOptions} from 'iron-session';
import {withIronSessionApiRoute} from 'iron-session/next';
import {check} from 'lib/cache';
import config from 'lib/config';
import {isAdmin, Permission} from 'lib/permission';
import generate from 'lib/urlGenerator';
import type {NextApiRequest, NextApiResponse} from 'next';
import prisma from '../prisma';

export const ironOptions: IronSessionOptions = {
  cookieName: 'void_auth',
  password: (!config || config.void.secret.length === 0) ? generate('alphanumeric', 32) : config.void.secret,
  cookieOptions: {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' && config?.void?.useHttps || false
  }
};

export type VoidFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export type VoidUser = {
  id: string;
  username: string;
  name?: string;
  email?: string;
  role: Role;
  embed?: EmbedOptions
  privateToken?: string;
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
  file?: VoidFile;
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
  success: (data?) => void;
}

export function withVoid(handler: (req: NextApiRequest, res: NextApiResponse) => unknown) {
  return withIronSessionApiRoute(async (req: VoidRequest, res: VoidResponse) => {
    const user = req.session.user;
    res.error = (message: string, code = 400) => res.status(code).json({
      error: message
    });
    res.forbid = (message: string) => res.error(message, 403);
    res.notFound = (message: string) => res.error(message, 404);
    res.notAllowed = () => res.error('Method is not allowed', 405);
    res.unauthorized = () => res.error('Unauthorized', 401);
    res.noPermission = (permission: Permission) => res.forbid(`Current user does not have ${Permission[permission]} permission.`);
    res.rateLimited = () => res.status(429).json({
      error: 'You are being rate-limited.',
      nextReset: res.getHeader('x-ratelimit-reset')
    });
    res.success = (data?) => res.json({success: true, ...data});
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
    req.getUser = async (privateToken?: string) => {
      if (!(privateToken || user)) return null;
      return await prisma.user.findUnique({
        where: {
          [privateToken ? 'privateToken' : 'id']: privateToken || user.id
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
    };
    const ip = req.headers['x-forwarded-for']?.toString().split(',').shift() || req.headers['x-real-ip'] || req.connection.remoteAddress;
    const rateLimited = check(res, isAdmin(user?.role.permissions) ? Number.MAX_SAFE_INTEGER : config.void.rateLimit, ip.toString());
    return rateLimited ? res.rateLimited() : handler(req, res);
  }, ironOptions);
}
