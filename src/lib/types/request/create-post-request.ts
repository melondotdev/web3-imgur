import { suiAddressSchema } from '@/lib/validators/sui-address';
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

// Helper function to parse comma-separated tags
function parseTags(value: string): string[] {
  if (typeof value !== 'string') {
    return [];
  }
  const trimmed = value.trim();
  return trimmed
    ? trimmed.split(',').map((tag) => tag.trim().toLowerCase())
    : [];
}

// Schema for the create post request
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be less than 500 characters'),
  username: suiAddressSchema,
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
  const tagsValue = formData.get('tags');
  // Parse tags from FormData - it comes as a string that needs to be parsed as JSON
  const tags = tagsValue ? JSON.parse(tagsValue as string) : [];

  const data = {
    title: formData.get('title'),
    username: formData.get('username'),
    image: formData.get('image'),
    tags: tags,
  };

  return createPostSchema.parse(data);
}
