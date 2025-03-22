import { cacheService } from '@/lib/services/cache/cache-service';
import { imageCacheService } from '@/lib/services/cache/cache-service';
import { signatureCacheService } from '@/lib/services/cache/cache-service';
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
import { createComment } from '@/lib/services/request/comment-service';
import type { TagCount } from '@/lib/types/gallery/tag';
import type { Comment, Post } from '@/lib/types/post';
// import { useWallet } from '@suiet/wallet-kit';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { CreatePostModal } from './CreatePostModal';
import { PostCard } from './PostCard';
import { PostModal } from './PostModal';
import { Sidebar } from './Sidebar';
import { GalleryHeader } from './gallery/GalleryHeader';

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
  const [columnWidth, setColumnWidth] = useState(0);
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

  // Add effect to handle wallet connection and signature caching
  useEffect(() => {
    const cacheSignature = async () => {
      if (wallet.connected && wallet.publicKey && wallet.signMessage) {
        try {
          // Check if we already have a cached signature
          const cachedSignature = signatureCacheService.get(
            wallet.publicKey.toString(),
          );
          if (!cachedSignature) {
            // Create a message to sign
            const message = new TextEncoder().encode('Sign in to Web3 Imgur');
            const signature = await wallet.signMessage(message);
            const signatureString = Buffer.from(signature).toString('base64');
            signatureCacheService.set(
              wallet.publicKey.toString(),
              signatureString,
            );
          }
        } catch (error) {
          console.error('Failed to cache signature:', error);
          toast.error('Failed to cache signature');
        }
      }
    };

    cacheSignature();
  }, [wallet.connected, wallet.publicKey, wallet.signMessage]);

  // Update handleVoteClick to use cached signature
  const handleVoteClick = useCallback(
    async (postId: string, currentVotes: number) => {
      if (!wallet.connected || !wallet.publicKey) {
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
            // Get cached signature
            const signature =
              signatureCacheService.get(wallet.publicKey.toString()) || '';
            await incrementVote(postId, signature, wallet.publicKey.toString());
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

          // Update selected post if it's the same one
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
            toast.error('Failed to vote', {
              description: error.message,
            });
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

  // Add a function to handle vote updates from PostModal
  const handlePostModalVoteUpdate = useCallback(
    (postId: string, newVoteCount: number) => {
      // Update posts array
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, votes: newVoteCount } : post,
        ),
      );

      // Update selected post if it's the same one
      if (selectedPost?.id === postId) {
        setSelectedPost((prev) =>
          prev ? { ...prev, votes: newVoteCount } : null,
        );
      }

      // Update voted posts set
      if (newVoteCount > (posts.find((p) => p.id === postId)?.votes || 0)) {
        setVotedPosts((prev) => {
          const newSet = new Set(prev);
          newSet.add(postId);
          return newSet;
        });
      } else {
        setVotedPosts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
    },
    [selectedPost, posts],
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

  // Update column count and width on window resize
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateColumns = () => {
      const mainElement = document.querySelector('main');
      if (!mainElement) return;

      const sidebarWidth = 160; // w-40 class from Sidebar.tsx equals 10rem (160px)
      const minColumnWidth = 200; // Minimum width for each column
      const gap = 16; // 1rem = 16px
      const padding = 32; // 32px for padding (16px each side)

      // Calculate available width accounting for sidebar and padding
      const availableWidth = mainElement.clientWidth - sidebarWidth - padding;

      // Calculate maximum number of columns that can fit while maintaining minimum width
      const maxColumns = Math.floor(
        (availableWidth + gap) / (minColumnWidth + gap),
      );
      const newColumnCount = Math.max(1, Math.min(maxColumns, 5)); // Between 1 and 6 columns

      // Calculate the actual column width to fill available space
      const totalGapWidth = (newColumnCount - 1) * gap;
      const newColumnWidth = Math.floor(
        (availableWidth - totalGapWidth) / newColumnCount,
      );

      setColumnCount(newColumnCount);
      setColumnWidth(newColumnWidth);
    };

    // Debounced resize handler
    const debouncedUpdateColumns = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateColumns, 150); // 150ms debounce
    };

    // Initial calculation
    updateColumns();

    // Add resize listener with debouncing
    window.addEventListener('resize', debouncedUpdateColumns);

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedUpdateColumns);
      clearTimeout(timeoutId);
    };
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
      // Get the most up-to-date post data from our posts array
      const currentPost = posts.find((p) => p.id === post.id) || post;

      // If wallet is connected, ensure we have the vote status
      if (wallet.connected && wallet.publicKey) {
        const hasVoted = await hasUserVoted(
          currentPost.id,
          wallet.publicKey.toString(),
        );
        if (hasVoted) {
          setVotedPosts((prev) => new Set(prev).add(currentPost.id));
        }
      }

      const cachedImage =
        loadedImages.get(currentPost.id) ||
        imageCacheService.get(currentPost.id);

      if (!cachedImage) {
        try {
          await preloadImage(currentPost.imageUrl);
          handleImageLoad(currentPost.id, currentPost.imageUrl);
        } catch (error) {
          console.error('Failed to preload image:', error);
        }
      }

      setSelectedPost(currentPost);
    },
    [
      loadedImages,
      handleImageLoad,
      preloadImage,
      wallet.connected,
      wallet.publicKey,
      posts,
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
      toast.error('Failed to post comment', {
        description: 'Please try again later',
      });
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
        <GalleryHeader
          isSearchOpen={isSearchOpen}
          tagSearch={tagSearch}
          setTagSearch={setTagSearch}
          setIsSearchOpen={setIsSearchOpen}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          filteredTags={filteredTags}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        <div
          style={
            {
              columns: columnCount,
              columnGap: '1rem',
              width: 'calc(100% - 2rem)',
              margin: '0 auto',
            } as React.CSSProperties
          }
          className="px-4"
        >
          {getFilteredPosts().map((post) => (
            <div
              key={post.id}
              style={{ width: columnWidth }}
              className="mb-4 break-inside-avoid inline-block"
            >
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
            onLocalVoteUpdate={handlePostModalVoteUpdate}
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
