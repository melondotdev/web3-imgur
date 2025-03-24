// import { suiAddressSchema } from '@/lib/validators/sui-address';
import { solanaAddressSchema } from '@/lib/utils/validators';
import { z } from 'zod';
import {
  ACCEPTED_IMAGE_TYPES,
  type AcceptedImageType,
  MAX_FILE_SIZE,
} from '../upload';

// Schema for the create post request
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be less than 500 characters'),
  username: solanaAddressSchema,
  image: z
    .instanceof(File, { message: 'Image is required' })
    .refine((file) => file.size <= MAX_FILE_SIZE, 'Max file size is 10MB')
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type as AcceptedImageType),
      'Only .jpg, .jpeg, .png, .webp and .gif formats are supported',
    ),
  tags: z.array(z.string()).optional(),
  signature: z.string().min(1, 'Signature is required').optional(),
  message: z.string().min(1, 'Message is required').optional(),
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
    signature: formData.get('signature') || undefined,
    message: formData.get('message') || undefined,
  };

  return createPostSchema.parse(data);
}
