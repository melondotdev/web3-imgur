import { useColumnLayout } from '@/lib/hooks/gallery/useColumnLayout';
import { useComments } from '@/lib/hooks/gallery/useComments';
import { useImagePreload } from '@/lib/hooks/gallery/useImagePreload';
import { usePostLoading } from '@/lib/hooks/gallery/usePostLoading';
import { usePostSelection } from '@/lib/hooks/gallery/usePostSelection';
import { useTags } from '@/lib/hooks/gallery/useTags';
import { useVotedPosts } from '@/lib/hooks/gallery/useVotedPosts';
import type { PostSortOption } from '@/lib/services/db/get-all-posts';
import type { Post } from '@/lib/types/post';
import { useWallet } from '@solana/wallet-adapter-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { PostModal } from '../post/PostModal';
import { CreatePostModal } from './CreatePostModal';
import { GalleryHeader } from './GalleryHeader';
import { PostCard } from './PostCard';

export function Gallery({
  initialPostId,
  defaultTag,
}: { initialPostId?: string; defaultTag?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const wallet = useWallet();
  const [sortBy, setSortBy] = useState<PostSortOption>('newest');
  const [scrollLoadingEnabled, setScrollLoadingEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const defaultRoute = defaultTag ? `/${defaultTag}hub` : '';

  const { posts, loading, hasMore, handleLoadMore, handleNewPost, setPosts } =
    usePostLoading({ sortBy, defaultTag });
  const { loadedImages, handleImageLoad, preloadImage } = useImagePreload();
  const { columnCount } = useColumnLayout();

  const {
    selectedPost,
    setSelectedPost,
    handlePostSelect: originalHandlePostSelect,
    handlePostModalVoteUpdate,
  } = usePostSelection({
    posts,
    loadedImages,
    preloadImage,
    handleImageLoad,
    setPosts,
  });

  const { votedPosts, isVoting, handleVoteClick } = useVotedPosts(
    posts,
    handlePostModalVoteUpdate,
  );

  const { comments, handleComment } = useComments({
    selectedPost,
    walletPublicKey: wallet.publicKey,
  });

  const {
    selectedTag,
    setSelectedTag,
    tagSearch,
    setTagSearch,
    getFilteredPosts,
    getFilteredTags,
  } = useTags({ posts, defaultTag });

  // Wrap handlePostSelect to handle both post selection and URL update
  const handlePostSelect = useCallback(
    async (post: Post) => {
      await originalHandlePostSelect(post);
      if (pathname !== `${defaultRoute}/${post.id}`) {
        router.replace(`${defaultRoute}/${post.id}`, { scroll: false });
      }
    },
    [originalHandlePostSelect, pathname, router, defaultRoute],
  );

  // Handle URL changes from browser navigation
  useEffect(() => {
    const path = pathname.slice(1); // Remove leading slash
    if (!path) {
      setSelectedPost(null);
      return;
    }

    // If we have a defaultRoute, the post ID will be after it
    const postId = defaultRoute
      ? path.replace(`${defaultRoute.slice(1)}/`, '')
      : path;

    if (postId !== selectedPost?.id && posts.length > 0) {
      const post = posts.find((p) => p.id === postId);
      if (post) {
        originalHandlePostSelect(post);
      }
    }
  }, [
    pathname,
    posts,
    selectedPost?.id,
    originalHandlePostSelect,
    defaultRoute,
  ]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setSelectedPost(null);
    router.replace(defaultRoute || '/', { scroll: false });
  }, [router, setSelectedPost, defaultRoute]);

  // Handle initial post loading from URL
  useEffect(() => {
    if (initialPostId && posts.length > 0) {
      const post = posts.find((p) => p.id === initialPostId);
      if (post) {
        setSelectedPost(post);
      }
    }
  }, [initialPostId, posts]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const filteredTags = getFilteredTags();

  return (
    <div className="flex w-full">
      <main className="w-full min-w-0 overflow-hidden">
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
              columnGap: '0.5rem',
              width: '100%',
              maxWidth: '100%',
              margin: '0 auto',
              boxSizing: 'border-box',
              overflowX: 'hidden',
              paddingInline: '0.5rem',
            } as React.CSSProperties
          }
        >
          {getFilteredPosts(posts).map((post) => (
            <div
              key={post.id}
              style={{
                width: '100%',
                maxWidth: '100%',
              }}
              className="mb-2 break-inside-avoid"
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
            onClose={handleModalClose}
            onComment={handleComment}
            onVoteClick={handleVoteClick}
            hasVoted={votedPosts.has(selectedPost.id)}
            isVoting={isVoting}
            loadedImages={loadedImages}
            onLocalVoteUpdate={handlePostModalVoteUpdate}
            returnRoute={defaultRoute || '/'}
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
