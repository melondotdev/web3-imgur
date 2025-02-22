import type { ApiResponse } from '@/lib/types/response/api-response';

export interface Post {
  title: string;
  username: string;
  imageUrl: string;
  tags: string[];
  createdAt: string;
  votes: number;
}

export type CreatePostResponse = ApiResponse<Post>;
