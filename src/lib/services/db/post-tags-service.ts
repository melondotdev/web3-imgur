import { supabaseAdmin } from '@/lib/config/supabase-admin';
import type { DbPostTag } from '@/lib/types/db/post';

type CreatePostTagParams = {
  postId: string;
  tagId: string;
};

export async function createPostTag(
  params: CreatePostTagParams,
): Promise<DbPostTag> {
  const { data, error } = await supabaseAdmin
    .from('post_tags')
    .insert({
      post_id: params.postId,
      tag_id: params.tagId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create post tag: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to create post tag: No data returned');
  }

  return data as DbPostTag;
}

export async function createPostTags(
  postId: string,
  tagIds: string[],
): Promise<DbPostTag[]> {
  const postTags: DbPostTag[] = [];

  for (const tagId of tagIds) {
    const postTag = await createPostTag({ postId, tagId });
    postTags.push(postTag);
  }

  return postTags;
}

export async function getPostTags(postId: string): Promise<DbPostTag[]> {
  const { data, error } = await supabaseAdmin
    .from('post_tags')
    .select('*')
    .eq('post_id', postId);

  if (error) {
    throw new Error(`Failed to fetch post tags: ${error.message}`);
  }

  return data as DbPostTag[];
}

export async function deletePostTags(postId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('post_tags')
    .delete()
    .eq('post_id', postId);

  if (error) {
    throw new Error(`Failed to delete post tags: ${error.message}`);
  }
}
