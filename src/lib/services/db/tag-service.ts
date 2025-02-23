import { supabaseClient, supabasePublicClient } from '@/lib/config/supabase';
import type { DbTag } from '@/lib/types/db/post';

export async function getAllTags(): Promise<Record<string, DbTag>> {
  const { data, error } = await supabasePublicClient().from('tags').select('*');

  if (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }

  // Convert array to record for easier lookup
  return data.reduce(
    (acc, tag) => {
      acc[tag.id] = tag;
      return acc;
    },
    {} as Record<string, DbTag>,
  );
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
