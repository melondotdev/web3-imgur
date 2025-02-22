// import type { ApiError } from '@/lib/types/response/api-response';
// import type { CreateCommentRequest } from '@/lib/types/request/create-comment-request';
// import type { CreateCommentResponse } from '@/lib/types/response/create-comment-response';

// export async function createComment(
//   data: CreateCommentRequest,
// ): Promise<CreateCommentResponse> {
//   const formData = new FormData();
//   formData.append('post', data.post);
//   formData.append('username', data.username);
//   formData.append('comment', data.comment);
  
//   const response = await fetch('/api/post', {
//     method: 'POST',
//     body: formData,
//   });

//   const responseData = await response.json();

//   if (!response.ok) {
//     const error = responseData as ApiError;
//     throw new Error(
//       error.details
//         ? `${error.error}: ${error.details.map((d) => d.message).join(', ')}`
//         : error.error,
//     );
//   }

//   return responseData as CreatePostResponse;
// }
