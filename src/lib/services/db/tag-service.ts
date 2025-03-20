import { supabaseClient, supabasePublicClient } from '@/lib/config/supabase';
import type { DbTag } from '@/lib/types/db/post';

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  // Get all tags with their counts in a single query
  const { data, error } = await supabasePublicClient()
    .from('tags')
    .select(`
      name,
      post_tags (count)
    `);

  if (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }

  // Transform the data into the required format
  return data
    .map((tag) => ({
      tag: tag.name,
      count: tag.post_tags?.length || 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function createPostTag(name: string): Promise<DbTag> {
  // First check if tag already exists
  const { data: existingTag } = await supabaseClient()
    .from('tags')
    .select('*')
    .eq('name', name)
    .single();

  if (existingTag) {
    return existingTag as DbTag;
  }

  // Create new tag if it doesn't exist
  const { data, error } = await supabaseClient()
    .from('tags')
    .insert({ name })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create tag: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to create tag: No data returned');
  }

  return data as DbTag;
}

export async function createTagsIfNotExist(
  tagNames: string[],
): Promise<DbTag[]> {
  const uniqueNames = Array.from(new Set(tagNames));
  const tags: DbTag[] = [];

  for (const name of uniqueNames) {
    const tag = await createPostTag(name);
    tags.push(tag);
  }

  return tags;
}
