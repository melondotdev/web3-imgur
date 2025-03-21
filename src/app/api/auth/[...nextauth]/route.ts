import { getServerEnv } from '@/lib/config/server-env';
import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';

const env = getServerEnv();

const handler = NextAuth({
  secret: env.NEXTAUTH_SECRET,
  // adapter: SupabaseAdapter({
  //   url: env.NEXT_PUBLIC_SUPABASE_URL,
  //   secret: env.SUPABASE_SERVICE_ROLE_KEY,
  // }),
  providers: [
    TwitterProvider({
      clientId: env.X_CLIENT_ID,
      clientSecret: env.X_CLIENT_SECRET,
      version: '2.0',
      profile(profile) {
        return {
          id: profile.data.id,
          name: profile.data.username,
          image: profile.data.profile_image_url,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      console.log('jwt', token, account);
      // Persist the OAuth access_token and oauth_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token as string;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('session', session, token);
      // Send properties to the client
      session.accessToken = token.accessToken;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
