import { supabasePublicClient } from '@/lib/config/supabase';
import { etc, verify } from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

// Configure SHA-512 for ed25519
etc.sha512Sync = (...m: Uint8Array[]) => sha512(Buffer.concat(m));

interface VoteSignature {
  signature: string;
  message: string;
}

export async function incrementCommentVote(
  commentId: string,
  signature: string,
  address: string,
  signatureData: VoteSignature,
): Promise<void> {
  try {
    // Verify signature
    const decodedSignature = bs58.decode(signatureData.signature);
    const message = new TextEncoder().encode(signatureData.message);
    const publicKey = new PublicKey(address);

    const isValid = await verify(
      decodedSignature,
      message,
      publicKey.toBytes(),
    );
    if (!isValid) {
      throw new Error('Invalid signature');
    }

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
    const { error } = await supabasePublicClient().rpc('create_comment_vote', {
      comment_id: commentId,
      voter_signature: signature,
      voter_address: address,
    });

    if (error) {
      throw new Error(`Failed to increment vote: ${error.message}`);
    }
  } catch (error) {
    console.error('Error incrementing comment vote:', error);
    throw error;
  }
}

export async function removeCommentVote(
  commentId: string,
  address: string,
  signatureData: VoteSignature,
): Promise<void> {
  try {
    // Verify signature
    const decodedSignature = bs58.decode(signatureData.signature);
    const message = new TextEncoder().encode(signatureData.message);
    const publicKey = new PublicKey(address);

    const isValid = await verify(
      decodedSignature,
      message,
      publicKey.toBytes(),
    );
    if (!isValid) {
      throw new Error('Invalid signature');
    }

    const { error } = await supabasePublicClient().rpc('remove_comment_vote', {
      comment_id: commentId,
      voter_address: address,
    });

    if (error) {
      throw new Error(`Failed to remove vote: ${error.message}`);
    }
  } catch (error) {
    console.error('Error removing comment vote:', error);
    throw error;
  }
}

export async function hasUserVotedComment(
  commentId: string,
  address: string,
): Promise<boolean> {
  try {
    const { data } = await supabasePublicClient()
      .from('comment_votes')
      .select()
      .eq('comment_id', commentId)
      .eq('voter_address', address)
      .single();

    return !!data;
  } catch (error) {
    console.error('Error checking comment vote:', error);
    return false;
  }
}
