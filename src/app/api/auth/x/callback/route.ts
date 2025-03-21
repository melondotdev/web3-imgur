import { getServerEnv } from '@/lib/config/server-env';
import { supabaseClient } from '@/lib/config/supabase';
import { getXUserInfo } from '@/lib/x/user-info';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const env = getServerEnv();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Get stored state from cookie
  const cookieStore = await cookies();
  const storedState = cookieStore.get('x_auth_state')?.value;

  // Create response for error case
  const errorResponse = NextResponse.redirect(
    `${env.NEXT_PUBLIC_APP_URL}/profile?error=x_auth_failed`,
  );
  errorResponse.cookies.delete('x_auth_state');

  // Validate state and code
  if (!code || !state || !storedState || state !== storedState) {
    return errorResponse;
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      'https://api.twitter.com/2/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${env.X_CLIENT_ID}:${env.X_CLIENT_SECRET}`,
          ).toString('base64')}`,
        },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          redirect_uri: `${env.NEXT_PUBLIC_APP_URL}/api/auth/x/callback`,
          code_verifier: 'challenge',
        }),
      },
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const { access_token } = await tokenResponse.json();

    // Get user info from X
    const userInfo = await getXUserInfo(access_token);

    // Get Supabase client instance
    const supabase = supabaseClient();

    // Update user profile in Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        twitter_handle: userInfo.username,
        username: userInfo.name,
        avatar: userInfo.profile_image_url,
      })
      .eq('id', 'user_id'); // TODO: Get actual user ID from session

    if (updateError) {
      throw updateError;
    }

    // Create success response
    const response = NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/profile`,
    );
    response.cookies.delete('x_auth_state');
    return response;
  } catch (error) {
    console.error('X callback error:', error);
    return errorResponse;
  }
}
