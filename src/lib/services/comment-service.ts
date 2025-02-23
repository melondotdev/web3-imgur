import type { CreateCommentRequest } from '@/lib/types/request/create-comment-request';
import type { CreateCommentResponse } from '@/lib/types/response/create-comment-response';
import type { ApiError } from '@/lib/types/response/api-response';

export async function createComment(
  postId: string,
  data: CreateCommentRequest
): Promise<CreateCommentResponse> {
  const formData = new FormData();
  formData.append('comment', data.comment);
  formData.append('author', data.author);

  const response = await fetch(`/api/posts/${postId}/comments`, {
    method: 'POST',
    body: formData,
  });

  const responseData = await response.json();

  if (!response.ok) {
    const error = responseData as ApiError;
    throw new Error(
      error.details
        ? `${error.error}: ${error.details.map((d) => d.message).join(', ')}`
        : error.error
    );
  }

  return responseData as CreateCommentResponse;
}
