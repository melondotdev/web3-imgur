import { getServerEnv } from '@/lib/config/server-env';
import { generateState } from '@/lib/utils/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const env = getServerEnv();
  const state = generateState();

  // Create response with redirect
  const response = NextResponse.redirect(
    `https://twitter.com/i/oauth2/authorize?${new URLSearchParams({
      response_type: 'code',
      client_id: env.X_CLIENT_ID,
      redirect_uri: `${env.NEXT_PUBLIC_APP_URL}/api/auth/x/callback`,
      scope: 'users.read tweet.read',
      state: state,
    }).toString()}`,
  );

  // Set cookie in the response
  response.cookies.set('x_auth_state', state, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}
