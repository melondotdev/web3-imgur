import { Modal } from '@/components/base/Modal';
import type { Post, Comment } from '@/lib/types/post';
// import { ConnectButton, useWallet } from '@suiet/wallet-kit';
import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowBigUp, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useVote } from '@/lib/hooks/useVote';
import { cn } from '@/lib/utils/cn';
import { trimUsername } from '@/lib/utils/trim-username';

interface PostModalProps {
  post: Post;
  comments: Comment[];
  isOpen: boolean;
  onClose: () => void;
  onVote: (id: string) => void;
  onComment?: (id: string, content: string) => void;
}

export function PostModal({
  post,
  comments,
  isOpen,
  onClose,
  onVote,
  onComment,
}: PostModalProps) {
  const [newComment, setNewComment] = useState('');
  const [localVotes, setLocalVotes] = useState(post.votes);
  const { connected: isWalletConnected, signMessage, publicKey } = useWallet();
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const { toggleVote, isVoting, hasVoted, error } = useVote(post.id);
  
  // Update localComments when comments prop changes
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);
  
  // Update localVotes when post changes
  useEffect(() => {
    setLocalVotes(post.votes);
  }, [post.votes]);
  
  const handleVoteClick = async () => {
    if (!isWalletConnected) {
      console.log('Please connect your wallet to vote');
      return;
    }
    
    try {
      // Update local vote count immediately for better UX
      setLocalVotes(prev => hasVoted ? prev - 1 : prev + 1);
      
      await toggleVote(post.id, localVotes, () => {
        onVote(post.id);
      });
    } catch (error) {
      // If the vote fails, revert the local count
      setLocalVotes(post.votes);
      console.error('Vote failed:', error);
    }
  };

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed || !isWalletConnected || !signMessage || !publicKey) {
      return;
    }

    try {
      // Convert the comment into bytes.
      const msgBytes = new TextEncoder().encode(trimmed);
      // Sign the message using the connected wallet.
      const signature = await signMessage(msgBytes);
      
      // Build a transient comment object.
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        author: publicKey.toString(),
        content: trimmed,
        createdAt: new Date().toISOString(),
        votes: 0
      };
      
      if (onComment) {
        try {
          await onComment(post.id, trimmed);
          // Update the UI immediately.
          setLocalComments((prev) => [...prev, newCommentObj]);
          setNewComment('');
        } catch (error) {
          console.error('Failed to submit comment:', error);
          // Show error to user
          alert('Failed to submit comment. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error signing comment:', error);
      alert('Error signing comment. Please try again.');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* FIXME Not ideal but for now it will work. Otherwise this will render content for null */}
      {isOpen && (
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/3">
            <img
              src={post.imageUrl}
              alt="post content"
              className="w-full h-auto"
            />
          </div>
          <div className="md:w-1/3 p-6 border-l border-yellow-500/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-yellow-500/80">@{trimUsername(post.username)}</span>
              <button
                onClick={handleVoteClick}
                disabled={isVoting}
                className={cn(
                  "flex items-center space-x-2 text-yellow-500 hover:text-yellow-400",
                  isVoting && "opacity-50 cursor-not-allowed",
                  !isWalletConnected && "opacity-50",
                  hasVoted && "text-yellow-400"
                )}
                title={
                  !isWalletConnected 
                    ? "Connect wallet to vote" 
                    : isVoting
                      ? "Processing..."
                      : hasVoted
                        ? "Click to remove vote"
                        : "Click to vote"
                }
              >
                <ArrowBigUp className={cn("w-5 h-5", hasVoted && "fill-yellow-400")} />
                <span>{localVotes}</span>
              </button>
            </div>
            
            <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto">
              {localComments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-b border-yellow-500/10 pb-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-yellow-500/80">
                      @{trimUsername(comment.author)}
                    </span>
                    <span className="text-xs text-yellow-500/50">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-yellow-500/90">{comment.content}</p>
                  <div className="flex items-center mt-2 text-yellow-500/50">
                    <ArrowBigUp className="w-4 h-4 mr-1" />
                    <span>{comment.votes}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmitComment} className="mt-auto">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="add a comment..."
                  className="flex-1 px-3 py-2 bg-gray-800 border border-yellow-500/20 rounded-md text-yellow-500 placeholder-yellow-500/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-md hover:bg-yellow-500/30"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Modal>
  );
}
