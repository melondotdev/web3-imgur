export function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
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
    'https://api.twitter.com/2/users/me?user.fields=profile_image_url',
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
