import { Modal } from '@/components/base/Modal';
import type { Post, Comment } from '@/lib/types/post';
// import { ConnectButton, useWallet } from '@suiet/wallet-kit';
import { ArrowBigUp, Send, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useVote } from '@/lib/hooks/useVote';
import { cn } from '@/lib/utils/cn';
import { trimUsername } from '@/lib/utils/trim-username';
import { getSolscanUrl } from '@/lib/utils/solana';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';

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
  isVoting
}: PostModalProps) {
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  
  // Update localComments when comments prop changes
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);
  
  const handleVoteClick = async () => {
    await onVoteClick(post.id, post.votes);
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
        const newComment = await onComment(post.id, trimmed);
        
        // Verify the comment has all required fields
        if (!newComment.id || !newComment.author || !newComment.content) {
          throw new Error('Invalid comment data received');
        }
        
        // Update local comments with the verified comment
        setLocalComments(prev => [...prev, {
          id: newComment.id,
          author: newComment.author,
          content: newComment.content,
          createdAt: newComment.createdAt || new Date().toISOString(),
          votes: newComment.votes || 0
        }]);
        
        setNewComment('');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to submit comment');
    }
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
  };

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
              <div className="flex items-center gap-2">
                <a
                  href={getSolscanUrl(post.username)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-500/80 hover:text-yellow-500"
                  title="View on Solscan"
                >
                  @{trimUsername(post.username)}
                </a>
                <button
                  onClick={() => handleCopyAddress(post.username)}
                  className="text-yellow-500/60 hover:text-yellow-500 p-1"
                  title="Copy address"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleVoteClick}
                disabled={isVoting}
                className={cn(
                  "flex items-center space-x-2 text-yellow-500 hover:text-yellow-400",
                  isVoting && "opacity-50 cursor-not-allowed",
                  !wallet.connected && "opacity-50",
                  hasVoted && "text-yellow-400"
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
                <ArrowBigUp className={cn("w-5 h-5", hasVoted && "fill-yellow-400")} />
                <span>{post.votes}</span>
              </button>
            </div>
            
            <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto">
              {localComments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-b border-yellow-500/10 pb-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={getSolscanUrl(comment.author)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-500/80 hover:text-yellow-500"
                        title="View on Solscan"
                      >
                        @{trimUsername(comment.author)}
                      </a>
                      <button
                        onClick={() => handleCopyAddress(comment.author)}
                        className="text-yellow-500/60 hover:text-yellow-500 p-1"
                        title="Copy address"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
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
