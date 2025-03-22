import type { DbPost, DbTag } from '@/lib/types/db/post';
import type { Post } from '@/lib/types/post';

export function mapDbPostToPost(dbPost: DbPost, dbTags: DbTag[]): Post {
  return {
    id: dbPost.id,
    username: dbPost.username,
    title: dbPost.title,
    createdAt: dbPost.created_at,
    imageUrl: dbPost.image_id,
    tags: dbTags.map((tag) => tag.name),
    votes: dbPost.votes,
    user: dbPost.user
      ? {
          username: dbPost.user.username,
          avatar_url: dbPost.user.avatar_url,
          twitter_handle: dbPost.user.twitter_handle,
        }
      : undefined,
  };
}

// Helper function to map multiple posts
export function mapDbPostsToPosts(
  dbPosts: DbPost[],
  dbTags: Record<string, DbTag[]>,
): Post[] {
  return dbPosts.map((post) => {
    const postTags = dbTags[post.id] || [];
    return mapDbPostToPost(post, postTags);
  });
}
