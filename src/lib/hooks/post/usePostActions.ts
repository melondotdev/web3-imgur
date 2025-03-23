import { toast } from 'sonner';

interface UsePostActionsProps {
  onVoteClick: (postId: string, votes: number) => Promise<void>;
}

export function usePostActions({ onVoteClick }: UsePostActionsProps) {
  const handleVoteClick = async (
    postId: string,
    votes: number,
    e?: React.MouseEvent,
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      await onVoteClick(postId, votes);
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to update vote');
    }
  };

  const handleReport = (type: 'post' | 'comment', id: string) => {
    toast.success(`${type} reported. id ${id}`);
  };

  const handleAddressClick = (address: string) => {
    window.open(`https://solscan.io/account/${address}`, '_blank');
  };

  return {
    handleVoteClick,
    handleReport,
    handleAddressClick,
  };
}
