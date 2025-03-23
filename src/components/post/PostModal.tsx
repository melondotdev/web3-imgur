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
        <div className="flex flex-col md:flex-row h-[95vh] w-full overflow-hidden min-w-0 my-12">
          <div className="h-[45vh] md:h-full w-screen md:w-2/3 flex items-center justify-center bg-black min-w-0">
            <ImageContainer
              imageUrl={getImageUrl()}
              isImageLoading={isImageLoading}
              onImageLoad={handleImageLoad}
            />
          </div>

          {/* Right panel - updated to match video player style */}
          <div className="w-screen md:w-1/3 h-[55vh] md:h-full flex flex-col bg-[#121212] border-t md:border-t-0 md:border-l border-white/5 overflow-hidden min-w-0">
            <PostHeader displayPost={displayPost} handleReport={handleReport} />

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
