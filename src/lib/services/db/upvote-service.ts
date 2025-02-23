import { supabasePublicClient } from '@/lib/config/supabase';

export async function incrementVote(postId: string, signature: string, address: string): Promise<void> {
  // First check if user has already voted
  const { data: existingVote } = await supabasePublicClient()
    .from('post_votes')
    .select()
    .eq('post_id', postId)
    .eq('voter_address', address)
    .single();

  if (existingVote) {
    throw new Error('You have already voted for this post');
  }

  // Start a transaction to create vote record and increment count
  const { error } = await supabasePublicClient()
    .rpc('create_vote', {
      post_id: postId,
      voter_signature: signature,
      voter_address: address
    });

  if (error) {
    throw new Error(`Failed to increment vote: ${error.message}`);
  }
}

export async function removeVote(postId: string, address: string): Promise<void> {
  const { error } = await supabasePublicClient()
    .rpc('remove_vote', {
      post_id: postId,
      voter_address: address
    });
  
  if (error) {
    throw new Error(`Failed to remove vote: ${error.message}`);
  }
}

// Optional: Add function to check if user has voted
export async function hasUserVoted(postId: string, address: string): Promise<boolean> {
  const { data } = await supabasePublicClient()
    .from('post_votes')
    .select()
    .eq('post_id', postId)
    .eq('voter_address', address)
    .single();

  return !!data;
}
