import { supabasePublicClient } from '@/lib/config/supabase';
import { mapDbPostsToPosts } from '@/lib/mappers/post-mapper';
import type { DbPost } from '@/lib/types/db/post';
import type { Post } from '@/lib/types/post';
import { getAllPostTags } from './post-tags-service';

export type PostSortOption = 'newest' | 'most-voted';

const POSTS_PER_PAGE = 12; // This will show 3 rows on desktop (4 columns)

export async function getAllPosts(
  sortBy: PostSortOption = 'newest',
  page = 0,
  tag?: string,
): Promise<Post[]> {
  // Start with the base query
  let query = supabasePublicClient()
    .from('posts')
    .select(`
      *,
      user:users!username(
        username,
        avatar_url,
        twitter_handle
      )
    `);

  // If tag is provided, filter posts by tag
  if (tag) {
    query = supabasePublicClient()
      .from('posts')
      .select(`
        *,
        user:users!username(
          username,
          avatar_url,
          twitter_handle
        ),
        post_tags!inner(
          tags!inner(
            name
          )
        )
      `)
      .ilike('post_tags.tags.name', tag);
  }

  // Apply pagination
  query = query.range(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE - 1);

  // Apply sorting
  if (sortBy === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else {
    query = query.order('votes', { ascending: false });
  }

  const { data: posts, error: postsError } = await query;

  if (postsError) {
    throw new Error(`Failed to fetch posts: ${postsError.message}`);
  }

  // Get all post tags
  const postTags = await getAllPostTags();

  // Map DB posts to view model
  return mapDbPostsToPosts(posts as DbPost[], postTags);
}
