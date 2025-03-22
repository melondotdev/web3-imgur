import { Modal } from '@/components/base/Modal';
import { useCreatePost } from '@/lib/hooks/create-post/use-create-post';
import type { CreatePostModalProps } from '@/lib/types/gallery/create-post-modal';
import { Upload, X } from 'lucide-react';
import { WithContext as ReactTags, SEPARATORS } from 'react-tag-input';

export function CreatePostModal({
  isOpen,
  onClose,
  walletAddress,
  onPostCreated,
}: CreatePostModalProps) {
  const {
    preview,
    tags,
    handleDelete,
    handleAddition,
    onImageChange,
    onRemoveImage,
    onSubmit,
    register,
    errors,
    isSubmitting,
  } = useCreatePost(walletAddress, onClose, onPostCreated);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={onSubmit} className="mx-auto p-6 w-full max-w-2xl">
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

          <div>
            <label htmlFor="tags-input" className="block text-yellow-500 mb-2">
              add tags (optional)
            </label>
            <ReactTags
              id="tags-input"
              tags={tags}
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
