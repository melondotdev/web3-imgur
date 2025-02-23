import { getEnv } from '@/lib/config/env';
import { createClient } from '@supabase/supabase-js';

export function supabaseClient() {
  const env = getEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
}

export function supabasePublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export async function getComments(postId: string) {
  const supabase = supabasePublicClient();
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching comments:', error);
    throw new Error('Failed to fetch comments: ' + error.message);
  }
  
  return data;
}

// Function to fetch all posts.
export async function getPosts() {
  const supabase = supabaseClient();

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false }); // Latest posts first

  if (error) {
    console.error('Error fetching posts:', error);
    throw new Error('Failed to fetch posts: ' + error.message);
  }

  return data;
}