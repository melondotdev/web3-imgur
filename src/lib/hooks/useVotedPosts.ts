import { signatureCacheService } from '@/lib/services/cache/cache-service';
import {
  hasUserVoted,
  incrementVote,
  removeVote,
} from '@/lib/services/db/upvote-service';
import type { Post } from '@/lib/types/post';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export function useVotedPosts(
  posts: Post[],
  onVoteUpdate: (postId: string, newVoteCount: number) => void,
) {
  const wallet = useWallet();
  const [votedPosts, setVotedPosts] = useState<Set<string>>(new Set());
  const [isVoting, setIsVoting] = useState(false);

  const fetchVotedPosts = useCallback(
    async (postsToCheck: Post[]) => {
      if (!wallet.connected || !wallet.publicKey) return;

      try {
        const votedPostsPromises = postsToCheck.map((post) =>
          hasUserVoted(post.id, wallet.publicKey?.toString() || ''),
        );

        const votedResults = await Promise.all(votedPostsPromises);

        const newVotedPosts = new Set<string>();
        postsToCheck.forEach((post, index) => {
          if (votedResults[index]) {
            newVotedPosts.add(post.id);
          }
        });

        setVotedPosts(newVotedPosts);
      } catch (error) {
        console.error('Failed to fetch voted posts:', error);
      }
    },
    [wallet.connected, wallet.publicKey],
  );

  const handleVoteClick = useCallback(
    async (postId: string, currentVotes: number) => {
      if (!wallet.connected || !wallet.publicKey) {
        toast.error('Please connect your wallet to vote');
        return;
      }

      if (isVoting) return;

      try {
        setIsVoting(true);
        const isCurrentlyVoted = votedPosts.has(postId);

        try {
          if (isCurrentlyVoted) {
            await removeVote(postId, wallet.publicKey.toString());
            setVotedPosts((prev) => {
              const newSet = new Set(prev);
              newSet.delete(postId);
              return newSet;
            });
            onVoteUpdate(postId, currentVotes - 1);
          } else {
            const signature =
              signatureCacheService.get(wallet.publicKey.toString()) || '';
            await incrementVote(postId, signature, wallet.publicKey.toString());
            setVotedPosts((prev) => {
              const newSet = new Set(prev);
              newSet.add(postId);
              return newSet;
            });
            onVoteUpdate(postId, currentVotes + 1);
          }
        } catch (error) {
          if (error instanceof Error) {
            toast.error('Failed to vote', {
              description: error.message,
            });
          } else {
            toast.error('Failed to update vote');
          }
        }
      } finally {
        setIsVoting(false);
      }
    },
    [wallet, isVoting, votedPosts, onVoteUpdate],
  );

  useEffect(() => {
    if (wallet.connected && wallet.publicKey && posts.length > 0) {
      fetchVotedPosts(posts);
    }
  }, [wallet.connected, wallet.publicKey, posts, fetchVotedPosts]);

  return {
    votedPosts,
    isVoting,
    handleVoteClick,
    fetchVotedPosts,
  };
}
