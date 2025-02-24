import type { Post } from '@/lib/types/post';
import { ArrowBigUp, MessageCircle, Copy } from 'lucide-react';
import { trimUsername } from '@/lib/utils/trim-username';
import { useVote } from '@/lib/hooks/useVote';
import { cn } from '@/lib/utils/cn';
import { useState, useEffect } from 'react';
import { getSolscanUrl } from '@/lib/utils/solana';
import { toast } from 'react-hot-toast';

interface PostCardProps {
  isWalletConnected: boolean;
  post: Post;
  onVote: (id: string) => void;
  onClick: (post: Post) => void;
}

export function PostCard({ isWalletConnected, post, onVote, onClick }: PostCardProps) {
  const { toggleVote, isVoting, hasVoted, error, checkVoteStatus } = useVote(post.id);
  const [localVotes, setLocalVotes] = useState(post.votes);

  // Check initial vote status when component mounts or wallet connection changes
  useEffect(() => {
    if (isWalletConnected) {
      checkVoteStatus();
    }
  }, [isWalletConnected, checkVoteStatus]);

  // Update localVotes when post changes
  useEffect(() => {
    setLocalVotes(post.votes);
  }, [post.votes]);

  const handleVoteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isWalletConnected) {
      toast.error('Please connect your wallet to vote');
      return;
    }
    
    try {
      await toggleVote(post.id, localVotes, () => {
        // Update local vote count only after successful vote
        setLocalVotes(prev => hasVoted ? prev - 1 : prev + 1);
        onVote(post.id);
      });
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const handleCopyAddress = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
  };

  return (
    <div
      className="bg-gray-900 rounded-lg border border-yellow-500/20 overflow-hidden cursor-pointer"
      onClick={() => onClick(post)}
    >
      <img src={post.imageUrl} alt="user content" className="w-full h-auto" />
      <div className="p-4 space-y-3">
        {/* Title and author section */}
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-white">{post.title}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-yellow-500/80">by</span>
            <div className="flex items-center gap-2">
              <a
                href={getSolscanUrl(post.username)}
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-500/80 hover:text-yellow-500"
                title="View on Solscan"
              >
                @{trimUsername(post.username)}
              </a>
              <button
                onClick={(e) => handleCopyAddress(e, post.username)}
                className="text-yellow-500/60 hover:text-yellow-500 p-1"
                title="Copy address"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tags section */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-yellow-500/10 text-yellow-500/80 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Interactions section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
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
        </div>
      </div>
    </div>
  );
}
