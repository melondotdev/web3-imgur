import { Modal } from '@/components/base/Modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { imageCacheService } from '@/lib/services/cache-service';
import {
  hasUserVotedComment,
  incrementCommentVote,
  removeCommentVote,
} from '@/lib/services/db/comment-vote-service';
import type { Comment, Post } from '@/lib/types/post';
import { cn } from '@/lib/utils/cn';
import { trimUsername } from '@/lib/utils/trim-username';
import type { WalletContextState } from '@solana/wallet-adapter-react';
// import { ConnectButton, useWallet } from '@suiet/wallet-kit';
import {
  Flag,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Star,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface PostModalProps {
  wallet: WalletContextState;
  post: Post;
  comments: Comment[];
  isOpen: boolean;
  onClose: () => void;
  onComment?: (id: string, content: string) => Promise<Comment>;
  onVoteClick: (postId: string, currentVotes: number) => Promise<void>;
  hasVoted: boolean;
  isVoting: boolean;
  localPost?: Post;
  onLocalVoteUpdate?: (postId: string, newVoteCount: number) => void;
  loadedImages?: Map<string, string>;
}

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
  onLocalVoteUpdate,
  loadedImages,
}: PostModalProps) {
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [votedComments, setVotedComments] = useState<Set<string>>(new Set());
  const [isCommentVoting, setIsCommentVoting] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isCommentInputVisible, setIsCommentInputVisible] = useState(false);

  // Use localPost if available, otherwise fall back to post prop
  const displayPost = localPost || post;

  // Update localComments when comments prop changes
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  // Update the image loading logic
  useEffect(() => {
    if (!displayPost?.imageUrl) return;

    // Check loaded images first
    if (loadedImages?.has(displayPost.id)) {
      setIsImageLoading(false);
      return;
    }

    // Then check cache
    const cachedImage = imageCacheService.get(displayPost.id);
    if (cachedImage) {
      setIsImageLoading(false);
      return;
    }

    // If not cached, load the image
    setIsImageLoading(true);
    const img = new Image();
    img.src = displayPost.imageUrl;
    img.onload = () => {
      setIsImageLoading(false);
      // Update cache
      imageCacheService.set(displayPost.id, displayPost.imageUrl);
    };
  }, [displayPost?.id, displayPost?.imageUrl, loadedImages]);

  const handleVoteClick = async () => {
    await onVoteClick(displayPost.id, displayPost.votes);
    // Update local vote count if callback is provided
    if (onLocalVoteUpdate) {
      onLocalVoteUpdate(
        displayPost.id,
        hasVoted ? displayPost.votes - 1 : displayPost.votes + 1,
      );
    }
  };

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (
      !trimmed ||
      !wallet.connected ||
      !wallet.signMessage ||
      !wallet.publicKey
    ) {
      return;
    }

    try {
      const msgBytes = new TextEncoder().encode(trimmed);
      await wallet.signMessage(msgBytes);

      if (onComment) {
        const response = await onComment(displayPost.id, trimmed);

        if (!response) {
          throw new Error('No response received from comment creation');
        }

        // Create a new comment object with strict type checking
        const newComment: Comment = {
          id: response.id,
          author: response.author || wallet.publicKey.toString(),
          content: response.content || trimmed,
          createdAt: response.createdAt || new Date().toISOString(),
          votes: typeof response.votes === 'number' ? response.votes : 0,
        };

        // Validate the new comment object
        if (!newComment.id || !newComment.author || !newComment.content) {
          console.error('Invalid comment data:', newComment); // Debug log
          throw new Error('Invalid comment data received');
        }

        // Update local comments
        setLocalComments((prev) => [...prev, newComment]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit comment',
      );
    }
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  const fetchVotedComments = useCallback(
    async (commentsToCheck: Comment[]) => {
      if (!wallet.connected || !wallet.publicKey) return;

      try {
        const votedCommentsPromises = commentsToCheck.map((comment) =>
          hasUserVotedComment(comment.id, wallet.publicKey?.toString() || ''),
        );

        const votedResults = await Promise.all(votedCommentsPromises);

        const newVotedComments = new Set<string>();
        commentsToCheck.forEach((comment, index) => {
          if (votedResults[index]) {
            newVotedComments.add(comment.id);
          }
        });

        setVotedComments(newVotedComments);
      } catch (error) {
        console.error('Failed to fetch voted comments:', error);
      }
    },
    [wallet.connected, wallet.publicKey],
  );

  useEffect(() => {
    if (wallet.connected && wallet.publicKey && comments.length > 0) {
      fetchVotedComments(comments);
    }
  }, [wallet.connected, wallet.publicKey, comments, fetchVotedComments]);

  const handleCommentVote = useCallback(
    async (commentId: string, currentVotes: number) => {
      if (!wallet.connected || !wallet.publicKey || !wallet.signMessage) {
        toast.error('Please connect your wallet to vote');
        return;
      }

      if (isCommentVoting) return;

      try {
        setIsCommentVoting(true);
        const isCurrentlyVoted = votedComments.has(commentId);
        const newVoteCount = isCurrentlyVoted
          ? currentVotes - 1
          : currentVotes + 1;

        // Store original state for rollback
        const originalVotedComments = new Set(votedComments);
        const originalComments = [...localComments];

        try {
          // Make API call first
          if (isCurrentlyVoted) {
            // Remove vote
            await removeCommentVote(commentId, wallet.publicKey.toString());
            setVotedComments((prev) => {
              const newSet = new Set(prev);
              newSet.delete(commentId);
              return newSet;
            });
          } else {
            // Add vote
            const message = new TextEncoder().encode(
              `Vote for comment: ${commentId}`,
            );
            const signature = await wallet.signMessage(message);
            const signatureString = Buffer.from(signature).toString('base64');
            await incrementCommentVote(
              commentId,
              signatureString,
              wallet.publicKey.toString(),
            );
            setVotedComments((prev) => {
              const newSet = new Set(prev);
              newSet.add(commentId);
              return newSet;
            });
          }

          // Update comment vote counts
          setLocalComments((prevComments) =>
            prevComments.map((comment) =>
              comment.id === commentId
                ? { ...comment, votes: newVoteCount }
                : comment,
            ),
          );
        } catch (error) {
          // Rollback state on error
          setVotedComments(originalVotedComments);
          setLocalComments(originalComments);

          if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error('Failed to update vote');
          }
        }
      } finally {
        setIsCommentVoting(false);
      }
    },
    [wallet, isCommentVoting, votedComments, localComments],
  );

  const handleCommentCounterClick = () => {
    setIsCommentInputVisible(true);
  };

  const handleReport = (type: 'post' | 'comment', id: string) => {
    toast.success(`${type} reported`);
  };

  const handleAddressClick = (address: string) => {
    window.open(`https://solscan.io/account/${address}`, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {isOpen && (
        <div className="flex flex-col md:flex-row h-full">
          {/* Image container - darker background */}
          <div className="md:w-2/3 relative bg-black h-full">
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/30" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={
                  loadedImages?.get(displayPost.id) ||
                  imageCacheService.get(displayPost.id) ||
                  displayPost.imageUrl
                }
                alt="post content"
                className={cn(
                  'w-full h-full object-contain',
                  'drop-shadow-2xl',
                  'transition-opacity duration-200',
                  isImageLoading && 'opacity-0',
                )}
                onLoad={() => setIsImageLoading(false)}
              />
            </div>
          </div>

          {/* Right panel - updated to match video player style */}
          <div className="md:w-1/3 h-full flex flex-col bg-[#121212] border-l border-white/5">
            {/* Header section */}
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden">
                    {/* User avatar could go here */}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">
                      <button
                        type="button"
                        onClick={() => handleAddressClick(displayPost.username)}
                        className="hover:text-blue-400 transition-colors"
                      >
                        {trimUsername(displayPost.username)}
                      </button>
                    </h3>
                    <span className="text-sm text-gray-400">
                      {new Date(displayPost.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild={true}>
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="bg-gray-900 border-white/10"
                    sideOffset={5}
                  >
                    <DropdownMenuItem
                      onSelect={() => handleReport('post', displayPost.id)}
                      className="text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Report Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {displayPost.title && (
                <p className="mt-3 text-white/90 text-sm">
                  {displayPost.title}
                </p>
              )}
            </div>

            {/* Comments section */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4 p-4">
                {localComments.map((comment) => (
                  <div
                    key={`${comment.id}-${comment.author}`}
                    className="group"
                  >
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-800 shrink-0">
                        {/* Comment avatar could go here */}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-white/90 text-sm font-medium hover:text-blue-400 transition-colors cursor-pointer"
                              onClick={() => handleAddressClick(comment.author)}
                            >
                              {trimUsername(comment.author)}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild={true}>
                              <button
                                type="button"
                                className="p-1 text-gray-400 hover:text-white transition-colors"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              className="bg-gray-900 border-white/10"
                              sideOffset={5}
                            >
                              <DropdownMenuItem
                                onSelect={() =>
                                  handleReport('comment', comment.id)
                                }
                                className="text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
                              >
                                <Flag className="w-4 h-4 mr-2" />
                                Report Comment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-white/75 text-sm mt-1">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mt-2 ml-11">
                      <button
                        type="button"
                        onClick={() =>
                          handleCommentVote(comment.id, comment.votes)
                        }
                        disabled={isCommentVoting}
                        className={cn(
                          'text-gray-400 hover:text-white text-xs flex items-center gap-1.5',
                          votedComments.has(comment.id) && 'text-white',
                        )}
                      >
                        <Heart
                          className={cn(
                            'w-3.5 h-3.5 transition-colors',
                            votedComments.has(comment.id) &&
                              'fill-white stroke-white',
                          )}
                        />
                        <span
                          className={cn(
                            votedComments.has(comment.id) && 'text-white',
                          )}
                        >
                          {comment.votes}
                        </span>
                      </button>
                      <div className="text-gray-400 text-xs flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>0</span>
                      </div>
                      <div className="text-gray-400 text-xs flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5" />
                        <span>0</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action bar */}
            <div className="border-t border-white/5 p-4">
              <div className="flex items-center gap-6 mb-4">
                <button
                  type="button"
                  onClick={handleVoteClick}
                  disabled={isVoting}
                  className={cn(
                    'text-gray-400 hover:text-white transition-colors flex items-center gap-1.5',
                    hasVoted && 'text-white',
                  )}
                >
                  <Heart
                    className={cn(
                      'w-6 h-6 transition-colors',
                      hasVoted && 'fill-white stroke-white',
                    )}
                  />
                  <span className={cn('text-sm', hasVoted && 'text-white')}>
                    {displayPost.votes}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleCommentCounterClick}
                  className="comment-counter flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-sm">{localComments.length}</span>
                </button>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Star className="w-6 h-6" />
                  <span className="text-sm">0</span>
                </div>
                <button
                  type="button"
                  className="text-gray-400 hover:text-white transition-colors ml-auto"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>

              {/* Comment input - now conditionally rendered */}
              <div
                className={cn(
                  'transform transition-all duration-200 ease-in-out',
                  isCommentInputVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-4 pointer-events-none h-0',
                )}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitComment(e);
                    setIsCommentInputVisible(false);
                  }}
                  className="flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
                    autoFocus={isCommentInputVisible}
                  />
                  <button
                    type="submit"
                    className={cn(
                      'text-sm font-medium',
                      newComment.trim()
                        ? 'text-blue-400 hover:text-blue-300'
                        : 'text-gray-400',
                    )}
                    disabled={!newComment.trim()}
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
