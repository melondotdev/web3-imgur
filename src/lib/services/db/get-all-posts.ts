import { supabasePublicClient } from '@/lib/config/supabase';
import { mapDbPostsToPosts } from '@/lib/mappers/post-mapper';
import type { DbPost } from '@/lib/types/db/post';
import type { Post } from '@/lib/types/post';
import { getAllPostTags } from './post-tags-service';

export async function getAllPosts(): Promise<Post[]> {
  // Get all posts
  const { data: posts, error: postsError } = await supabasePublicClient()
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

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
  onError?: (error: Error) => void,
) {
  const subscription = supabasePublicClient()
    .channel('posts_channel')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all changes
        schema: 'public',
        table: 'posts',
      },
      async () => {
        // Fetch fresh data when changes occur
        try {
          const posts = await getAllPosts();
          callback(posts);
        } catch (error) {
          onError?.(
            error instanceof Error ? error : new Error('Unknown error'),
          );
        }
      },
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}
