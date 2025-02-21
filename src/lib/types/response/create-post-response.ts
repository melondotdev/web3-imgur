import type { ApiResponse } from '@/lib/types/response/api-response';

export interface Post {
  id: string;
  title: string;
  username: string;
  imageUrl: string;
  tags: string[];
  createdAt: string;
  votes: number;
  comments: string[];
}

export type CreatePostResponse = ApiResponse<Post>;
