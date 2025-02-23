import type { ApiResponse } from '@/lib/types/response/api-response';

export interface Comment {
  comment: string;
  author: string;
  createdAt: string;
  votes: number;
}

export type CreateCommentResponse = ApiResponse<Comment>;
