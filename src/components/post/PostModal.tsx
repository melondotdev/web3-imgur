import { Modal } from '@/components/base/Modal';
import { useComments } from '@/lib/hooks/post/useComments';
import { useImageLoading } from '@/lib/hooks/post/useImageLoading';
import { usePostActions } from '@/lib/hooks/post/usePostActions';
import type { PostModalProps } from '@/lib/types/gallery/post-modal';
import { ActionBar } from './ActionBar';
import { CommentsSection } from './CommentsSection';
import { ImageContainer } from './ImageContainer';
import { PostHeader } from './PostHeader';

export function PostModal({
  wallet,
  post,
  comments,
  isOpen,
  onClose,
  onComment,
  onVoteClick,
  hasVoted,
  isVoting,
  localPost,
  loadedImages,
  returnRoute,
}: PostModalProps) {
  // Use localPost if available, otherwise fall back to post prop
  const displayPost = localPost || post;

  const { isImageLoading, handleImageLoad, getImageUrl } = useImageLoading({
    imageUrl: displayPost?.imageUrl,
    postId: displayPost?.id,
    loadedImages,
  });

  const {
    newComment,
    localComments,
    votedComments,
    isCommentVoting,
    isCommentInputVisible,
    handleCommentCounterClick,
    handleCommentChange,
    handleSubmitComment,
    handleCommentVote,
  } = useComments({
    initialComments: comments,
    wallet,
    onComment,
  });

  const { handleVoteClick, handleReport, handleAddressClick } = usePostActions({
    onVoteClick,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} returnRoute={returnRoute}>
      {isOpen && (
        <div className="flex flex-col md:flex-row h-full">
          <ImageContainer
            imageUrl={getImageUrl()}
            isImageLoading={isImageLoading}
            onImageLoad={handleImageLoad}
          />

          {/* Right panel - updated to match video player style */}
          <div className="md:w-1/3 h-full flex flex-col bg-[#121212] border-l border-white/5">
            <PostHeader
              displayPost={displayPost}
              handleAddressClick={handleAddressClick}
              handleReport={handleReport}
            />

            <CommentsSection
              localComments={localComments}
              handleAddressClick={handleAddressClick}
              handleCommentVote={handleCommentVote}
              votedComments={votedComments}
              handleReport={handleReport}
              isCommentVoting={isCommentVoting}
            />

            <ActionBar
              handleVoteClick={(e) =>
                handleVoteClick(displayPost.id, displayPost.votes, e)
              }
              isVoting={isVoting}
              hasVoted={hasVoted}
              displayPost={displayPost}
              localComments={localComments}
              onCommentSubmit={(e) => handleSubmitComment(e, displayPost.id)}
              isCommentInputVisible={isCommentInputVisible}
              onCommentCounterClick={handleCommentCounterClick}
              newComment={newComment}
              onCommentChange={handleCommentChange}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
