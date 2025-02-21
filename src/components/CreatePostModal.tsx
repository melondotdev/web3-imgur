'use client';
import { Modal } from '@/components/base/Modal';
import { createPost } from '@/lib/services/post-service';
import {
  type CreatePostForm,
  createPostFormSchema,
} from '@/lib/types/form/create-post-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWallet } from '@suiet/wallet-kit';
import { Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [preview, setPreview] = useState('');
  const { account } = useWallet();

  const {
    register,
    handleSubmit,
    setValue,
    resetField,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreatePostForm>({
    resolver: zodResolver(createPostFormSchema),
  });

  const onSubmit = async (data: CreatePostForm) => {
    if (!account) {
      return;
    }

    try {
      await createPost({
        ...data,
        username: account.address,
      });

      toast.success('Post created successfully!');
      reset();
      setPreview('');
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create post',
      );
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('image', file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    resetField('image');
    setPreview('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-2xl p-6 w-full"
      >
        <h2 className="mb-6 text-xl text-yellow-500">create new post</h2>
        <div className="space-y-4">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="preview"
                className="h-64 object-cover rounded-lg w-full"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute bg-gray-900/80 hover:text-yellow-400 p-1 right-2 rounded-full text-yellow-500 top-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-yellow-500/20 p-8 rounded-lg text-center">
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  {...register('image')}
                  onChange={(e) => {
                    register('image').onChange(e);
                    handleImageChange(e);
                  }}
                />
                <div className="space-y-2">
                  <Upload className="h-8 mx-auto text-yellow-500 w-8" />
                  <div className="text-yellow-500">upload image</div>
                </div>
              </label>
              {errors.image && (
                <p className="mt-2 text-red-500 text-sm">
                  {errors.image.message}
                </p>
              )}
            </div>
          )}

          <input
            type="text"
            placeholder="Add a title..."
            className="bg-gray-800 border border-yellow-500/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 px-3 placeholder-yellow-500/50 py-2 rounded-md text-yellow-500 w-full"
            {...register('title')}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}

          <textarea
            placeholder="Add a comment..."
            className="bg-gray-800 border border-yellow-500/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 px-3 placeholder-yellow-500/50 py-2 rounded-md text-yellow-500 w-full"
            rows={3}
            {...register('comment')}
          />
          {errors.comment && (
            <p className="text-red-500 text-sm">{errors.comment.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !account}
            className="bg-yellow-500/20 flex hover:bg-yellow-500/30 items-center justify-center px-4 py-2 rounded-md space-x-2 text-yellow-500 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="h-5 w-5" />
            <span>{isSubmitting ? 'Sharing...' : 'Share'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
