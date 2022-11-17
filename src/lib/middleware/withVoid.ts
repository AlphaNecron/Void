import type { EmbedOptions, Role } from '@prisma/client';
import type { IronSessionOptions } from 'iron-session';
import { withIronSessionApiRoute } from 'iron-session/next';
import { rateLimitCheck } from 'lib/cache';
import internal from 'void/internal';
import { isAdmin, Permission } from 'lib/permission';
import generate from 'lib/urlGenerator';
import type { NextApiRequest, NextApiResponse } from 'next';

export const ironOptions: IronSessionOptions = {
  cookieName: 'void_auth',
  password: (!internal.config || internal.config.void.secret.length === 0) ? generate('alphanumeric', 32) : internal.config.void.secret,
  cookieOptions: {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' && internal.config?.void?.useHttps || false
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

export interface VoidRequest extends NextApiRequest {
  files?: VoidFile[];
  file?: VoidFile;

  getUser(privateToken?: string): Promise<VoidUser | null>;

  getUserQuota(user: VoidUser): Promise<{
    role: string;
    used: number;
    remaining: number;
    total: number;
  } | null>;

  check(): Promise<boolean>;
}

export interface VoidResponse extends NextApiResponse {
  error(message: string, code?: number);

  forbid(message: string);

  notFound(message: string);

  notAllowed();

  unauthorized();

  noPermission(permission: Permission);

  rateLimited();

  success(data?);

  cache(ttl?: number);
}

export interface VoidError {
  code: number;
  error: string;
  context?: any;
}

export function withVoid(handler: (req: NextApiRequest, res: NextApiResponse) => unknown) {
  return withIronSessionApiRoute(async (req: VoidRequest, res: VoidResponse) => {
    const user = req.session.user;
    res.error = (message: string, code = 400) => res.status(code).json({
      code,
      error: message
    });
    res.forbid = (message: string) => res.error(message, 403);
    res.notFound = (message: string) => res.error(message, 404);
    res.notAllowed = () => res.error('Method is not allowed', 405);
    res.unauthorized = () => res.error('Unauthorized', 401);
    res.noPermission = (permission: Permission) => res.forbid(`Current user does not have ${Permission[permission]} permission.`);
    res.rateLimited = () => res.status(429).json({
      code: 429,
      error: 'You are being rate-limited.',
      context: {
        nextReset: res.getHeader('x-ratelimit-reset')
      }
    });
    res.success = (data?) => res.json({success: true, ...data});
    res.cache = ttl =>
      res.setHeader('Cache-Control', ttl <= 0 ? 'no-cache, no-store, max-age=0, must-revalidate' : `public, max-age=${ttl || 31536000}, immutable`);
    req.getUserQuota = async (user: VoidUser) => {
      const agg = await internal.prisma.file.aggregate({
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
        total: Number(user.role.storageQuota)
      };
    };
    req.getUser = async (privateToken?: string) => {
      if (!(privateToken || user)) return null;
      return await internal.prisma.user.findUnique({
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
    if (ip) {
      const rateLimited = rateLimitCheck(res, isAdmin(user?.role.permissions) ? Number.MAX_SAFE_INTEGER : internal.config.void.rateLimit, ip.toString());
      return rateLimited ? res.rateLimited() : handler(req, res);
    }
    return handler(req, res);
  }, ironOptions);
}
