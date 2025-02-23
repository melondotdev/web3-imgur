import { useState, useEffect } from 'react';
import { incrementVote, removeVote, hasUserVoted } from '@/lib/services/db/upvote-service';
import { useWallet } from '@suiet/wallet-kit';

export function useVote(postId: string) {
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wallet = useWallet();

  // Check if user has voted when component mounts or wallet changes
  useEffect(() => {
    async function checkVoteStatus() {
      if (wallet.connected && wallet.account?.address) {
        try {
          const voted = await hasUserVoted(postId, wallet.account.address);
          setHasVoted(voted);
        } catch (error) {
          console.error('Failed to check vote status:', error);
        }
      }
    }

    checkVoteStatus();
  }, [postId, wallet.connected, wallet.account?.address]);

  const toggleVote = async (postId: string, currentVotes: number, onSuccess?: () => void) => {
    if (isVoting || !wallet.connected) return;

    try {
      setIsVoting(true);
      setError(null);

      if (hasVoted) {
        // Remove vote
        await removeVote(postId, wallet.account?.address || '');
        setHasVoted(false);
      } else {
        // Add vote
        const message = `Vote for post: ${postId}`;
        const msgBytes = new TextEncoder().encode(message);
        
        const { signature } = await wallet.signPersonalMessage({
          message: msgBytes
        });

        await incrementVote(
          postId, 
          signature,
          wallet.account?.address || ''
        );
        setHasVoted(true);
      }
      
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to vote';
      setError(errorMessage);
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  return { 
    toggleVote, 
    isVoting, 
    hasVoted,
    error,
    isWalletConnected: wallet.connected 
  };
} 