import type { Comment } from '@/lib/types/post';

export interface CreateCommentResponse {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  votes: number;
}
