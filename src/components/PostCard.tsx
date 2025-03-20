import type { Post } from '@/lib/types/post';
import { cn } from '@/lib/utils/cn';
import { Heart } from 'lucide-react';
import { useCallback, useEffect } from 'react';

interface PostCardProps {
  isWalletConnected: boolean;
  post: Post;
  onClick: (post: Post) => void;
  onVoteClick: (postId: string, currentVotes: number) => Promise<void>;
  hasVoted: boolean;
  isVoting: boolean;
  onImageLoad: (postId: string, imageUrl: string) => void;
}

export function PostCard({
  post,
  onClick,
  onVoteClick,
  hasVoted,
  isVoting,
  onImageLoad,
}: PostCardProps) {
  // Preload image
  const handleImageLoad = useCallback(() => {
    const img = new Image();
    img.src = post.imageUrl;
    img.onload = () => {
      onImageLoad(post.id, post.imageUrl);
    };
  }, [post.id, post.imageUrl, onImageLoad]);

  // Call handleImageLoad when component mounts
  useEffect(() => {
    handleImageLoad();
  }, [handleImageLoad]);

  // Get display name - use username if available, otherwise trim wallet address
  const displayName = post.username;
  const avatarSeed = post.username;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick(post);
    }
  };

  return (
    <div
      // biome-ignore lint/a11y/useSemanticElements: <explanation>
      role="button"
      onClick={() => onClick(post)}
      onKeyDown={handleKeyPress}
      tabIndex={0}
      className="cursor-pointer group relative w-full"
    >
      <div className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
        <div className="relative w-full">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-auto object-cover"
            onLoad={handleImageLoad}
          />
        </div>
      </div>
      <div className="p-2">
        <h3 className="text-sm font-medium text-gray-200 line-clamp-2">
          {post.title}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center flex-1 min-w-0">
            <img
              src={`https://api.dicebear.com/6.x/identicon/svg?seed=${avatarSeed}`}
              alt="avatar"
              className="w-6 h-6 rounded-full mr-2"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {displayName}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onVoteClick(post.id, post.votes);
              }}
              disabled={isVoting}
              className={cn(
                'text-gray-400 hover:text-white transition-colors flex items-center gap-1.5',
                hasVoted && 'text-white',
              )}
            >
              <Heart
                className={cn(
                  'w-4 h-4 transition-colors',
                  hasVoted && 'fill-white stroke-white',
                )}
              />
              <span className={cn('text-sm', hasVoted && 'text-white')}>
                {post.votes}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
