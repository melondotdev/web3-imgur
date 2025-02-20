import { Post } from '../types';
import { PostCard } from './PostCard';

interface GalleryProps {
  posts: Post[];
  onVote: (id: string) => void;
  onPostClick: (post: Post) => void;
}

export function Gallery({ posts, onVote, onPostClick }: GalleryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {posts.map(post => (
        <PostCard 
          key={post.id} 
          post={post} 
          onVote={onVote}
          onClick={() => onPostClick(post)}
        />
      ))}
    </div>
  );
}