import { solanaAddressSchema } from '@/lib/utils/validators';
import { z } from 'zod';

export const voteRequestSchema = z.object({
  username: solanaAddressSchema,
  postId: z.string().min(1, 'Post ID is required'),
  signature: z.string().min(1, 'Signature is required'),
  message: z.string().min(1, 'Message is required'),
});

export type VoteRequest = z.infer<typeof voteRequestSchema>;

export function validateVoteRequest(data: unknown): VoteRequest {
  return voteRequestSchema.parse(data);
}
