import {
  getAllPosts,
  subscribeToAllPosts,
} from '@/lib/services/db/get-all-posts';
import type { Post } from '@/lib/types/post';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { PostCard } from './PostCard';

export function Gallery() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load
    getAllPosts()
      .then(setPosts)
      .catch((error) => {
        console.error('Failed to fetch posts:', error);
        toast.error('Failed to load posts');
      })
      .finally(() => setLoading(false));

    // Subscribe to changes
    const unsubscribe = subscribeToAllPosts(
      (updatedPosts) => setPosts(updatedPosts),
      (error) => {
        console.error('Subscription error:', error);
        toast.error('Failed to update posts');
      },
    );

    return unsubscribe;
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
