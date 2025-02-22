import { z } from 'zod';

export const createCommentFormSchema = z.object({
  id: z.string().optional(),
  postId: z.string().optional(),
  username: z.string().optional(),
  createdAt: z.string().optional(),
  votes: z.number().optional(),
  comment: z.string().optional(),
});

export type CreatePostForm = z.infer<typeof createCommentFormSchema>;
