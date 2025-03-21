import { getServerEnv } from '@/lib/config/server-env';
import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';

const env = getServerEnv();

const handler = NextAuth({
  providers: [
    TwitterProvider({
      clientId: env.X_CLIENT_ID,
      clientSecret: env.X_CLIENT_SECRET,
      version: '2.0',
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token and oauth_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token as string;
        token.oauthToken = account.oauth_token as string;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken;
      session.oauthToken = token.oauthToken;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
