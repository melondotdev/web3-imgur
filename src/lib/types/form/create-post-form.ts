import { z } from 'zod';

export const createPostFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  comment: z
    .string()
    .max(500, 'Comment must be less than 500 characters')
    .optional(),
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
});

export type CreatePostForm = z.infer<typeof createPostFormSchema>;
