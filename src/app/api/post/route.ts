import { uploadImageUsingTus } from '@/lib/tusky-database/tusky';
import { validateCreatePostRequest } from '@/lib/types/request/create-post-request';
import type { ApiError } from '@/lib/types/response/api-response';
import type { CreatePostResponse, Post } from '@/lib/types/response/create-post-response';
import type { Comment } from '@/lib/types/response/create-comment-response';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { supabaseClient } from '@/lib/web2-database/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const validatedData = validateCreatePostRequest(formData);
    
    // Get the file data.
    const file = formData.get('image') as File;
    if (!file) {
      return NextResponse.json(
        { error: 'Image file is required' } as ApiError,
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload image to Tusky.
    const imageUrl = await uploadImageUsingTus({
      buffer,
      filename: file.name,
      mimetype: file.type,
      size: file.size,
    });
    
    const createdAt = new Date().toISOString();

    // Build the post object.
    const post: Post = {
      title: validatedData.title,
      username: validatedData.username,
      imageUrl,
      tags: validatedData.tags || [],
      createdAt: createdAt,
      votes: 0,
    };
    
    const supabase = supabaseClient();

    // Insert post data into the "posts" table.
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({
        title: post.title,
        username: post.username,
        image_url: post.imageUrl,
        tags: post.tags,
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
    
    // Build the comment object.
    const comment: Comment = {
      content: validatedData.title,
      author: validatedData.username,
      createdAt: createdAt,
      votes: 0,
    };
    
    // Insert comment data into the "comments" table.
    const { data: commentData, error: commentError } = await supabase
      .from('comments')
      .insert({
        post_id: postData.id,
        content: comment.content,
        author: comment.author,
        created_at: comment.createdAt,
        votes: comment.votes,
      })
      .select('*')
      .single();

    if (commentError) {
      console.error('Supabase comment insertion error:', commentError);
      return NextResponse.json(
        { error: 'Failed to insert comment into database' } as ApiError,
        { status: 500 }
      );
    }
    
    const response: CreatePostResponse = {
      message: 'Post and comment created successfully' + JSON.stringify(postData, null, 2) + JSON.stringify(commentData, null, 2),
      data: commentData,
    };

    // TO-DO: Comments are handled separately in a one-to-many relationship.
    // For example, a separate API endpoint can handle inserting comments with a "post_id" column.
    
    // TO-DO: Tags are also handled in a many-to-many relationship.
    // For example, a separate API endpoint can handle inserting tags with an array of "post_ids" in a separate column.
    
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

// Optional: Add size limit to the route.
export const config = {
  api: {
    bodyParser: false, // Disable default body parser to handle FormData.
    sizeLimit: '10mb', // Adjust as needed.
  },
};
