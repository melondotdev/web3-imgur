import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Post } from '@/lib/types/post';
import { trimUsername } from '@/lib/utils/trim-username';
import { Flag, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { UserProfileModal } from './UserProfileModal';

interface PostHeaderProps {
  displayPost: Post;
  handleReport: (type: 'post' | 'comment', id: string) => void;
}

export const PostHeader = ({ displayPost, handleReport }: PostHeaderProps) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <div className="p-4 border-b border-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {displayPost.user?.avatar_url ? (
            <img
              src={displayPost.user.avatar_url}
              alt="avatar"
              className="w-10 h-10 rounded-full shrink-0 object-cover"
            />
          ) : (
            <img
              src={`https://api.dicebear.com/6.x/identicon/svg?seed=${displayPost.username}`}
              alt="avatar"
              className="w-10 h-10 rounded-full shrink-0 object-cover"
            />
          )}
          <div>
            <h3 className="text-white font-medium">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="hover:text-blue-400 transition-colors"
              >
                {displayPost.user?.twitter_handle ||
                  trimUsername(displayPost.username)}
              </button>
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {new Date(displayPost.createdAt).toLocaleDateString()}
              </span>
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
                    onSelect={() => handleReport('post', displayPost.id)}
                    className="text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Report Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      {displayPost.title && (
        <p className="mt-3 text-white/90 text-sm">{displayPost.title}</p>
      )}

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={displayPost.user}
        username={displayPost.username}
      />
    </div>
  );
};
