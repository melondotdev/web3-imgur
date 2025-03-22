import type { ActionBarProps } from '@/lib/types/gallery/post-modal';
import { cn } from '@/lib/utils/cn';
import { Heart, MessageCircle, Share2, Star } from 'lucide-react';

export const ActionBar = ({
  handleVoteClick,
  isVoting,
  hasVoted,
  displayPost,
  localComments,
  onCommentSubmit,
  isCommentInputVisible,
  onCommentCounterClick,
  newComment,
  onCommentChange,
}: ActionBarProps) => {
  return (
    <div className="border-t border-white/5 p-4">
      <div className="flex items-center gap-6 mb-4">
        <button
          type="button"
          onClick={handleVoteClick}
          disabled={isVoting}
          className={cn(
            'text-gray-400 hover:text-white transition-colors flex items-center gap-1.5',
            hasVoted && 'text-white',
          )}
        >
          <Heart
            className={cn(
              'w-6 h-6 transition-colors',
              hasVoted && 'fill-white stroke-white',
            )}
          />
          <span className={cn('text-sm', hasVoted && 'text-white')}>
            {displayPost.votes}
          </span>
        </button>
        <button
          type="button"
          onClick={onCommentCounterClick}
          className="comment-counter flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-sm">{localComments.length}</span>
        </button>
        <div className="flex items-center gap-1.5 text-gray-400">
          <Star className="w-6 h-6" />
          <span className="text-sm">0</span>
        </div>
        <button
          type="button"
          className="text-gray-400 hover:text-white transition-colors ml-auto"
        >
          <Share2 className="w-6 h-6" />
        </button>
      </div>

      {/* Comment input - now conditionally rendered */}
      <div
        className={cn(
          'transform transition-all duration-200 ease-in-out',
          isCommentInputVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none h-0',
        )}
      >
        <form onSubmit={onCommentSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={newComment}
            onChange={onCommentChange}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
          />
          <button
            type="submit"
            className={cn(
              'text-sm font-medium',
              newComment.trim()
                ? 'text-blue-400 hover:text-blue-300'
                : 'text-gray-400',
            )}
            disabled={!newComment.trim()}
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
};
