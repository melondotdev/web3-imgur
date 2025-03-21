import { getServerEnv } from '@/lib/config/server-env';
import { supabaseClient } from '@/lib/config/supabase';
import { generateOAuthHeader } from '@/lib/utils/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const env = getServerEnv();
  const { searchParams } = new URL(request.url);
  const oauthToken = searchParams.get('oauth_token');
  const oauthVerifier = searchParams.get('oauth_verifier');

  // Get stored tokens from cookies
  const cookieStore = await cookies();
  const storedToken = cookieStore.get('x_request_token')?.value;
  const storedTokenSecret = cookieStore.get('x_request_token_secret')?.value;

  // Create response for error case
  const errorResponse = NextResponse.redirect(
    `${env.NEXT_PUBLIC_APP_URL}/?error=x_auth_failed`,
  );
  errorResponse.cookies.delete('x_auth_state');
  errorResponse.cookies.delete('x_request_token');
  errorResponse.cookies.delete('x_request_token_secret');

  // Validate tokens
  if (
    !oauthToken ||
    !oauthVerifier ||
    !storedToken ||
    !storedTokenSecret ||
    oauthToken !== storedToken
  ) {
    console.error('Invalid auth parameters:', {
      hasOAuthToken: !!oauthToken,
      hasOAuthVerifier: !!oauthVerifier,
      hasStoredToken: !!storedToken,
      hasStoredTokenSecret: !!storedTokenSecret,
      tokenMatch: oauthToken === storedToken,
    });
    return errorResponse;
  }

  try {
    // Exchange request token for access token
    const accessTokenUrl = 'https://api.x.com/oauth/access_token';
    const oauthHeader = await generateOAuthHeader(
      'POST',
      accessTokenUrl,
      {
        oauth_token: oauthToken,
        oauth_verifier: oauthVerifier,
      },
      env.X_CLIENT_ID,
      env.X_CLIENT_SECRET,
      storedTokenSecret,
    );

    const accessTokenResponse = await fetch(accessTokenUrl, {
      method: 'POST',
      headers: {
        Authorization: oauthHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!accessTokenResponse.ok) {
      const errorText = await accessTokenResponse.text();
      console.error('Access token response error:', errorText);
      throw new Error('Failed to get access token');
    }

    const responseText = await accessTokenResponse.text();
    const params = new URLSearchParams(responseText);
    const accessToken = params.get('oauth_token');
    const accessTokenSecret = params.get('oauth_token_secret');
    const screenName = params.get('screen_name');
    const userId = params.get('user_id');

    if (!accessToken || !accessTokenSecret || !screenName || !userId) {
      throw new Error('Missing required tokens in response');
    }

    // Get Supabase client instance
    const supabase = supabaseClient();

    // Update user profile in Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        twitter_handle: screenName,
        twitter_user_id: userId,
        twitter_access_token: accessToken,
        twitter_access_token_secret: accessTokenSecret,
      })
      .eq('id', 'user_id'); // TODO: Get actual user ID from session

    if (updateError) {
      throw updateError;
    }

    // Create success response
    const response = NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/?auth=success`,
    );
    response.cookies.delete('x_auth_state');
    response.cookies.delete('x_request_token');
    response.cookies.delete('x_request_token_secret');
    return response;
  } catch (error) {
    console.error('X callback error:', error);
    return errorResponse;
  }
}
