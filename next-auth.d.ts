import {DefaultSession} from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string,
      role: string,
      permissions: number
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
  }
}
