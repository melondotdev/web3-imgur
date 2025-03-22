import { useColumnLayout } from '@/lib/hooks/useColumnLayout';
import { useComments } from '@/lib/hooks/useComments';
import { useImagePreload } from '@/lib/hooks/useImagePreload';
import { usePostLoading } from '@/lib/hooks/usePostLoading';
import { usePostSelection } from '@/lib/hooks/usePostSelection';
import { useTags } from '@/lib/hooks/useTags';
import { useVotedPosts } from '@/lib/hooks/useVotedPosts';
import type { PostSortOption } from '@/lib/services/db/get-all-posts';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { CreatePostModal } from './CreatePostModal';
import { PostCard } from './PostCard';
import { PostModal } from './PostModal';
import { Sidebar } from './Sidebar';
import { GalleryHeader } from './gallery/GalleryHeader';

export function Gallery() {
  const wallet = useWallet();
  const [sortBy, setSortBy] = useState<PostSortOption>('newest');
  const [scrollLoadingEnabled, setScrollLoadingEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { posts, loading, hasMore, handleLoadMore, handleNewPost, setPosts } =
    usePostLoading(sortBy);
  const { loadedImages, handleImageLoad, preloadImage } = useImagePreload();
  const { columnCount, columnWidth } = useColumnLayout();

  const {
    selectedPost,
    setSelectedPost,
    handlePostSelect,
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
  } = useTags({ posts });

  if (loading) {
    return <div>Loading...</div>;
  }

  const filteredTags = getFilteredTags();

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
          {getFilteredPosts(posts).map((post) => (
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
