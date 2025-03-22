import { getServerEnv } from '@/lib/config/server-env';
import NextAuth from 'next-auth';
import Twitter from 'next-auth/providers/twitter';

const env = getServerEnv();

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Twitter({
      clientId: env.AUTH_CLIENT_ID,
      clientSecret: env.AUTH_CLIENT_SECRET,
    }),
  ],
});
