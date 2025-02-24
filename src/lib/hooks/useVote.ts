import { useState, useCallback } from 'react';
import { incrementVote, removeVote, hasUserVoted } from '@/lib/services/db/upvote-service';
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from 'react-hot-toast';

export function useVote(postId: string, initialHasVoted: boolean) {
  const wallet = useWallet();
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check initial vote status
  const checkVoteStatus = useCallback(async () => {
    if (!wallet.publicKey) return;
    try {
      const voted = await hasUserVoted(postId, wallet.publicKey.toString());
      setHasVoted(voted);
    } catch (err) {
      console.error('Failed to check vote status:', err);
    }
  }, [postId, wallet.publicKey]);

  // Toggle vote
  const toggleVote = async (postId: string, currentVotes: number, onSuccess?: () => void) => {
    if (!wallet.publicKey || !wallet.signMessage) {
      toast.error('Please connect your wallet to vote');
      return;
    }

    setIsVoting(true);
    setError(null);

    try {
      if (hasVoted) {
        await removeVote(postId, wallet.publicKey.toString());
      } else {
        // Create message to sign
        const message = `Vote for post ${postId}`;
        const messageBytes = new TextEncoder().encode(message);
        const signature = await wallet.signMessage(messageBytes);
        
        await incrementVote(
          postId,
          Buffer.from(signature).toString('hex'),
          wallet.publicKey.toString()
        );
      }

      // Update state only after successful vote
      setHasVoted(!hasVoted);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsVoting(false);
    }
  };

  return {
    toggleVote,
    isVoting,
    hasVoted,
    error,
    checkVoteStatus
  };
} 