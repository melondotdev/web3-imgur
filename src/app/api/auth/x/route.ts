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
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const authUrl = `https://twitter.com/i/oauth2/authorize?${new URLSearchParams(
    {
      response_type: 'code',
      client_id: env.X_CLIENT_ID,
      redirect_uri: `${env.NEXT_PUBLIC_APP_URL}/api/auth/x/callback`,
      scope: 'users.read tweet.read offline.access',
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'plain',
    },
  ).toString()}`;

  // Create HTML response with a button
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Connect with X</title>
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          .auth-button {
            background-color: #000;
            color: #fff;
            border: none;
            padding: 12px 24px;
            border-radius: 9999px;
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: background-color 0.2s;
          }
          .auth-button:hover {
            background-color: #333;
          }
        </style>
      </head>
      <body>
        <a href="${authUrl}" target="_blank" class="auth-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Continue with X
        </a>
        <script>
          // Close this window/tab after opening auth in new tab
          document.querySelector('.auth-button').addEventListener('click', () => {
            window.close();
          });
        </script>
      </body>
    </html>
  `;

  const response = new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });

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
