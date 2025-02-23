import type { Post } from '@/lib/types/post';
import { ArrowBigUp, MessageCircle } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onVote: (id: string) => void;
  onClick: (post: Post) => void;
}

export function PostCard({ post, onVote, onClick }: PostCardProps) {
  return (
    <div
      className="bg-gray-900 rounded-lg border border-yellow-500/20 overflow-hidden cursor-pointer transform transition-transform hover:scale-[1.02]"
      onClick={() => onClick(post)}
    >
      <img src={post.imageUrl} alt="user content" className="w-full h-auto" />
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Changed post.author to post.username */}
          <span className="text-yellow-500/80">@{post.username}</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-yellow-500/80">
              <MessageCircle className="w-4 h-4" />
              {/* Use a commentCount property (defaulting to 0 if not provided) */}
              {/* <span>{post.commentCount ?? 0}</span> */}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVote(post.id);
              }}
              className="flex items-center space-x-2 text-yellow-500 hover:text-yellow-400"
            >
              <ArrowBigUp className="w-5 h-5" />
              <span>{post.votes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
