import type { DbPostComment } from '@/lib/types/db/post';
import type { Comment } from '@/lib/types/post';

export function mapDbCommentToComment(dbComment: DbPostComment): Comment {
  console.log('Raw DB Comment:', dbComment); // Debug log
  
  return {
    id: dbComment.id,
    author: dbComment.author,
    content: dbComment.content || '', // Ensure text is always defined
    createdAt: dbComment.created_at,
    votes: dbComment.votes,
  };
}