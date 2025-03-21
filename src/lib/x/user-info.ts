interface XUserResponse {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url: string;
  };
}

interface XUserInfo {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
}

export async function getXUserInfo(accessToken: string): Promise<XUserInfo> {
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

  const data = (await response.json()) as XUserResponse;

  return {
    id: data.data.id,
    name: data.data.name,
    username: data.data.username,
    profile_image_url: data.data.profile_image_url,
  };
}
