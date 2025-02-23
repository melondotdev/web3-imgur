import type { Comment } from '@/lib/types/post';
import type { ApiResponse } from '@/lib/types/response/api-response';

export type CreateCommentResponse = ApiResponse<Comment>;
