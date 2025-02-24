import { z } from 'zod';

export const commentSchema = z.object({
  id: z.string(),
  author: z.string(),
  content: z.string(),
  createdAt: z.string().datetime(),
  votes: z.number(),
});

export const postSchema = z.object({
  id: z.string(),
  username: z.string(),
  title: z.string(),
  createdAt: z.string().datetime(),
  imageUrl: z.string().url(),
  tags: z.array(z.string()),
  votes: z.number(),
});

export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Comment = z.infer<typeof commentSchema>;
export type Post = z.infer<typeof postSchema>;
export type Tag = z.infer<typeof tagSchema>;
