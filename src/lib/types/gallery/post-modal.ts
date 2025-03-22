import type { Comment, Post } from '@/lib/types/post';
import type { WalletContextState } from '@solana/wallet-adapter-react';

export interface PostModalProps {
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

export interface CommentsSectionProps {
  localComments: Comment[];
  handleAddressClick: (address: string) => void;
  handleCommentVote: (commentId: string, currentVotes: number) => Promise<void>;
  votedComments: Set<string>;
  handleReport: (type: 'post' | 'comment', id: string) => void;
  isCommentVoting: boolean;
}

export interface ActionBarProps {
  handleVoteClick: (e?: React.MouseEvent) => Promise<void>;
  isVoting: boolean;
  hasVoted: boolean;
  displayPost: Post;
  localComments: Comment[];
  onCommentSubmit: (e: React.FormEvent) => Promise<void>;
  isCommentInputVisible: boolean;
  onCommentCounterClick: () => void;
  newComment: string;
  onCommentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
