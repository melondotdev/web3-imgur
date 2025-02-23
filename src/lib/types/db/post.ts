import { z } from 'zod';

export const dbPostSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  title: z.string(),
  created_at: z.string().datetime(),
  image_id: z.string(),
  vault_id: z.string(),
});

export const dbPostCommentSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  text: z.string(),
  post_id: z.string().uuid(),
  author: z.string(),
});

export const dbPostTagSchema = z.object({
  post_id: z.string().uuid(),
  tag_id: z.string().uuid(),
});

export const dbTagSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export type DbPost = z.infer<typeof dbPostSchema>;
export type DbPostComment = z.infer<typeof dbPostCommentSchema>;
export type DbPostTag = z.infer<typeof dbPostTagSchema>;
export type DbTag = z.infer<typeof dbTagSchema>;
