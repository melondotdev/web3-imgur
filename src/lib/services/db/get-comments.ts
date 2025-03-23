import { supabasePublicClient } from '@/lib/config/supabase';
import { mapDbCommentToComment } from '@/lib/mappers/comment-mapper';
import type { DbPostComment } from '@/lib/types/db/post';
import type { Comment } from '@/lib/types/post';

export async function getComments(postId: string): Promise<Comment[]> {
  // Get comments for specific post with user profiles
  const { data: comments, error: commentsError } = await supabasePublicClient()
    .from('comments')
    .select(`
      *,
      users:author (
        twitter_handle,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (commentsError) {
    throw new Error(`Failed to fetch comments: ${commentsError.message}`);
  }

  // Transform DbPostComment[] to Comment[] using the mapper
  return (
    comments as (DbPostComment & {
      users: { twitter_handle?: string; avatar_url?: string } | null;
    })[]
  ).map(mapDbCommentToComment);
}
