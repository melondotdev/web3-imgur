import type { ApiResponse } from '@/lib/types/response/api-response';

export interface Comment {
  content: string;
  author: string;
  createdAt: string;
  votes: number;
}

export type CreatePostResponse = ApiResponse<Comment>;
