import type { UseFormSetValue, UseFormResetField } from 'react-hook-form';
import type { CreatePostForm } from '@/lib/types/form/create-post-form';

export function handleImageFileChange(
  e: React.ChangeEvent<HTMLInputElement>,
  setValue: UseFormSetValue<CreatePostForm>,
  setPreview: (url: string) => void,
) {
  const file = e.target.files?.[0];
  if (file) {
    // Here, "image" is a valid key of CreatePostForm
    setValue('image', file, { shouldValidate: true });
    setPreview(URL.createObjectURL(file));
  }
}

export function removeImage(
  resetField: UseFormResetField<CreatePostForm>,
  setPreview: (value: string) => void,
) {
  // Again, "image" is a valid key of CreatePostForm
  resetField('image');
  setPreview('');
}