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

export function generateCodeChallenge(verifier: string): string {
  // For simplicity we're using 'plain' method, but in production you should use 'S256'
  return verifier;
}
