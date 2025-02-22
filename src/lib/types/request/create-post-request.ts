import { z } from 'zod';

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ACCEPTED_IMAGE_TYPES: readonly string[] = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

// SUI address regex pattern: 0x followed by exactly 64 hex characters
const SUI_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{64}$/;

// Schema for the create post request
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  username: z
    .string()
    .regex(
      SUI_ADDRESS_PATTERN,
      'Invalid SUI address format. Must be 0x followed by 64 hexadecimal characters',
    ),
  image: z
    .instanceof(File, { message: 'Image is required' })
    .refine((file) => file.size <= MAX_FILE_SIZE, 'Max file size is 10MB')
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png, .webp and .gif formats are supported',
    ),
  tags: z.array(z.string()).optional(),
});

// Infer the type from the schema
export type CreatePostRequest = z.infer<typeof createPostSchema>;

// Helper function to validate the request
export function validateCreatePostRequest(
  formData: FormData,
): CreatePostRequest {
  const data = {
    title: formData.get('title'),
    username: formData.get('username'),
    image: formData.get('image'),
    tags: formData.getAll('tags'),
  };
  
  return createPostSchema.parse(data);
}
