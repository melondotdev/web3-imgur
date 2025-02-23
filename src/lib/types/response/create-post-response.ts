import type { ApiResponse } from '@/lib/types/response/api-response';

export interface Post {
  title: string;
  username: string;
  imageUrl: string;
  createdAt: string;
  votes: number;
  tags: string[];
}

export type CreatePostResponse = ApiResponse<Post>;
