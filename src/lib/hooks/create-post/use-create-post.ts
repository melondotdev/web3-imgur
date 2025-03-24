import { createPost } from '@/lib/services/request/post-service';
import type { CreatePostForm } from '@/lib/types/form/create-post-form';
import type { Post } from '@/lib/types/post';
import { createPostSchema } from '@/lib/types/request/create-post-request';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Tag } from 'react-tag-input';
import { toast } from 'sonner';

export function useCreatePost(
  walletAddress: string,
  onClose: () => void,
  onPostCreated?: (newPost: Post) => void,
) {
  const [preview, setPreview] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const { signMessage } = useWallet();

  const {
    register,
    handleSubmit,
    setValue,
    resetField,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
  });

  const onSubmit = async (data: CreatePostForm) => {
    try {
      if (!signMessage) {
        toast.error('Wallet not connected', {
          description: 'Please connect your wallet to create a post',
        });
        return;
      }

      const file =
        data.image instanceof FileList ? data.image[0] : (data.image as File);

      // Create message to sign
      const message = `Create post: ${data.title} at ${new Date().toISOString()}`;
      const encodedMessage = new TextEncoder().encode(message);

      // Request signature from wallet
      let signature: Uint8Array;
      try {
        signature = await signMessage(encodedMessage);
      } catch {
        toast.error('Signature required', {
          description: 'Please sign the message to create your post',
        });
        return;
      }

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('username', data.username);
      formData.append('image', file);
      formData.append('tags', JSON.stringify(tags.map((tag) => tag.text)));
      formData.append('signature', bs58.encode(signature));
      formData.append('message', message);

      const newPost = await createPost(formData);

      if (onPostCreated) {
        onPostCreated(newPost);
      }

      reset();
      setPreview('');
      setTags([]);
      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      let errorMessage = 'An error occurred while creating the post';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error && 'error' in error) {
        errorMessage = String(error.error);
      }

      toast.error('Error creating post', {
        description: errorMessage,
      });
    }
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('image', file, { shouldValidate: true });
      setPreview(URL.createObjectURL(file));
    } else {
      setError('image', { message: 'Image is required' });
    }
  };

  const onRemoveImage = () => {
    resetField('image');
    setPreview('');
  };

  const handleDelete = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddition = (tag: Tag) => {
    setTags((prev) => [
      ...prev,
      { id: tag.text, text: tag.text, className: '' },
    ]);
  };

  useEffect(() => {
    console.log(
      'Setting tags:',
      tags.map((tag) => tag.text),
    );
    setValue(
      'tags',
      tags.map((tag) => tag.text),
      { shouldValidate: true },
    );
  }, [tags, setValue]);

  useEffect(() => {
    setValue('username', walletAddress);
  }, [walletAddress, setValue]);

  return {
    preview,
    tags,
    handleDelete,
    handleAddition,
    onImageChange,
    onRemoveImage,
    onSubmit: handleSubmit(onSubmit),
    register,
    errors,
    isSubmitting,
  };
}
