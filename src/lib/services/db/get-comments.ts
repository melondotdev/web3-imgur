import { supabasePublicClient } from '@/lib/config/supabase';
import { mapDbCommentToComment } from '@/lib/mappers/comment-mapper';
import type { DbPostComment } from '@/lib/types/db/post';
import type { Comment } from '@/lib/types/post';

export async function getComments(postId: string): Promise<Comment[]> {
  // Get comments for specific post
  const { data: comments, error: commentsError } = await supabasePublicClient()
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (commentsError) {
    throw new Error(`Failed to fetch comments: ${commentsError.message}`);
  }

  // Transform DbPostComment[] to Comment[] using the mapper
  return (comments as DbPostComment[]).map(mapDbCommentToComment);
}
