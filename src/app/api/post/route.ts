import { uploadImageUsingTus } from '@/lib/tusky-database/tusky';
import { validateCreatePostRequest } from '@/lib/types/request/create-post-request';
import type { ApiError } from '@/lib/types/response/api-response';
import type {
  CreatePostResponse,
  Post,
} from '@/lib/types/response/create-post-response';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { supabaseClient } from '@/lib/web2-database/supabase';

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

    // Build the post object (note: comments will be inserted separately)
    const post: Post = {
      id: validatedData.id || crypto.randomUUID(), // Provide default UUID if id is undefined
      title: validatedData.title,
      username: validatedData.username,
      imageUrl,
      tags: validatedData.tags || [],
      createdAt: new Date().toISOString(),
      votes: 0,
      comments: validatedData.comments, // will use for separate comment insertion
    };

    const supabase = supabaseClient();

    // 1. Insert post data (without comments) into the "posts" table
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({
        title: post.title,
        username: post.username,
        image_url: post.imageUrl,
        tags: post.tags, // Assuming your column is of type array or JSON
        created_at: post.createdAt,
        votes: post.votes,
      })
      .select('*')
      .single();

    if (postError) {
      console.error('Supabase post insertion error:', postError);
      return NextResponse.json(
        { error: 'Failed to insert post into database' } as ApiError,
        { status: 500 }
      );
    }

    // 2. If a comment exists, insert it into the "comments" table
    if (post.comments && post.comments.length > 0) {
      const commentContent = post.comments[0]; // Use the first comment if available
      const { error: commentError } = await supabase
        .from('comments')
        .insert({
          post_id: postData.id,
          author: post.username,
          content: commentContent,
          created_at: new Date().toISOString(),
        });
      if (commentError) {
        console.error('Supabase comment insertion error:', commentError);
        return NextResponse.json(
          { error: 'Failed to insert comment into database' } as ApiError,
          { status: 500 }
        );
      }
    }
    
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

    return NextResponse.json(
      { error: 'Failed to create post' } as ApiError,
      { status: 500 }
    );
  }
}

// Optional: Add size limit to the route
export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
    sizeLimit: '10mb', // Adjust as needed
  },
};
