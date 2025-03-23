import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    oauthToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    oauthToken?: string;
  }
}
