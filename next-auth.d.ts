import {DefaultSession} from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string,
      role: string,
      permissions: number
    } & DefaultSession['user']
  }
  // interface User {
  //   id: string;
  //   name?: string | null;
  //   email?: string | null;
  //   image?: string | null;
  //   role: string;
  // }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
  }
}
