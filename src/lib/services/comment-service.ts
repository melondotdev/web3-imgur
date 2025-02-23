import type { ApiError } from '@/lib/types/response/api-response';
import type { CreateCommentRequest } from '@/lib/types/request/create-comment-request';
import type { CreateCommentResponse } from '@/lib/types/response/create-comment-response';

export async function createComment(
  postId: string,
  data: CreateCommentRequest,
): Promise<CreateCommentResponse> {
  const response = await fetch(`/api/post/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: data.text,
      author: data.username,
    }),
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

  return responseData as CreateCommentResponse;
}
