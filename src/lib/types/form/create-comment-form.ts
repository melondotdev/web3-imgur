import { z } from 'zod';

export const createPostFormSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  image: z
    .instanceof(File, { message: 'Image is required' })
    .refine((file) => file.size <= 10 * 1024 * 1024, 'Max file size is 10MB')
    .refine(
      (file) =>
        ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(
          file.type,
        ),
      'Only .jpg, .jpeg, .png, .webp and .gif formats are supported',
    ),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  votes: z.number().optional()
});

export type CreatePostForm = z.infer<typeof createPostFormSchema>;
