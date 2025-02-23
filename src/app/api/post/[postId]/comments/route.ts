// app/api/posts/[postId]/comments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseClient } from '@/lib/web2-database/supabase';

// Define a schema for the incoming comment data.
const commentSchema = z.object({
  comment: z.string().min(1, 'Comment cannot be empty'),
  author: z.string().min(1, 'Author is required'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    // Extract the postId from the URL.
    const { postId } = params;

    // Parse the form data.
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // Validate the comment data.
    const validatedData = commentSchema.parse(data);
    const createdAt = new Date().toISOString();

    const supabase = supabaseClient();

    // Insert comment data into the "comments" table.
    // Ensure that your "comments" table has a column to reference the post id (e.g., post_id).
    const { data: commentData, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId, // Link the comment to the post.
        content: validatedData.comment,
        author: validatedData.author,
        created_at: createdAt,
        votes: 0,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Supabase comment insertion error:', error);
      return NextResponse.json(
        { error: 'Failed to insert comment into database' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Comment created successfully',
        data: commentData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    // Handle validation errors.
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

// Optionally add configuration for the route.
export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '10mb',
  },
};
