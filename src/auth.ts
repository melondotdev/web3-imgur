import { getServerEnv } from '@/lib/config/server-env';
import NextAuth from 'next-auth';
import Twitter from 'next-auth/providers/twitter';

const env = getServerEnv();

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [Twitter],
  //   adapter: SupabaseAdapter({
  //     url: env.NEXT_PUBLIC_SUPABASE_URL,
  //     secret: env.SUPABASE_SERVICE_ROLE_KEY,
  //   }),
});
