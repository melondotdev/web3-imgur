import type { DbPost, DbPostComment, DbTag } from '@/lib/types/db/post';
import type { Comment, Post } from '@/lib/types/post';

export function mapDbPostToPost(
  dbPost: DbPost,
  dbComments: DbPostComment[],
  dbTags: DbTag[],
): Post {
  return {
    author: dbPost.author,
    comment: dbPost.comment,
    createdAt: dbPost.created_at,
    imageUrl: `https://api.tusky.io/files/${dbPost.image_id}/data`,
    tags: dbTags.map((tag) => tag.name),
    comments: dbComments.map(mapDbCommentToComment),
  };
}

export function mapDbCommentToComment(dbComment: DbPostComment): Comment {
  return {
    author: dbComment.author,
    text: dbComment.text,
    createdAt: dbComment.created_at,
  };
}

// Helper function to map multiple posts
export function mapDbPostsToPosts(
  dbPosts: DbPost[],
  dbComments: DbPostComment[],
  dbTags: Record<string, DbTag[]>,
): Post[] {
  return dbPosts.map((post) => {
    const postComments = dbComments.filter(
      (comment) => comment.post_id === post.id,
    );
    const postTags = dbTags[post.id] || [];
    return mapDbPostToPost(post, postComments, postTags);
  });
}
