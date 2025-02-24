import { solanaAddressSchema } from '@/lib/utils/validators';
// import { suiAddressSchema } from '@/lib/validators/sui-address';
import { z } from 'zod';
// Schema for the create post request
export const createCommentSchema = z.object({
  text: z
    .string()
    .min(1, 'Comment is required')
    .max(100, 'Comment must be less than 100 characters'),
  username: solanaAddressSchema,
});

// Infer the type from the schema
export type CreateCommentRequest = z.infer<typeof createCommentSchema>;

// Helper function to validate the request
export function validateCreateCommentRequest(
  data: any
): CreateCommentRequest {
  console.log(data);
  return createCommentSchema.parse({
    text: data.content,
    username: data.author,
  });
}