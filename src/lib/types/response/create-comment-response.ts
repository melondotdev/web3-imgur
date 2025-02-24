import type { Comment } from '@/lib/types/post';

export interface CreateCommentResponse {
  id: string;
  createdAt: string;
  votes: number;
  author: string;
  content: string;
  comment: Comment;
}
