import { getEnv } from '@/lib/config/env';
import { createClient } from '@supabase/supabase-js';
import type { UseFormSetValue, UseFormResetField } from 'react-hook-form';

export function supabaseClient() {
  const env = getEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
}

import { toast } from 'react-hot-toast';
import { type CreatePostForm } from '@/lib/types/form/create-post-form';
import { type Tag } from '@/types';

/**
 * Handles the creation of a new post.
 */
/**
 * Handles the creation of a new post and its comment.
 */
export async function handleCreatePost(
  account: { address: string } | null,
  data: CreatePostForm,
  tags: Tag[],
  reset: () => void,
  setPreview: (value: string) => void,
  setTags: (value: Tag[]) => void,
  onClose: () => void,
) {
  if (!account) {
    return;
  }

  try {
    const supabase = supabaseClient();

    // Insert post data into the "posts" table (without comment)
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({
        title: data.title,
        username: account.address,
        image_url: data.image, // Assuming your createPost service already handles image upload and returns URL
        tags: tags.map((tag) => tag.text),
        created_at: new Date().toISOString(),
        votes: 0,
      })
      .select('*')
      .single();

    if (postError) {
      console.error('Supabase post insertion error:', postError);
      throw new Error('Failed to insert post into database');
    }

    // If a comment was provided, insert it into the "comments" table
    // Assume data.comments is an array; if multiple comments aren't supported, use the first element.
    if (data.comments && data.comments.length > 0) {
      const commentContent = data.comments[0]; // use the first comment
      const { error: commentError } = await supabase
        .from('comments')
        .insert({
          post_id: postData.id,
          author: account.address,
          content: commentContent,
          created_at: new Date().toISOString(),
        });

      if (commentError) {
        console.error('Supabase comment insertion error:', commentError);
        throw new Error('Failed to insert comment into database');
      }
    }

    toast.success('Post created successfully!');
    reset();
    setPreview('');
    setTags([]);
    onClose();
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : 'Failed to create post',
    );
  }
}

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


/**
 * Tag helpers for react-tag-input.
 */
export function deleteTag(tags: Tag[], index: number): Tag[] {
  return tags.filter((_, i) => i !== index);
}

export function addTag(tags: Tag[], tag: Tag): Tag[] {
  return [...tags, tag];
}

export function dragTag(tags: Tag[], tag: Tag, currPos: number, newPos: number): Tag[] {
  const newTags = [...tags];
  newTags.splice(currPos, 1);
  newTags.splice(newPos, 0, tag);
  return newTags;
}