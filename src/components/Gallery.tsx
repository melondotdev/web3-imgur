import { useColumnLayout } from '@/lib/hooks/useColumnLayout';
import { useImagePreload } from '@/lib/hooks/useImagePreload';
import { usePostLoading } from '@/lib/hooks/usePostLoading';
import { useVotedPosts } from '@/lib/hooks/useVotedPosts';
import type { PostSortOption } from '@/lib/services/db/get-all-posts';
import { getComments } from '@/lib/services/db/get-comments';
import { createComment } from '@/lib/services/request/comment-service';
import type { TagCount } from '@/lib/types/gallery/tag';
import type { Comment, Post } from '@/lib/types/post';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CreatePostModal } from './CreatePostModal';
import { PostCard } from './PostCard';
import { PostModal } from './PostModal';
import { Sidebar } from './Sidebar';
import { GalleryHeader } from './gallery/GalleryHeader';

export function Gallery() {
  const wallet = useWallet();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [sortBy, setSortBy] = useState<PostSortOption>('newest');
  const [scrollLoadingEnabled, setScrollLoadingEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [tags, setTags] = useState<TagCount[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [tagSearch, setTagSearch] = useState('');

  const { posts, loading, hasMore, handleLoadMore, handleNewPost, setPosts } =
    usePostLoading(sortBy);

  // Define handlePostModalVoteUpdate before using it
  const handlePostModalVoteUpdate = useCallback(
    (postId: string, newVoteCount: number) => {
      // Update posts array
      setPosts((prevPosts: Post[]) =>
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
    },
    [selectedPost, setPosts],
  );

  const { votedPosts, isVoting, handleVoteClick } = useVotedPosts(
    posts,
    handlePostModalVoteUpdate,
  );
  const { loadedImages, handleImageLoad, preloadImage } = useImagePreload();
  const { columnCount, columnWidth } = useColumnLayout();

  // Update handlePostSelect to use preloadImage
  const handlePostSelect = useCallback(
    async (post: Post) => {
      // Get the most up-to-date post data from our posts array
      const currentPost = posts.find((p) => p.id === post.id) || post;

      const cachedImage = loadedImages.get(currentPost.id);

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
    [loadedImages, handleImageLoad, preloadImage, posts],
  );

  // Load comments when a post is selected
  useEffect(() => {
    if (selectedPost) {
      getComments(selectedPost.id)
        .then((fetchedComments) => {
          setComments(fetchedComments);
        })
        .catch((error) => {
          console.error('Failed to fetch comments:', error);
          toast.error('Failed to load comments');
        });
    } else {
      setComments([]);
    }
  }, [selectedPost]);

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
  }, [posts]);

  // Update getFilteredPosts to handle 'all' tag correctly
  const getFilteredPosts = useCallback(() => {
    if (selectedTag === 'all') return posts;
    return posts.filter((post) => post.tags?.includes(selectedTag));
  }, [posts, selectedTag]);

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

  if (loading) {
    return <div>Loading...</div>;
  }

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
              onClick={() => {
                handleLoadMore();
                setScrollLoadingEnabled(true);
              }}
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
