'use client';
import { Modal } from '@/components/base/Modal';
import {
  handleCreatePost,
  handleImageFileChange,
  removeImage,
  deleteTag,
  addTag,
  dragTag,
} from '@/lib/web2-database/supabase';
import {
  type CreatePostForm,
  createPostFormSchema,
} from '@/lib/types/form/create-post-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWallet } from '@suiet/wallet-kit';
import { Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { WithContext as ReactTags, SEPARATORS } from 'react-tag-input';
import type { Tag } from '@/types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [preview, setPreview] = useState('');
  const { account } = useWallet();
  const [tags, setTags] = useState<Tag[]>([]);

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
    await handleCreatePost(
      account ? { address: account.address } : null,
      data,
      tags,
      reset,
      setPreview,
      setTags,
      onClose
    );
  };

  // Handlers for file input and image removal
  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Call both the react-hook-form onChange and our custom handler.
    register('image').onChange(e);
    handleImageFileChange(e, setValue, setPreview);
  };

  const onRemoveImage = () => {
    removeImage(resetField, setPreview);
  };

  // Handlers for react-tag-input
  const handleDelete = (index: number) => {
    setTags(deleteTag(tags, index));
  };

  const handleAddition = (tag: Tag) => {
    setTags(addTag(tags, tag));
  };

  const handleDrag = (tag: Tag, currPos: number, newPos: number) => {
    setTags(dragTag(tags, tag, currPos, newPos));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl p-6 w-full">
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
                onClick={onRemoveImage}
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
                  onChange={onImageChange}
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
            {...register('comments')}
          />
          {errors.comments && (
            <p className="text-red-500 text-sm">{errors.comments.message}</p>
          )}

          {/* React Tag Input */}
          <div>
            <label className="block text-yellow-500 mb-2">Add Tags (optional)</label>
            <ReactTags
              tags={tags.map((tag) => ({ ...tag, className: '' }))}
              suggestions={[]}
              separators={[SEPARATORS.ENTER, SEPARATORS.COMMA]}
              handleDelete={handleDelete}
              handleAddition={(tag) => handleAddition({ id: tag.id, text: tag.id })}
              handleDrag={(tag, currPos, newPos) => handleDrag({ id: tag.id, text: tag.id }, currPos, newPos)}
              placeholder="Type and press enter..."
              autoFocus={false}
              inputFieldPosition="bottom"
              allowUnique
              allowAdditionFromPaste
              editable
              clearAll={false}
            />
          </div>

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
