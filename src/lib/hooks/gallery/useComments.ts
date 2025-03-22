import { getComments } from '@/lib/services/db/get-comments';
import { createComment } from '@/lib/services/request/comment-service';
import type { Comment, Post } from '@/lib/types/post';
import type { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UseCommentsProps {
  selectedPost: Post | null;
  walletPublicKey: PublicKey | null;
}

export function useComments({
  selectedPost,
  walletPublicKey,
}: UseCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (selectedPost) {
      getComments(selectedPost.id)
        .then((fetchedComments) => {
          setComments(fetchedComments);
        })
        .catch((error) => {
          console.error('Failed to fetch comments:', error);
          toast.error('Failed to load comments');
        });
    } else {
      setComments([]);
    }
  }, [selectedPost]);

  const handleComment = useCallback(
    async (postId: string, content: string) => {
      try {
        if (!walletPublicKey) {
          throw new Error('Wallet not connected');
        }

        const newComment = await createComment(postId, {
          username: walletPublicKey.toString(),
          text: content,
        });

        // Create a properly structured comment object
        const formattedComment: Comment = {
          id: newComment.id,
          author: newComment.author || walletPublicKey.toString(),
          content: newComment.content || content,
          createdAt: newComment.createdAt || new Date().toISOString(),
          votes: newComment.votes || 0,
        };

        // Update comments locally with the formatted comment
        setComments((prev) => [...prev, formattedComment]);

        // Return the formatted comment
        return formattedComment;
      } catch (error) {
        console.error('Failed to create comment:', error);
        toast.error('Failed to post comment', {
          description: 'Please try again later',
        });
        throw error;
      }
    },
    [walletPublicKey],
  );

  return {
    comments,
    setComments,
    handleComment,
  };
}
