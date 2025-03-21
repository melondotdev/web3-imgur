import { getServerEnv } from '@/lib/config/server-env';
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
} from '@/lib/utils/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const env = getServerEnv();
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Create response with redirect
  const response = NextResponse.redirect(
    `https://x.com/i/oauth2/authorize?${new URLSearchParams({
      response_type: 'code',
      client_id: env.X_CLIENT_ID,
      redirect_uri: `${env.NEXT_PUBLIC_APP_URL}/api/auth/x/callback`,
      scope: 'tweet.read users.read offline.access',
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'plain', // Use 'S256' in production
    }).toString()}`,
  );

  // Set cookies in the response
  response.cookies.set('x_auth_state', state, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
  });

  response.cookies.set('x_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}
