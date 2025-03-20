import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cacheService } from '@/lib/services/cache-service';
import { imageCacheService } from '@/lib/services/cache-service';
import { createComment } from '@/lib/services/comment-service';
import {
  type PostSortOption,
  getAllPosts,
} from '@/lib/services/db/get-all-posts';
import { getComments } from '@/lib/services/db/get-comments';
import {
  hasUserVoted,
  incrementVote,
  removeVote,
} from '@/lib/services/db/upvote-service';
import type { Comment, Post } from '@/lib/types/post';
// import { useWallet } from '@suiet/wallet-kit';
import { useWallet } from '@solana/wallet-adapter-react';
import { Search } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { CreatePostModal } from './CreatePostModal';
import { PostCard } from './PostCard';
import { PostModal } from './PostModal';
import { Sidebar } from './Sidebar';

interface TagCount {
  tag: string;
  count: number;
}

const MAX_VISIBLE_TAGS = 5; // Adjust this number as needed

function reorderPosts(posts: Post[], columnCount: number): Post[] {
  // With CSS Grid, we don't need to reorder the posts
  // Just return them in their original order
  return posts;
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
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [tagSearch, setTagSearch] = useState('');
  const [scrollLoadingEnabled, setScrollLoadingEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [votedPosts, setVotedPosts] = useState<Set<string>>(new Set());
  const [isVoting, setIsVoting] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Map<string, string>>(
    new Map(),
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [postCache, setPostCache] = useState<Map<string, Post>>(new Map());
  const postCacheRef = useRef<Map<string, Post>>(new Map());

  // Fetch voted posts only on initial load or wallet connect
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      fetchVotedPosts(posts);
    }
  }, [wallet.connected, wallet.publicKey, posts]);

  // Update fetchVotedPosts to accept posts as a parameter
  const fetchVotedPosts = useCallback(
    async (postsToCheck: Post[]) => {
      if (!wallet.connected || !wallet.publicKey) return;

      try {
        const votedPostsPromises = postsToCheck.map((post) =>
          hasUserVoted(post.id, wallet.publicKey?.toString() || ''),
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
    },
    [wallet.connected, wallet.publicKey],
  );

  // Initialize cache only once
  useEffect(() => {
    const cachedPosts = cacheService.get<Post[]>('all-posts');
    if (cachedPosts) {
      const postMap = new Map(cachedPosts.map((post) => [post.id, post]));
      setPostCache(postMap);
      postCacheRef.current = postMap;
      if (!posts.length) {
        // Only set posts if there are none
        setPosts(cachedPosts);
      }
    }
  }, []); // Empty dependency array

  // Update loadPosts to use ref instead of state
  const loadPosts = useCallback(
    async (pageNum: number, replace = false) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        const newPosts = await getAllPosts(sortBy, pageNum);

        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          setPosts((prev) => {
            const updatedPosts = replace ? newPosts : [...prev, ...newPosts];
            // Update cache using ref
            const newCache = new Map(postCacheRef.current);
            for (const post of updatedPosts) {
              newCache.set(post.id, post);
            }
            postCacheRef.current = newCache;
            cacheService.set('all-posts', updatedPosts);

            return updatedPosts;
          });

          // Fetch votes after posts are loaded
          if (wallet.connected && wallet.publicKey) {
            await fetchVotedPosts(newPosts);
          }
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        toast.error('Failed to load posts');
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [sortBy, wallet.connected, wallet.publicKey, fetchVotedPosts],
  );

  // Update the useEffect to fetch votes when wallet connects
  useEffect(() => {
    const fetchVotes = async () => {
      if (wallet.connected && wallet.publicKey && posts.length > 0) {
        await fetchVotedPosts(posts);
      }
    };

    fetchVotes();
  }, [wallet.connected, wallet.publicKey, posts, fetchVotedPosts]);

  // Handle voting at the Gallery level
  const handleVoteClick = useCallback(
    async (postId: string, currentVotes: number) => {
      if (!wallet.connected || !wallet.publicKey || !wallet.signMessage) {
        toast.error('Please connect your wallet to vote');
        return;
      }

      if (isVoting) return;

      try {
        setIsVoting(true);
        const isCurrentlyVoted = votedPosts.has(postId);

        // Store original states for rollback
        const originalVotedPosts = new Set(votedPosts);
        const originalPosts = [...posts];
        const originalSelectedPost = selectedPost;

        try {
          if (isCurrentlyVoted) {
            await removeVote(postId, wallet.publicKey.toString());
            setVotedPosts((prev) => {
              const newSet = new Set(prev);
              newSet.delete(postId);
              return newSet;
            });
          } else {
            const message = new TextEncoder().encode(
              `Vote for post: ${postId}`,
            );
            const signature = await wallet.signMessage(message);
            const signatureString = Buffer.from(signature).toString('base64');
            await incrementVote(
              postId,
              signatureString,
              wallet.publicKey.toString(),
            );
            setVotedPosts((prev) => {
              const newSet = new Set(prev);
              newSet.add(postId);
              return newSet;
            });
          }

          // Update post vote counts
          const newVoteCount = isCurrentlyVoted
            ? currentVotes - 1
            : currentVotes + 1;
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === postId ? { ...post, votes: newVoteCount } : post,
            ),
          );

          if (selectedPost?.id === postId) {
            setSelectedPost((prev) =>
              prev ? { ...prev, votes: newVoteCount } : null,
            );
          }
        } catch (error) {
          // Rollback all state on error
          setVotedPosts(originalVotedPosts);
          setPosts(originalPosts);
          setSelectedPost(originalSelectedPost);

          if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error('Failed to update vote');
          }
        }
      } finally {
        setIsVoting(false);
      }
    },
    [wallet, isVoting, votedPosts, posts, selectedPost],
  );

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
      if (width < 640) {
        // sm
        setColumnCount(2);
      } else if (width < 768) {
        // md
        setColumnCount(3);
      } else if (width < 1024) {
        // lg
        setColumnCount(4);
      } else if (width < 1280) {
        // xl
        setColumnCount(5);
      } else {
        // 2xl
        setColumnCount(6);
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
      for (const post of posts) {
        if (post.tags) {
          for (const tag of post.tags) {
            tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
          }
        }
      }

      // Convert map to array of TagCount objects
      const tagCounts: TagCount[] = Array.from(tagCountMap.entries()).map(
        ([tag, count]) => ({
          tag,
          count,
        }),
      );

      // Sort by count in descending order
      tagCounts.sort((a, b) => b.count - a.count);

      setTags(tagCounts);
    };

    calculateTagCounts();
  }, [posts]); // Dependency on posts array

  // Update getFilteredPosts to handle 'all' tag correctly
  const getFilteredPosts = useCallback(() => {
    if (selectedTag === 'all') return posts;
    return posts.filter((post) => post.tags?.includes(selectedTag));
  }, [posts, selectedTag]);

  // Add handleLoadMore function
  const handleLoadMore = useCallback(() => {
    setPage((prev) => prev + 1);
    loadPosts(page + 1);
    setScrollLoadingEnabled(true);
  }, [loadPosts, page]);

  // Add handler for new posts
  const handleNewPost = useCallback((newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  // Add this function to handle image preloading
  const preloadImage = useCallback((imageUrl: string) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }, []);

  // Update handleImageLoad to use cache
  const handleImageLoad = useCallback((postId: string, imageUrl: string) => {
    setLoadedImages((prev) => {
      const newMap = new Map(prev);
      newMap.set(postId, imageUrl);
      return newMap;
    });
    // Cache the image URL
    imageCacheService.set(postId, imageUrl);
  }, []);

  // Update handlePostSelect to preload image
  const handlePostSelect = useCallback(
    async (post: Post) => {
      const cachedPost = postCacheRef.current.get(post.id);

      // If wallet is connected, ensure we have the vote status
      if (wallet.connected && wallet.publicKey) {
        const hasVoted = await hasUserVoted(
          post.id,
          wallet.publicKey.toString(),
        );
        if (hasVoted) {
          setVotedPosts((prev) => new Set(prev).add(post.id));
        }
      }

      // Rest of the function remains the same...
      const cachedImage =
        loadedImages.get(post.id) || imageCacheService.get(post.id);

      if (!cachedImage) {
        try {
          await preloadImage(post.imageUrl);
          handleImageLoad(post.id, post.imageUrl);
        } catch (error) {
          console.error('Failed to preload image:', error);
        }
      }

      setSelectedPost(cachedPost || post);
    },
    [
      loadedImages,
      handleImageLoad,
      preloadImage,
      wallet.connected,
      wallet.publicKey,
    ],
  );

  // Add effect to preload images for visible posts
  useEffect(() => {
    const preloadVisiblePosts = async () => {
      const visiblePosts = getFilteredPosts().slice(0, 10); // Preload first 10 posts
      for (const post of visiblePosts) {
        if (!loadedImages.has(post.id) && !imageCacheService.get(post.id)) {
          try {
            await preloadImage(post.imageUrl);
            handleImageLoad(post.id, post.imageUrl);
          } catch (error) {
            console.error('Failed to preload image:', error);
          }
        }
      }
    };

    preloadVisiblePosts();
  }, [posts, getFilteredPosts, loadedImages, preloadImage, handleImageLoad]);

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
        text: content,
      });

      // Create a properly structured comment object
      const formattedComment: Comment = {
        id: newComment.id,
        author: newComment.author || wallet.publicKey.toString(),
        content: newComment.content || content,
        createdAt: newComment.createdAt || new Date().toISOString(),
        votes: newComment.votes || 0,
      };

      // Update comments locally with the formatted comment
      setComments((prev) => [...prev, formattedComment]);

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
    .filter((tag) => tag.tag.toLowerCase().includes(tagSearch.toLowerCase()))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // Show top 20 matching tags

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-40 min-w-0">
        <div className="mb-4 flex items-center gap-2 px-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              {isSearchOpen ? (
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  className="w-48 px-3 py-1.5 text-sm border border-gray-700 rounded-full bg-transparent text-gray-300 focus:outline-none focus:border-gray-600"
                  onBlur={() => {
                    if (!tagSearch) {
                      setIsSearchOpen(false);
                    }
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {/* Add the "All" tag */}
              <button
                type="button"
                onClick={() => setSelectedTag('all')}
                className={`shrink-0 px-3 py-1.5 text-sm rounded-full transition-colors ${
                  selectedTag === 'all'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All
              </button>
              {filteredTags
                .slice(0, tagSearch ? undefined : MAX_VISIBLE_TAGS)
                .map(({ tag, count }) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`shrink-0 px-3 py-1.5 text-sm rounded-full transition-colors ${
                      selectedTag === tag
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tag} ({count})
                  </button>
                ))}
            </div>
          </div>

          <div className="flex-grow" />

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors bg-transparent text-gray-400 hover:text-white">
              <span className="text-sm">
                {sortBy === 'newest' ? 'Latest Posts' : 'Most Voted'}
              </span>
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setSortBy('newest')}
              >
                <span>Latest Posts</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setSortBy('most-voted')}
              >
                <span>Most Voted</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4">
          {reorderPosts(getFilteredPosts(), columnCount).map((post) => (
            <div key={post.id} className="w-full">
              <PostCard
                post={post}
                onClick={handlePostSelect}
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        )}

        {hasMore && !loading && !scrollLoadingEnabled && (
          <div className="flex justify-center my-8 pb-8">
            <button
              type="button"
              onClick={handleLoadMore}
              className="px-3 py-1.5 text-sm bg-gray-800/50 text-gray-400 rounded-full hover:bg-gray-800 hover:text-white transition-colors"
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
      </main>
    </div>
  );
}
