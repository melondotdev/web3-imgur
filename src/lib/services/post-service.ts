import type { CreatePostRequest } from '@/lib/types/request/create-post-request';
import type { ApiError } from '@/lib/types/response/api-response';
import type { CreatePostResponse } from '@/lib/types/response/create-post-response';

export async function createPost(
  data: CreatePostRequest,
): Promise<CreatePostResponse> {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('username', data.username);
  formData.append('image', data.image);
  formData.append('tags', JSON.stringify(data.tags));
  
  const response = await fetch('/api/post', {
    method: 'POST',
    body: formData,
  });

  const responseData = await response.json();

  if (!response.ok) {
    const error = responseData as ApiError;
    throw new Error(
      error.details
        ? `${error.error}: ${error.details.map((d) => d.message).join(', ')}`
        : error.error,
    );
  }

  return responseData as CreatePostResponse;
}
