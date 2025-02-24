import { createComment } from '@/lib/services/db/comment-service';
import { validateCreateCommentRequest } from '@/lib/types/request/create-comment-request';
import { NextRequest, NextResponse } from 'next/server';

// Add segment configuration
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
) {
  console.log('Handler initialization');
  
  try {
    // Get postId from URL
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const postId = segments[segments.length - 2]; // Get postId from URL path
    
    console.log('URL:', url.toString());
    console.log('PostId from URL:', postId);
    
    const body = await request.json();
    
    const validatedData = validateCreateCommentRequest(body);

    const commentData = await createComment({
      postId,
      author: validatedData.username,
      content: validatedData.text,
    });

    const response = {
      comment: {
        id: commentData.id,
        author: commentData.author,
        content: commentData.content,
        created_at: commentData.created_at,
        votes: commentData.votes || 0,
      }
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}