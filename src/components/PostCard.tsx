import type { Post } from '@/lib/types/post';
import { ArrowBigUp, MessageCircle } from 'lucide-react';
import { trimUsername } from '@/lib/utils/trim-username';
import { useVote } from '@/lib/hooks/useVote';
import { cn } from '@/lib/utils/cn';
import { useState, useEffect } from 'react';
import { useWallet } from "@solana/wallet-adapter-react";

interface PostCardProps {
  post: Post;
  onVote: (id: string) => void;
  onClick: (post: Post) => void;
}

export function PostCard({ post, onVote, onClick }: PostCardProps) {
  const { connected: isWalletConnected } = useWallet();
  const { toggleVote, isVoting, hasVoted, error } = useVote(post.id);
  const [localVotes, setLocalVotes] = useState(post.votes);

  // Update localVotes when post changes
  useEffect(() => {
    setLocalVotes(post.votes);
  }, [post.votes]);

  const handleVoteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
            <span className="text-yellow-500/80">@{trimUsername(post.username)}</span>
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
