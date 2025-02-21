import type { ApiResponse } from '@/lib/types/response/api-response';

export interface Post {
  title: string;
  comment?: string;
  username: string;
  imageUrl: string;
}

export type CreatePostResponse = ApiResponse<Post>;
