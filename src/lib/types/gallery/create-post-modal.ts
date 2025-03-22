import type { CreatePostForm } from '@/lib/types/form/create-post-form';
import type { Post } from '@/lib/types/post';
import type { Tag } from 'react-tag-input';

export interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  onPostCreated?: (newPost: Post) => void;
}

export interface UseCreatePostReturn {
  preview: string;
  tags: Tag[];
  handleDelete: (index: number) => void;
  handleAddition: (tag: Tag) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onSubmit: (data: CreatePostForm) => Promise<void>;
}
