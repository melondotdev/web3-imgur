import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { CommentsSectionProps } from '@/lib/types/gallery/post-modal';
import { cn } from '@/lib/utils/cn';
import { trimUsername } from '@/lib/utils/trim-username';
import { Flag, Heart, MessageCircle, MoreHorizontal, Star } from 'lucide-react';

export const CommentsSection = ({
  localComments,
  handleAddressClick,
  handleCommentVote,
  votedComments,
  handleReport,
  isCommentVoting,
}: CommentsSectionProps) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-4 p-4">
        {localComments.map((comment) => (
          <div key={`${comment.id}-${comment.author}`} className="group">
            <div className="flex gap-3">
              <img
                src={
                  comment.user?.avatar_url ||
                  `https://api.dicebear.com/6.x/identicon/svg?seed=${comment.author}`
                }
                alt="avatar"
                className="w-8 h-8 rounded-full shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-white/90 text-sm font-medium hover:text-blue-400 transition-colors cursor-pointer"
                      onClick={() => handleAddressClick(comment.author)}
                    >
                      {comment.user?.twitter_handle ||
                        trimUsername(comment.author)}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild={true}>
                      <button
                        type="button"
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="bg-gray-900 border-white/10"
                      sideOffset={5}
                    >
                      <DropdownMenuItem
                        onSelect={() => handleReport('comment', comment.id)}
                        className="text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Report Comment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-white/75 text-sm mt-1">{comment.content}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-2 ml-11">
              <button
                type="button"
                onClick={() => handleCommentVote(comment.id, comment.votes)}
                disabled={isCommentVoting}
                className={cn(
                  'text-gray-400 hover:text-white text-xs flex items-center gap-1.5',
                  votedComments.has(comment.id) && 'text-white',
                )}
              >
                <Heart
                  className={cn(
                    'w-3.5 h-3.5 transition-colors',
                    votedComments.has(comment.id) && 'fill-white stroke-white',
                  )}
                />
                <span
                  className={cn(votedComments.has(comment.id) && 'text-white')}
                >
                  {comment.votes}
                </span>
              </button>
              <div className="text-gray-400 text-xs flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>0</span>
              </div>
              <div className="text-gray-400 text-xs flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" />
                <span>0</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
