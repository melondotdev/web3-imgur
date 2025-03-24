import { solanaAddressSchema } from '@/lib/utils/validators';
// import { suiAddressSchema } from '@/lib/validators/sui-address';
import { z } from 'zod';
// Schema for the create post request
export const createCommentSchema = z.object({
  username: solanaAddressSchema,
  text: z.string().min(1, 'Comment text is required'),
  signature: z.string().min(1, 'Signature is required'),
  message: z.string().min(1, 'Message is required'),
});

// Infer the type from the schema
export type CreateCommentRequest = z.infer<typeof createCommentSchema>;

// Helper function to validate the request
export function validateCreateCommentRequest(
  data: unknown,
): CreateCommentRequest {
  return createCommentSchema.parse(data);
}
