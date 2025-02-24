import {
  getAllPosts,
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
import { CreatePostModal } from './CreatePostModal';
import { incrementVote, removeVote, hasUserVoted } from '@/lib/services/db/upvote-service';

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
  const [isOpen, setIsOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [votedPosts, setVotedPosts] = useState<Set<string>>(new Set());
  const [isVoting, setIsVoting] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Map<string, string>>(new Map());

  // Fetch voted posts only on initial load or wallet connect
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      fetchVotedPosts(posts);
    }
  }, [wallet.connected, wallet.publicKey, posts]);

  // Update fetchVotedPosts to accept posts as a parameter
  const fetchVotedPosts = useCallback(async (postsToCheck: Post[]) => {
    if (!wallet.connected || !wallet.publicKey) return;
    
    try {
      const votedPostsPromises = postsToCheck.map(post => 
        hasUserVoted(post.id, wallet.publicKey!.toString())
      );
      
      const votedResults = await Promise.all(votedPostsPromises);
      
      const newVotedPosts = new Set<string>();
      postsToCheck.forEach((post, index) => {
        if (votedResults[index]) {
          newVotedPosts.add(post.id);
        }
      });
      
      setVotedPosts(newVotedPosts);
    } catch (error) {
      console.error('Failed to fetch voted posts:', error);
    }
  }, [wallet.connected, wallet.publicKey]);

  // Update loadPosts to fetch votes after loading posts
  const loadPosts = useCallback(async (pageNum: number, replace: boolean = false) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);

    try {
      if (!selectedTag) {
        const newPosts = await getAllPosts(sortBy, pageNum);
        
        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          setPosts(prev => {
            const updatedPosts = replace ? newPosts : [...prev, ...newPosts];
            // Fetch votes for the new posts if wallet is connected
            if (wallet.connected && wallet.publicKey) {
              fetchVotedPosts(updatedPosts);
            }
            return updatedPosts;
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [sortBy, selectedTag, wallet.connected, wallet.publicKey, fetchVotedPosts]);

  // Update the useEffect to fetch votes when wallet connects
  useEffect(() => {
    if (wallet.connected && wallet.publicKey && posts.length > 0) {
      fetchVotedPosts(posts);
    }
  }, [wallet.connected, wallet.publicKey, posts, fetchVotedPosts]);

  // Handle voting at the Gallery level
  const handleVoteClick = useCallback(async (postId: string, currentVotes: number) => {
    if (!wallet.connected || !wallet.publicKey || !wallet.signMessage) {
      toast.error('Please connect your wallet to vote');
      return;
    }

    if (isVoting) return;
    
    try {
      setIsVoting(true);
      const isCurrentlyVoted = votedPosts.has(postId);
      const newVoteCount = isCurrentlyVoted ? currentVotes - 1 : currentVotes + 1;

      // Store original states for rollback
      const originalVotedPosts = new Set(votedPosts);
      const originalPosts = [...posts];
      const originalSelectedPost = selectedPost;

      try {
        // Make API call first
        if (!isCurrentlyVoted) {
          // Add vote
          const message = new TextEncoder().encode(`Vote for post: ${postId}`);
          const signature = await wallet.signMessage(message);
          const signatureString = Buffer.from(signature).toString('base64');
          await incrementVote(postId, signatureString, wallet.publicKey.toString());
          // Update voted posts set after successful API call
          setVotedPosts(prev => {
            const newSet = new Set(prev);
            newSet.add(postId);
            return newSet;
          });
        } else {
          // Remove vote
          await removeVote(postId, wallet.publicKey.toString());
          // Update voted posts set after successful API call
          setVotedPosts(prev => {
            const newSet = new Set(prev);
            newSet.delete(postId);
            return newSet;
          });
        }

        // Update post vote counts after successful API call
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, votes: newVoteCount }
              : post
          )
        );

        if (selectedPost?.id === postId) {
          setSelectedPost(prev => 
            prev ? { ...prev, votes: newVoteCount } : null
          );
        }

      } catch (error) {
        // Rollback all state on error
        setVotedPosts(originalVotedPosts);
        setPosts(originalPosts);
        setSelectedPost(originalSelectedPost);
        
        // Show appropriate error message
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to update vote');
        }
      }

    } finally {
      setIsVoting(false);
    }
  }, [wallet, isVoting, votedPosts, posts, selectedPost]);

  // Load initial posts when sort changes
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    loadPosts(0, true);
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

  // Add handler for new posts
  const handleNewPost = useCallback((newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  }, []);

  // Add this function to handle image loading
  const handleImageLoad = useCallback((postId: string, imageUrl: string) => {
    setLoadedImages(prev => {
      const newMap = new Map(prev);
      newMap.set(postId, imageUrl);
      return newMap;
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  
  const handleComment = async (postId: string, content: string) => {
    try {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected');
      }
      
      const newComment = await createComment(postId, {
        username: wallet.publicKey.toString(),
        text: content
      });
      
      // Create a properly structured comment object
      const formattedComment: Comment = {
        id: newComment.id,
        author: newComment.author || wallet.publicKey.toString(),
        content: newComment.content || content,
        createdAt: newComment.createdAt || new Date().toISOString(),
        votes: newComment.votes || 0
      };
      
      // Update comments locally with the formatted comment
      setComments(prev => [...prev, formattedComment]);
      
      // Return the formatted comment
      return formattedComment;
    } catch (error) {
      console.error('Failed to create comment:', error);
      toast.error('Failed to post comment');
      throw error;
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
              onVoteClick={handleVoteClick}
              hasVoted={votedPosts.has(post.id)}
              isVoting={isVoting}
              onImageLoad={handleImageLoad}
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
          onVoteClick={handleVoteClick}
          hasVoted={votedPosts.has(selectedPost.id)}
          isVoting={isVoting}
          loadedImages={loadedImages}
        />
      )}

      <CreatePostModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setWalletAddress('');
        }}
        walletAddress={walletAddress}
        onPostCreated={handleNewPost}
      />
    </>
  );
}
