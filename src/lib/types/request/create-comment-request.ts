import { z } from 'zod';

// SUI address regex pattern: 0x followed by exactly 64 hex characters
const SUI_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{64}$/;

// Schema for the create post request
export const createCommentSchema = z.object({
  comment: z
    .string()
    .min(1, 'Comment is required')
    .max(100, 'Comment must be less than 100 characters'),
  username: z
    .string()
    .regex(
      SUI_ADDRESS_PATTERN,
      'Invalid SUI address format. Must be 0x followed by 64 hexadecimal characters',
    ),
});

// Infer the type from the schema
export type CreateCommentRequest = z.infer<typeof createCommentSchema>;

// Helper function to validate the request
export function validateCreateCommentRequest(
  formData: FormData,
): CreateCommentRequest {
  const data = {
    title: formData.get('title'),
    username: formData.get('username'),
    image: formData.get('image'),
    tags: formData.getAll('tags')
  };
  
  return createCommentSchema.parse(data);
}
