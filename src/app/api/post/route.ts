import { uploadImageUsingTus } from '@/lib/tusky-database/tusky';
import { validateCreatePostRequest } from '@/lib/types/request/create-post-request';
import type { ApiError } from '@/lib/types/response/api-response';
import type {
  CreatePostResponse,
  Post,
} from '@/lib/types/response/create-post-response';
import { type NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const validatedData = validateCreatePostRequest(formData);

    // Get the file data
    const file = formData.get('image') as File;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload image to Tusky with buffer
    const imageUrl = await uploadImageUsingTus({
      buffer,
      filename: file.name,
      mimetype: file.type,
      size: file.size,
    });

    const post: Post = {
      title: validatedData.title,
      comment: validatedData.comment,
      username: validatedData.username,
      imageUrl,
    };

    const response: CreatePostResponse = {
      message: 'Post created successfully',
      data: post,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);

    if (error instanceof ZodError) {
      const apiError: ApiError = {
        error: 'Validation failed',
        details: error.errors,
      };
      return NextResponse.json(apiError, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to create post' } as ApiError, {
      status: 500,
    });
  }
}

// Optional: Add size limit to the route
export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
    sizeLimit: '10mb', // Adjust as needed
  },
};
