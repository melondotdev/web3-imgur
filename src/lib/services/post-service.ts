import type { CreatePostRequest } from '@/lib/types/request/create-post-request';
import type { ApiError } from '@/lib/types/response/api-response';
import type { CreatePostResponse } from '@/lib/types/response/create-post-response';

export async function createPost(formData: FormData) {
  const response = await fetch('/api/post', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw await response.json();
  }

  return response.json();
}
