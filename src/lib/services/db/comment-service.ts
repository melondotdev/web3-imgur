import { supabaseClient } from '@/lib/config/supabase';
import type { DbPostComment } from '@/lib/types/db/post';

type CreateCommentParams = {
  postId: string;
  author: string;
  content: string;
};

export async function createComment(params: CreateCommentParams): Promise<DbPostComment> {
  const { data: comment, error: commentError } = await supabaseClient()
    .from('comments')
    .insert({
      post_id: params.postId,
      author: params.author,
      content: params.content,
      created_at: new Date().toISOString(),
      votes: 0,
    })
    .select()
    .single();

  if (commentError) {
    throw new Error(`Failed to create comment: ${commentError.message}`);
  }

  if (!comment) {
    throw new Error('Failed to create comment: No data returned');
  }

  return comment as DbPostComment;
}