import { z } from 'zod';

export const createCommentFormSchema = z.object({
  id: z.string().optional(),
  postId: z.string().optional(),
  author: z.string().optional(),
  createdAt: z.string().optional(),
  votes: z.number().optional(),
  comment: z.string().optional(),
});

export type CreateCommentForm = z.infer<typeof createCommentFormSchema>;
