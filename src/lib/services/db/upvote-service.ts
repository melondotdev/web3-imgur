import { supabasePublicClient } from '@/lib/config/supabase';

export async function incrementVote(
  postId: string,
  signature: string,
  address: string,
): Promise<void> {
  try {
    console.log(`Incrementing vote for post ${postId} by address ${address}`);

    // First check if user has already voted
    const { data: existingVote, error: checkError } =
      await supabasePublicClient()
        .from('post_votes')
        .select()
        .eq('post_id', postId)
        .eq('voter_address', address)
        .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      console.error('Error checking existing vote:', checkError);
      throw new Error(`Failed to check existing vote: ${checkError.message}`);
    }

    if (existingVote) {
      throw new Error('You have already voted for this post');
    }

    // Start a transaction to create vote record and increment count
    const { error } = await supabasePublicClient().rpc('create_vote', {
      post_id: postId,
      voter_signature: signature,
      voter_address: address,
    });

    if (error) {
      console.error('Error creating vote:', error);
      throw new Error(`Failed to increment vote: ${error.message}`);
    }

    console.log('Vote successfully incremented');
  } catch (error) {
    console.error('Exception in incrementVote:', error);
    throw error;
  }
}

export async function removeVote(
  postId: string,
  address: string,
): Promise<void> {
  try {
    console.log(`Removing vote for post ${postId} by address ${address}`);

    const { error } = await supabasePublicClient().rpc('remove_vote', {
      post_id: postId,
      voter_address: address,
    });

    if (error) {
      console.error('Error removing vote:', error);
      throw new Error(`Failed to remove vote: ${error.message}`);
    }

    console.log('Vote successfully removed');
  } catch (error) {
    console.error('Exception in removeVote:', error);
    throw error;
  }
}

// Optional: Add function to check if user has voted
export async function hasUserVoted(
  postId: string,
  address: string,
): Promise<boolean> {
  try {
    const { data, error } = await supabasePublicClient()
      .from('post_votes')
      .select('*')
      .eq('post_id', postId)
      .eq('voter_address', address);

    if (error) {
      console.error('Error checking vote:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Exception in hasUserVoted:', error);
    return false;
  }
}
