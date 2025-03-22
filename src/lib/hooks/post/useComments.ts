import { signatureCacheService } from '@/lib/services/cache/cache-service';
import {
  hasUserVotedComment,
  incrementCommentVote,
  removeCommentVote,
} from '@/lib/services/db/comment-vote-service';
import type { Comment } from '@/lib/types/post';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface WalletState {
  connected: boolean;
  publicKey: { toString: () => string } | null;
}

interface UseCommentsProps {
  initialComments: Comment[];
  wallet: WalletState;
  onComment?: (postId: string, content: string) => Promise<Comment>;
}

export function useComments({
  initialComments,
  wallet,
  onComment,
}: UseCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] =
    useState<Comment[]>(initialComments);
  const [votedComments, setVotedComments] = useState<Set<string>>(new Set());
  const [isCommentVoting, setIsCommentVoting] = useState(false);
  const [isCommentInputVisible, setIsCommentInputVisible] = useState(false);

  // Update localComments when initialComments prop changes
  useEffect(() => {
    setLocalComments(initialComments);
  }, [initialComments]);

  const handleCommentCounterClick = () => {
    setIsCommentInputVisible(true);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
  };

  const handleSubmitComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed || !wallet.connected || !wallet.publicKey) {
      return;
    }

    try {
      if (onComment) {
        const response = await onComment(postId, trimmed);

        if (!response) {
          throw new Error('No response received from comment creation');
        }

        // Create a new comment object with strict type checking
        const newCommentObj: Comment = {
          id: response.id,
          author: response.author || wallet.publicKey.toString(),
          content: response.content || trimmed,
          createdAt: response.createdAt || new Date().toISOString(),
          votes: typeof response.votes === 'number' ? response.votes : 0,
        };

        // Validate the new comment object
        if (
          !newCommentObj.id ||
          !newCommentObj.author ||
          !newCommentObj.content
        ) {
          console.error('Invalid comment data:', newCommentObj);
          throw new Error('Invalid comment data received');
        }

        // Update local comments
        setLocalComments((prev) => [...prev, newCommentObj]);
        setNewComment('');
        setIsCommentInputVisible(false);
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit comment',
      );
    }
  };

  const fetchVotedComments = useCallback(
    async (commentsToCheck: Comment[]) => {
      if (!wallet.connected || !wallet.publicKey) return;

      try {
        const votedCommentsPromises = commentsToCheck.map((comment) =>
          hasUserVotedComment(comment.id, wallet.publicKey?.toString() || ''),
        );

        const votedResults = await Promise.all(votedCommentsPromises);

        const newVotedComments = new Set<string>();
        commentsToCheck.forEach((comment, index) => {
          if (votedResults[index]) {
            newVotedComments.add(comment.id);
          }
        });

        setVotedComments(newVotedComments);
      } catch (error) {
        console.error('Failed to fetch voted comments:', error);
      }
    },
    [wallet.connected, wallet.publicKey],
  );

  useEffect(() => {
    if (wallet.connected && wallet.publicKey && initialComments.length > 0) {
      fetchVotedComments(initialComments);
    }
  }, [wallet.connected, wallet.publicKey, initialComments, fetchVotedComments]);

  const handleCommentVote = useCallback(
    async (commentId: string, currentVotes: number) => {
      if (!wallet.connected || !wallet.publicKey) {
        toast.error('Please connect your wallet to vote');
        return;
      }

      if (isCommentVoting) return;

      try {
        setIsCommentVoting(true);
        const isCurrentlyVoted = votedComments.has(commentId);
        const newVoteCount = isCurrentlyVoted
          ? currentVotes - 1
          : currentVotes + 1;

        // Store original state for rollback
        const originalVotedComments = new Set(votedComments);
        const originalComments = [...localComments];

        try {
          // Make API call first
          if (isCurrentlyVoted) {
            // Remove vote
            await removeCommentVote(commentId, wallet.publicKey.toString());
            setVotedComments((prev) => {
              const newSet = new Set(prev);
              newSet.delete(commentId);
              return newSet;
            });
          } else {
            // Add vote with cached signature
            const signature =
              signatureCacheService.get(wallet.publicKey.toString()) || '';
            await incrementCommentVote(
              commentId,
              signature,
              wallet.publicKey.toString(),
            );
            setVotedComments((prev) => {
              const newSet = new Set(prev);
              newSet.add(commentId);
              return newSet;
            });
          }

          // Update comment vote counts
          setLocalComments((prevComments) =>
            prevComments.map((comment) =>
              comment.id === commentId
                ? { ...comment, votes: newVoteCount }
                : comment,
            ),
          );
        } catch (error) {
          // Rollback state on error
          setVotedComments(originalVotedComments);
          setLocalComments(originalComments);

          if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error('Failed to update vote');
          }
        }
      } finally {
        setIsCommentVoting(false);
      }
    },
    [wallet, isCommentVoting, votedComments, localComments],
  );

  return {
    newComment,
    localComments,
    votedComments,
    isCommentVoting,
    isCommentInputVisible,
    handleCommentCounterClick,
    handleCommentChange,
    handleSubmitComment,
    handleCommentVote,
  };
}
