// Remove node:crypto import and use Web Crypto API
export function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

function generateNonce(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(Array.from(array, (byte) => String.fromCharCode(byte)).join(''))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function generateTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

export function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

export async function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret?: string,
): Promise<string> {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc: Record<string, string>, key) => {
      // Encode both key and value for parameter string
      acc[percentEncode(key)] = percentEncode(params[key]);
      return acc;
    }, {});

  // Create parameter string
  const paramString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  // Create signature base string
  const signatureBaseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(paramString),
  ].join('&');

  // Create signing key
  const signingKey = `${percentEncode(consumerSecret)}&${
    tokenSecret ? percentEncode(tokenSecret) : ''
  }`;

  // Generate signature using Web Crypto API
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(signingKey),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signatureBaseString),
  );

  // Convert to base64 and make URL-safe
  return btoa(
    Array.from(new Uint8Array(signature), (byte) =>
      String.fromCharCode(byte),
    ).join(''),
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function generateOAuthHeader(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerKey: string,
  consumerSecret: string,
  tokenSecret?: string,
): Promise<string> {
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: generateNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: generateTimestamp(),
    oauth_version: '1.0',
    ...params,
  };

  const signature = await generateOAuthSignature(
    method,
    url,
    oauthParams,
    consumerSecret,
    tokenSecret,
  );

  // Sort parameters alphabetically as required by OAuth 1.0a
  const allParams: Record<string, string> = {
    ...oauthParams,
    oauth_signature: signature,
  };
  const headerParams = Object.keys(allParams)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = percentEncode(allParams[key]);
      return acc;
    }, {});

  // Build the Authorization header
  return `OAuth ${Object.entries(headerParams)
    .map(([key, value]) => `${key}="${value}"`)
    .join(', ')}`;
}

export interface XUserResponse {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url: string;
  };
}

export async function getXUserInfo(
  accessToken: string,
): Promise<XUserResponse> {
  const response = await fetch(
    'https://api.x.com/2/users/me?user.fields=profile_image_url',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch X user info');
  }

  return response.json();
}

export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  // In production, we should use S256, but for this example we'll use plain
  // To use S256, uncomment the following code:
  /*
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  */
  return verifier; // Using plain method for simplicity
}
