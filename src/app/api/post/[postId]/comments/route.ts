// app/api/posts/[postId]/comments/route.ts

import { createComment } from '@/lib/services/db/comment-service';
import { validateCreateCommentRequest } from '@/lib/types/request/create-comment-request';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const body = await request.json();
    console.log('Request body:', body); // Debug log
    
    // Use our existing validation
    const validatedData = validateCreateCommentRequest(body);

    // Create comment using the service
    const commentData = await createComment({
      postId,
      author: validatedData.username,
      content: validatedData.text,
    });
    
    console.log('DB Comment data:', commentData); // Debug log

    const response = {
      comment: {
        id: commentData.id,
        author: commentData.author,
        content: commentData.content,
        created_at: commentData.created_at, // Note: using snake_case as per DB
        votes: commentData.votes || 0,
      }
    };

    console.log('Response data:', response); // Debug log
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}