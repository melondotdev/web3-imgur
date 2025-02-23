import { supabasePublicClient } from '@/lib/config/supabase';
import { mapDbPostsToPosts } from '@/lib/mappers/post-mapper';
import type { DbPost } from '@/lib/types/db/post';
import type { Post } from '@/lib/types/post';
import { getAllPostTags } from './post-tags-service';

export type PostSortOption = 'newest' | 'most-voted';

const POSTS_PER_PAGE = 12; // This will show 3 rows on desktop (4 columns)

export async function getAllPosts(
  sortBy: PostSortOption = 'newest',
  page: number = 0
): Promise<Post[]> {
  // Get posts with pagination
  const query = supabasePublicClient()
    .from('posts')
    .select('*')
    .range(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE - 1);

  // Apply sorting based on parameter
  if (sortBy === 'newest') {
    query.order('created_at', { ascending: false });
  } else {
    query.order('votes', { ascending: false });
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

export function subscribeToAllPosts(
  callback: (posts: Post[]) => void,
  sortBy: PostSortOption,
  onError?: (error: Error) => void,
) {
  const subscription = supabasePublicClient()
    .channel('posts_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'posts',
      },
      async () => {
        try {
          const posts = await getAllPosts(sortBy);
          callback(posts);
        } catch (error) {
          onError?.(
            error instanceof Error ? error : new Error('Unknown error'),
          );
        }
      },
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}
