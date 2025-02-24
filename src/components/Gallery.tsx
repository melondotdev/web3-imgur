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
// import { useWallet } from '@suiet/wallet-kit';
import { useWallet } from "@solana/wallet-adapter-react";
import styles from './Gallery.module.css';

interface TagCount {
  tag: string;
  count: number;
}

const MAX_VISIBLE_TAGS = 5; // Adjust this number as needed

function reorderPosts(posts: Post[], columnCount: number): Post[] {
  const rows = Math.ceil(posts.length / columnCount);
  const reordered = new Array(posts.length);
  
  posts.forEach((post, i) => {
    // Calculate position that maintains left-to-right order
    const col = Math.floor(i / rows);
    const row = i % rows;
    const newIndex = row * columnCount + col;
    
    if (newIndex < posts.length) {
      reordered[newIndex] = post;
    }
  });
  
  return reordered.filter(Boolean); // Remove any empty slots
}

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
  const [columnCount, setColumnCount] = useState(4);
  const [tags, setTags] = useState<TagCount[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagSearch, setTagSearch] = useState('');
  const [scrollLoadingEnabled, setScrollLoadingEnabled] = useState(false);
  
  // Function to load posts
  const loadPosts = useCallback(async (pageNum: number, replace: boolean = false) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);

    try {
      // Only fetch from server if not filtering by tag
      if (!selectedTag) {
        const newPosts = await getAllPosts(sortBy, pageNum);
        
        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          setPosts(prev => replace ? newPosts : [...prev, ...newPosts]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [sortBy, selectedTag]);

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

  // Update column count on window resize
  useEffect(() => {
    const updateColumnCount = () => {
      const width = window.innerWidth;
      if (width < 1024) { // lg breakpoint
        setColumnCount(2);
      } else {
        setColumnCount(4);
      }
    };

    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, []);

  // Update the useEffect for loading tags
  useEffect(() => {
    const calculateTagCounts = () => {
      // Create a map to store tag counts
      const tagCountMap = new Map<string, number>();
      
      // Count tags from all posts
      posts.forEach(post => {
        if (post.tags) {
          post.tags.forEach(tag => {
            tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
          });
        }
      });
      
      // Convert map to array of TagCount objects
      const tagCounts: TagCount[] = Array.from(tagCountMap.entries()).map(([tag, count]) => ({
        tag,
        count
      }));
      
      // Sort by count in descending order
      tagCounts.sort((a, b) => b.count - a.count);
      
      setTags(tagCounts);
    };

    calculateTagCounts();
  }, [posts]); // Dependency on posts array

  // Add a function to get filtered posts
  const getFilteredPosts = useCallback(() => {
    if (!selectedTag) return posts;
    return posts.filter(post => post.tags?.includes(selectedTag));
  }, [posts, selectedTag]);

  // Add handleLoadMore function
  const handleLoadMore = useCallback(() => {
    setPage(prev => prev + 1);
    loadPosts(page + 1);
    setScrollLoadingEnabled(true);
  }, [loadPosts, page]);

  if (loading) {
    return <div>Loading...</div>;
  }
  
  const handleComment = async (postId: string, content: string) => {
    try {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected');
      }
      
      await createComment(postId, {
        username: wallet.publicKey.toString(),
        text: content
      });
      
      // Refresh comments after posting
      const updatedComments = await getComments(postId);
      setComments(updatedComments);
    } catch (error) {
      console.error('Failed to create comment:', error);
      toast.error('Failed to post comment');
    }
  };

  // Filtered tags computation
  const filteredTags = tags
    .filter(tag => tag.tag.toLowerCase().includes(tagSearch.toLowerCase()))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // Show top 20 matching tags

  return (
    <>
      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search tags..."
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="flex-grow flex items-center gap-2 overflow-x-auto">
          {selectedTag && (
            <button
              onClick={() => {
                setSelectedTag(null);
              }}
              className="shrink-0 px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Clear Filter
            </button>
          )}
          {filteredTags
            .slice(0, tagSearch ? undefined : MAX_VISIBLE_TAGS)
            .map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(tag);
                }}
                className={`shrink-0 px-3 py-1 text-sm rounded-full ${
                  selectedTag === tag
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                }`}
              >
                {tag} ({count})
              </button>
            ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as PostSortOption)}
          className="shrink-0 px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
        >
          <option value="newest">Latest Posts</option>
          <option value="most-voted">Most Voted</option>
        </select>
      </div>

      <div className={styles.masonryGrid}>
        {reorderPosts(getFilteredPosts(), columnCount).map((post) => (
          <div key={post.id} className={styles.gridItem}>
            <PostCard 
              post={post} 
              onClick={setSelectedPost}
              isWalletConnected={wallet.connected}
            />
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Add Load More button */}
      {hasMore && !loading && !scrollLoadingEnabled && (
        <div className="flex justify-center my-4">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Load More
          </button>
        </div>
      )}
      
      {selectedPost && (
        <PostModal
          wallet={wallet}
          post={selectedPost}
          comments={comments}
          isOpen={true}
          onClose={() => setSelectedPost(null)}
          onComment={handleComment}
        />
      )}
    </>
  );
}
