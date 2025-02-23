import { getEnv } from '@/lib/config/env';
import { createPost } from '@/lib/services/db/post-service';
import { uploadImage } from '@/lib/services/upload-image';
import { validateCreatePostRequest } from '@/lib/types/request/create-post-request';
import type { ApiError } from '@/lib/types/response/api-response';
import type { CreatePostResponse } from '@/lib/types/response/create-post-response';
import { type NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const env = getEnv();
    const formData = await request.formData();
    const validatedData = validateCreatePostRequest(formData);

    const file = validatedData.image;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload image to Tusky
    const imageUrl = await uploadImage({
      buffer,
      filename: file.name,
      mimetype: file.type,
      size: file.size,
    });

    // Extract image ID from URL
    const imageId = imageUrl
      .split('files/')[1] // Get everything after 'files/'
      .split('/data')[0]; // Remove '/data' from the end

    if (!imageId) {
      throw new Error('Failed to extract image ID from URL');
    }

    // Create post in database
    const post = await createPost({
      author: validatedData.username,
      title: validatedData.title,
      imageId,
      vaultId: env.TUSKY_VAULT_ID,
      tags: validatedData.tags || [],
    });

    const response: CreatePostResponse = {
      message: 'Post created successfully',
      data: {
        id: post.id,
        username: post.username,
        title: post.title,
        createdAt: post.created_at,
        imageUrl,
        tags: [],
        votes: 0,
      },
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

    return NextResponse.json({ error: error } as ApiError, {
      status: 500,
    });
  }
}

// Optional: Add size limit to the route.
export const config = {
  api: {
    bodyParser: false, // Disable default body parser to handle FormData.
    sizeLimit: '10mb', // Adjust as needed.
  },
};
