import type { ApiError } from '@/lib/types/response/api-response';
import type { CreateCommentRequest } from '@/lib/types/request/create-comment-request';
import type { CreateCommentResponse } from '@/lib/types/response/create-comment-response';

export async function createComment(
  postId: string,
  data: CreateCommentRequest,
): Promise<CreateCommentResponse> {
  const response = await fetch(`/api/posts/${postId}/comments`, {
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
  console.log('API Response:', responseData); // Debug log

  if (!response.ok) {
    const error = responseData as ApiError;
    throw new Error(
      error.details
        ? `${error.error}: ${error.details.map((d) => d.message).join(', ')}`
        : error.error,
    );
  }

  // Extract the comment data from the response
  const commentData = responseData.comment;
  console.log('Comment Data:', commentData); // Debug log

  if (!commentData) {
    console.error('No comment data in response:', responseData);
    throw new Error('No comment data received from server');
  }

  // Ensure the response matches our expected type
  const comment: CreateCommentResponse = {
    id: commentData.id,
    author: commentData.author,
    content: commentData.content || data.text,
    createdAt: commentData.created_at || new Date().toISOString(), // Note: changed from createdAt to created_at
    votes: commentData.votes || 0
  };

  // Validate the required fields
  if (!comment.id || !comment.author || !comment.content) {
    console.error('Invalid comment data:', comment);
    throw new Error('Invalid comment data received from server');
  }

  return comment;
}