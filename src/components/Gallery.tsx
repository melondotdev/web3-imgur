import {
  getAllPosts,
  subscribeToAllPosts,
  PostSortOption,
} from '@/lib/services/db/get-all-posts';
import { getComments } from '@/lib/services/db/get-comments';
import type { Post, Comment } from '@/lib/types/post';
import { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { PostCard } from './PostCard';
import { PostModal } from './PostModal';
import { createComment } from '@/lib/services/comment-service';
import { useWallet } from '@suiet/wallet-kit';

export function Gallery() {
  const wallet = useWallet();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [sortBy, setSortBy] = useState<PostSortOption>('newest');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  
  // Function to load posts
  const loadPosts = useCallback(async (pageNum: number, replace: boolean = false) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);

    try {
      const newPosts = await getAllPosts(sortBy, pageNum);
      
      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prev => replace ? newPosts : [...prev, ...newPosts]);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [sortBy]);

  // Initial load and sort change handler
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    loadPosts(0, true);
    
    // Subscribe to changes
    const unsubscribe = subscribeToAllPosts(
      async () => {
        // Reload current page when data changes
        await loadPosts(0, true);
      },
      sortBy,
      (error) => {
        console.error('Subscription error:', error);
        toast.error('Failed to update posts');
      },
    );

    return unsubscribe;
  }, [sortBy, loadPosts]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!hasMore || loading || loadingRef.current) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 800; // Load more when within 800px of bottom

    if (scrollPosition > threshold) {
      setPage(prev => prev + 1);
      loadPosts(page + 1);
    }
  }, [hasMore, loading, loadPosts, page]);

  // Set up scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

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
  
  const handleComment = async (postId: string, content: string, signature: string) => {
    try {
      await createComment(postId, {
        username: wallet.account?.address || 'unknown',
        text: content,
      });
      
      // Refresh comments after posting
      const updatedComments = await getComments(postId);
      setComments(updatedComments);
    } catch (error) {
      console.error('Failed to create comment:', error);
      toast.error('Failed to post comment');
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as PostSortOption)}
          className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
        >
          <option value="newest">Latest Posts</option>
          <option value="most-voted">Most Voted</option>
        </select>
      </div>
      
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onClick={setSelectedPost} 
            onVote={handleVote} 
          />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      
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
