import { Modal } from '@/components/base/Modal';
import { createPost } from '@/lib/services/request/post-service';
import type { CreatePostForm } from '@/lib/types/form/create-post-form';
import type { Post } from '@/lib/types/post';
import { createPostSchema } from '@/lib/types/request/create-post-request';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  WithContext as ReactTags,
  SEPARATORS,
  type Tag,
} from 'react-tag-input';
import { toast } from 'sonner';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  onPostCreated?: (newPost: Post) => void;
}

export function CreatePostModal({
  isOpen,
  onClose,
  walletAddress,
  onPostCreated,
}: CreatePostModalProps) {
  const [preview, setPreview] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);

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
      const file =
        data.image instanceof FileList ? data.image[0] : (data.image as File);

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('username', data.username);
      formData.append('image', file);
      formData.append('tags', JSON.stringify(tags.map((tag) => tag.text)));

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
      toast.error('Error creating post', {
        description: error instanceof Error ? error.message : String(error),
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

  useEffect(() => {
    // For debugging
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
    if (isOpen) {
      setValue('username', walletAddress);
    }
  }, [walletAddress, setValue, isOpen]);

  const handleDelete = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddition = (tag: Tag) => {
    setTags((prev) => [
      ...prev,
      { id: tag.text, text: tag.text, className: '' },
    ]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto p-6 w-full max-w-2xl"
      >
        <h2 className="mb-6 text-xl text-yellow-500">create new post</h2>
        <div className="space-y-4">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="preview"
                className="h-64 rounded-lg object-cover w-full"
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
            placeholder="title"
            className="bg-gray-800 border border-yellow-500/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 px-3 placeholder-yellow-500/50 py-2 rounded-md text-yellow-500 w-full"
            {...register('title')}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}

          {/* React Tag Input */}
          <div>
            <label htmlFor="tags-input" className="block text-yellow-500 mb-2">
              add tags (optional)
            </label>
            <ReactTags
              id="tags-input"
              tags={tags}
              // TODO: Add suggestions
              suggestions={[]}
              allowDragDrop={false}
              separators={[SEPARATORS.ENTER, SEPARATORS.COMMA]}
              handleDelete={handleDelete}
              handleAddition={handleAddition}
              placeholder="type and press enter..."
              autoFocus={false}
              inputFieldPosition="bottom"
              allowUnique={true}
              allowAdditionFromPaste={true}
              editable={true}
              clearAll={false}
            />
            {errors.tags && (
              <p className="mt-2 text-red-500 text-sm">{errors.tags.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-50 flex hover:bg-yellow-500/30 items-center justify-center px-4 py-2 rounded-md space-x-2 text-yellow-500 w-full"
          >
            <Upload className="h-5 w-5" />
            <span>{isSubmitting ? 'sharing...' : 'share'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
