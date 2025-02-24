import { supabasePublicClient } from '@/lib/config/supabase';

export async function incrementCommentVote(commentId: string, signature: string, address: string): Promise<void> {
  // First check if user has already voted
  const { data: existingVote } = await supabasePublicClient()
    .from('comment_votes')
    .select()
    .eq('comment_id', commentId)
    .eq('voter_address', address)
    .single();

  if (existingVote) {
    throw new Error('You have already voted for this comment');
  }

  // Start a transaction to create vote record and increment count
  const { error } = await supabasePublicClient()
    .rpc('create_comment_vote', {
      comment_id: commentId,
      voter_signature: signature,
      voter_address: address
    });

  if (error) {
    throw new Error(`Failed to increment vote: ${error.message}`);
  }
}

export async function removeCommentVote(commentId: string, address: string): Promise<void> {
  const { error } = await supabasePublicClient()
    .rpc('remove_comment_vote', {
      comment_id: commentId,
      voter_address: address
    });
  
  if (error) {
    throw new Error(`Failed to remove vote: ${error.message}`);
  }
}

export async function hasUserVotedComment(commentId: string, address: string): Promise<boolean> {
  const { data } = await supabasePublicClient()
    .from('comment_votes')
    .select()
    .eq('comment_id', commentId)
    .eq('voter_address', address)
    .single();

  return !!data;
} 