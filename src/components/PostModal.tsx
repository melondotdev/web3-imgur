import { Modal } from '@/components/base/Modal';
import type { Post, Comment } from '@/lib/types/post';
// import { ConnectButton, useWallet } from '@suiet/wallet-kit';
import { ArrowBigUp, Send, Copy } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useVote } from '@/lib/hooks/useVote';
import { cn } from '@/lib/utils/cn';
import { trimUsername } from '@/lib/utils/trim-username';
import { getSolscanUrl } from '@/lib/utils/solana';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import { incrementCommentVote, removeCommentVote, hasUserVotedComment } from '@/lib/services/db/comment-vote-service';

interface PostModalProps {
  wallet: WalletContextState;
  post: Post;
  comments: Comment[];
  isOpen: boolean;
  onClose: () => void;
  onComment?: (id: string, content: string) => Promise<Comment>;
  onVoteClick: (postId: string, currentVotes: number) => Promise<void>;
  hasVoted: boolean;
  isVoting: boolean;
  localPost?: Post;
  onLocalVoteUpdate?: (postId: string, newVoteCount: number) => void;
}

export function PostModal({
  wallet,
  post,
  comments,
  isOpen,
  onClose,
  onComment,
  onVoteClick,
  hasVoted,
  isVoting,
  localPost,
  onLocalVoteUpdate
}: PostModalProps) {
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [votedComments, setVotedComments] = useState<Set<string>>(new Set());
  const [isCommentVoting, setIsCommentVoting] = useState(false);
  
  // Use localPost if available, otherwise fall back to post prop
  const displayPost = localPost || post;
  
  // Update localComments when comments prop changes
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);
  
  const handleVoteClick = async () => {
    await onVoteClick(displayPost.id, displayPost.votes);
    // Update local vote count if callback is provided
    if (onLocalVoteUpdate) {
      onLocalVoteUpdate(displayPost.id, hasVoted ? displayPost.votes - 1 : displayPost.votes + 1);
    }
  };
  
  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed || !wallet.connected || !wallet.signMessage || !wallet.publicKey) {
      return;
    }
    
    try {
      const msgBytes = new TextEncoder().encode(trimmed);
      await wallet.signMessage(msgBytes);
      
      if (onComment) {
        const response = await onComment(displayPost.id, trimmed);
        console.log('Comment response:', response); // Debug log
        
        if (!response) {
          throw new Error('No response received from comment creation');
        }

        // Create a new comment object with strict type checking
        const newComment: Comment = {
          id: response.id,
          author: response.author || wallet.publicKey.toString(),
          content: response.content || trimmed,
          createdAt: response.createdAt || new Date().toISOString(),
          votes: typeof response.votes === 'number' ? response.votes : 0
        };

        // Validate the new comment object
        if (!newComment.id || !newComment.author || !newComment.content) {
          console.error('Invalid comment data:', newComment); // Debug log
          throw new Error('Invalid comment data received');
        }
        
        // Update local comments
        setLocalComments(prev => [...prev, newComment]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit comment');
    }
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  const fetchVotedComments = useCallback(async (commentsToCheck: Comment[]) => {
    if (!wallet.connected || !wallet.publicKey) return;
    
    try {
      const votedCommentsPromises = commentsToCheck.map(comment => 
        hasUserVotedComment(comment.id, wallet.publicKey!.toString())
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
  }, [wallet.connected, wallet.publicKey]);

  useEffect(() => {
    if (wallet.connected && wallet.publicKey && comments.length > 0) {
      fetchVotedComments(comments);
    }
  }, [wallet.connected, wallet.publicKey, comments, fetchVotedComments]);

  const handleCommentVote = useCallback(async (commentId: string, currentVotes: number) => {
    if (!wallet.connected || !wallet.publicKey || !wallet.signMessage) {
      toast.error('Please connect your wallet to vote');
      return;
    }

    if (isCommentVoting) return;
    
    try {
      setIsCommentVoting(true);
      const isCurrentlyVoted = votedComments.has(commentId);
      const newVoteCount = isCurrentlyVoted ? currentVotes - 1 : currentVotes + 1;

      // Store original state for rollback
      const originalVotedComments = new Set(votedComments);
      const originalComments = [...localComments];

      try {
        // Make API call first
        if (!isCurrentlyVoted) {
          // Add vote
          const message = new TextEncoder().encode(`Vote for comment: ${commentId}`);
          const signature = await wallet.signMessage(message);
          const signatureString = Buffer.from(signature).toString('base64');
          await incrementCommentVote(commentId, signatureString, wallet.publicKey.toString());
          setVotedComments(prev => {
            const newSet = new Set(prev);
            newSet.add(commentId);
            return newSet;
          });
        } else {
          // Remove vote
          await removeCommentVote(commentId, wallet.publicKey.toString());
          setVotedComments(prev => {
            const newSet = new Set(prev);
            newSet.delete(commentId);
            return newSet;
          });
        }

        // Update comment vote counts
        setLocalComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId 
              ? { ...comment, votes: newVoteCount }
              : comment
          )
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
  }, [wallet, isCommentVoting, votedComments, localComments]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* FIXME Not ideal but for now it will work. Otherwise this will render content for null */}
      {isOpen && (
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/3">
            <img
              src={displayPost.imageUrl}
              alt="post content"
              className="w-full h-auto"
            />
          </div>
          <div className="md:w-1/3 p-6 border-l border-yellow-500/20">
            {/* Title and upvote section */}
            <div className="flex items-center justify-start gap-4">
              {displayPost.title && (
                <h2 className="text-xl font-semibold text-white">
                  {displayPost.title}
                </h2>
              )}
              <button
                onClick={handleVoteClick}
                disabled={isVoting}
                className={cn(
                  "flex items-center space-x-2 text-white hover:text-yellow-400",
                  isVoting && "opacity-50 cursor-not-allowed",
                  !wallet.connected && "opacity-50",
                  hasVoted && "text-white"
                )}
                title={
                  !wallet.connected 
                  ? "Connect wallet to vote" 
                  : isVoting
                  ? "Processing..."
                  : hasVoted
                  ? "Click to remove vote"
                  : "Click to vote"
                }
                >
                <ArrowBigUp className={cn("w-5 h-5", hasVoted && "fill-white hover:fill-yellow-400")} />
                <span>{displayPost.votes}</span>
              </button>
            </div>

            <div className="flex items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500/50 text-sm">creator:</span>
                <a
                  href={getSolscanUrl(displayPost.username)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-500/80 hover:text-yellow-500 text-sm"
                  title="View on Solscan"
                >
                  @{trimUsername(displayPost.username)}
                </a>
                <button
                  onClick={() => handleCopyAddress(displayPost.username)}
                  className="text-yellow-500/60 hover:text-yellow-500 p-1"
                  title="Copy address"
                >
                  <Copy className="w-4 h-4 text-xs" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto">
              {localComments.map((comment) => (
                <div
                  key={`${comment.id}-${comment.author}`}
                  className="border-b border-yellow-500/10 pb-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={getSolscanUrl(comment.author)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-500/80 hover:text-yellow-500 text-xs"
                        title="View on Solscan"
                      >
                        @{trimUsername(comment.author)}
                      </a>
                      <button
                        onClick={() => handleCopyAddress(comment.author)}
                        className="text-yellow-500/60 hover:text-yellow-500 p-1"
                        title="Copy address"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <span className="text-xs text-yellow-500/50">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCommentVote(comment.id, comment.votes)}
                      disabled={isCommentVoting}
                      className={cn(
                        "flex items-center space-x-2 text-yellow-500 hover:text-yellow-400",
                        isCommentVoting && "opacity-50 cursor-not-allowed",
                        !wallet.connected && "opacity-50",
                        votedComments.has(comment.id) && "text-yellow-400"
                      )}
                    >
                      <ArrowBigUp className={cn("w-4 h-4", votedComments.has(comment.id) && "fill-yellow-400")} />
                      <span>{comment.votes}</span>
                    </button>
                  </div>
                  <p className="text-yellow-500/90">{comment.content}</p>
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
