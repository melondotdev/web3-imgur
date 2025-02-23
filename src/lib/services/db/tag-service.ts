import { supabaseAdmin } from '@/lib/config/supabase-admin';
import type { DbTag } from '@/lib/types/db/post';

export async function getAllTags(): Promise<DbTag[]> {
  const { data, error } = await supabaseAdmin
    .from('tags')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }

  return data as DbTag[];
}

export async function createTag(name: string): Promise<DbTag> {
  // First check if tag already exists
  const { data: existingTag } = await supabaseAdmin
    .from('tags')
    .select('*')
    .eq('name', name)
    .single();

  if (existingTag) {
    return existingTag as DbTag;
  }

  // Create new tag if it doesn't exist
  const { data, error } = await supabaseAdmin
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
  const uniqueNames = [...new Set(tagNames)];
  const tags: DbTag[] = [];

  for (const name of uniqueNames) {
    const tag = await createTag(name);
    tags.push(tag);
  }

  return tags;
}
