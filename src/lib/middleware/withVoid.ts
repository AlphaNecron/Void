import {Role} from '@prisma/client';
import type {NextApiRequest, NextApiResponse} from 'next';
import {getSession} from 'next-auth/react';
import prisma from '../prisma';
import {Permission} from 'lib/permission';

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
}

export type VoidResponse = NextApiResponse & {
  error: (message: string, code?: number) => void;
  forbid: (message: string) => void;
  notFound: (message: string) => void;
  notAllowed: () => void;
  unauthorized: () => void;
  noPermission: (permission: Permission) => void;
  bad: (message: string) => void;
  json: (json: any) => void;
}

export const withVoid = (handler: (req: NextApiRequest, res: NextApiResponse) => unknown) => (req: VoidRequest, res: VoidResponse) => {
  res.error = (message: string, code?: number) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(code || 400);
    res.json({
      code: code || 400,
      error: message
    });
  };
  res.forbid = (message: string) => res.error(message, 403);
  res.bad = (message: string) => res.error(message, 401);
  res.notFound = (message: string) => res.error(message, 404);
  res.notAllowed = () => res.error('Method is not allowed', 405);
  res.unauthorized = () => res.forbid('Unauthorized');
  res.noPermission = (permission: Permission) => res.forbid(`Current user does not have ${Permission[permission]} permission.`);
  res.json = (json: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(json));
  };
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
      total: Number(user.role.storageQuota)
    };
  };
  req.getUser = async (privateToken?: string) => {
    if (privateToken) {
      return await prisma.user.findUnique({
        where: {
          privateToken
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
    }
    const session = await getSession({ req });
    if (!session) return null;
    return await prisma.user.findUnique({
      where: {
        id: session.user.id
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
  return handler(req, res);
};
