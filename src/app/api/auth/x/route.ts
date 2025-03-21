import { getServerEnv } from '@/lib/config/server-env';
import {
  generateOAuthHeader,
  generateState,
  percentEncode,
} from '@/lib/utils/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const env = getServerEnv();

  try {
    const state = generateState();
    const callbackUrl = `${env.NEXT_PUBLIC_APP_URL}/api/auth/x/callback`;

    // Get request token
    const requestTokenUrl = 'https://api.x.com/oauth/request_token';

    // Log the OAuth parameters for debugging
    console.log('[X Auth] Step 1 - Request Token Start');
    console.log('[X Auth] Parameters:', {
      method: 'POST',
      url: requestTokenUrl,
      callback: callbackUrl,
      clientId: `${env.X_CLIENT_ID?.slice(0, 5)}...`, // Log partial ID for security
    });

    // The oauth_callback must be URL encoded
    const encodedCallback = percentEncode(callbackUrl);
    console.log('[X Auth] Encoded callback:', encodedCallback);

    const oauthHeader = await generateOAuthHeader(
      'POST',
      requestTokenUrl,
      {
        oauth_callback: encodedCallback,
      },
      env.X_CLIENT_ID,
      env.X_CLIENT_SECRET,
    );

    console.log('[X Auth] Generated OAuth Header:', oauthHeader);

    const requestTokenResponse = await fetch(requestTokenUrl, {
      method: 'POST',
      headers: {
        Authorization: oauthHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      // The body parameter should be encoded but not double-encoded
      body: `oauth_callback=${encodedCallback}`,
    });

    if (!requestTokenResponse.ok) {
      const errorText = await requestTokenResponse.text();
      console.error('[X Auth] Request token error:', {
        status: requestTokenResponse.status,
        statusText: requestTokenResponse.statusText,
        error: errorText,
        headers: Object.fromEntries(requestTokenResponse.headers.entries()),
      });
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/?error=x_auth_failed`,
      );
    }

    const responseText = await requestTokenResponse.text();
    console.log('[X Auth] Request token response:', responseText);

    const params = new URLSearchParams(responseText);
    const oauthToken = params.get('oauth_token');
    const oauthTokenSecret = params.get('oauth_token_secret');
    const callbackConfirmed = params.get('oauth_callback_confirmed');

    if (!oauthToken || !oauthTokenSecret || callbackConfirmed !== 'true') {
      console.error('[X Auth] Invalid oauth response:', {
        hasToken: !!oauthToken,
        hasSecret: !!oauthTokenSecret,
        callbackConfirmed,
        fullResponse: responseText,
      });
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/?error=x_auth_failed`,
      );
    }

    console.log('[X Auth] Step 1 - Request Token Success:', {
      hasToken: !!oauthToken,
      hasSecret: !!oauthTokenSecret,
      callbackConfirmed,
    });

    // Create response with redirect to X auth page
    const response = NextResponse.redirect(
      `https://api.x.com/oauth/authorize?oauth_token=${oauthToken}`,
    );

    // Store tokens and state in cookies
    response.cookies.set('x_auth_state', state, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });

    response.cookies.set('x_request_token', oauthToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10,
    });

    response.cookies.set('x_request_token_secret', oauthTokenSecret, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10,
    });

    return response;
  } catch (error) {
    console.error('[X Auth] Unexpected error:', error);
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/?error=x_auth_failed`,
    );
  }
}
