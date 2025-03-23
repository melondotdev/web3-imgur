import { supabaseClient, supabasePublicClient } from '@/lib/config/supabase';
import { createPostTags } from '@/lib/services/db/post-tags-service';
import { createTagsIfNotExist } from '@/lib/services/db/tag-service';
import type { DbPost } from '@/lib/types/db/post';

type CreatePostParams = {
  author: string;
  title: string;
  imageUrl: string;
  tags: string[];
};

export async function createPost(params: CreatePostParams): Promise<DbPost> {
  const supabase = supabaseClient();
  if (!supabase) {
    throw new Error(
      'Server-side Supabase client is required for post creation',
    );
  }

  // Start a Supabase transaction
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      username: params.author,
      title: params.title,
      image_id: params.imageUrl,
    })
    .select()
    .single();

  if (postError) {
    throw new Error(`Failed to create post: ${postError.message}`);
  }

  if (!post) {
    throw new Error('Failed to create post: No data returned');
  }

  const typedPost = post as DbPost;

  // Create or get existing tags
  if (params.tags.length > 0) {
    try {
      const tags = await createTagsIfNotExist(params.tags);

      // Link tags to the post
      await createPostTags(
        typedPost.id,
        tags.map((tag) => tag.id),
      );
    } catch (error) {
      // If tag creation fails, we should still return the post
      console.error('Failed to create tags:', error);
    }
  }

  return typedPost;
}

export async function getPostWithTags(postId: string): Promise<DbPost> {
  const { data, error } = await supabasePublicClient()
    .from('posts')
    .select(`
      *,
      post_tags (
        tags (
          id,
          name
        )
      )
    `)
    .eq('id', postId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch post: ${error.message}`);
  }

  if (!data) {
    throw new Error('Post not found');
  }

  return data as DbPost;
}
