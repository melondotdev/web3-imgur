import {
  getAllPosts,
  subscribeToAllPosts,
} from '@/lib/services/db/get-all-posts';
import { getComments } from '@/lib/services/db/get-comments';
import type { Post, Comment } from '@/lib/types/post';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { PostCard } from './PostCard';
import { PostModal } from './PostModal';

export function Gallery() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  
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

  // Load comments when a post is selected
  useEffect(() => {
    if (selectedPost) {
      getComments(selectedPost.id)
        .then((fetchedComments) => {
          setComments(fetchedComments);
          console.log(fetchedComments);
        })
        .catch((error) => {
          console.error('Failed to fetch comments:', error);
          toast.error('Failed to load comments');
        });
    } else {
      setComments([]);
    }
  }, [selectedPost]);
  
  if (loading) {
    return <div>Loading...</div>;
  }

  const handleVote = (postId: string) => {
    console.log('Voting for post:', postId);
  };

  const handleComment = (postId: string, content: string, signature: string) => {
    // TODO: Implement comment submission
    console.log('New comment:', { postId, content, signature });
  };

  return (
    <>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onClick={setSelectedPost} 
            onVote={handleVote} 
          />
        ))}
      </div>
      {selectedPost && (
        <PostModal
          post={selectedPost}
          onVote={handleVote}
          comments={comments}
          isOpen={true}
          onClose={() => setSelectedPost(null)}
          onComment={handleComment}
        />
      )}
    </>
  );
}
