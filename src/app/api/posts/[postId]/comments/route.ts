import { createComment } from '@/lib/services/db/comment-service';
import { validateCreateCommentRequest } from '@/lib/types/request/create-comment-request';
import { etc, verify } from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { type NextRequest, NextResponse } from 'next/server';

// Configure SHA-512 for ed25519
etc.sha512Sync = (...m: Uint8Array[]) => sha512(Buffer.concat(m));

// Add segment configuration
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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

    // Verify signature
    try {
      const signature = bs58.decode(validatedData.signature);
      const message = new TextEncoder().encode(validatedData.message);
      const publicKey = new PublicKey(validatedData.username);

      const isValid = await verify(signature, message, publicKey.toBytes());
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 },
        );
      }
    } catch (error) {
      console.error('Signature verification error:', error);
      return NextResponse.json(
        { error: 'Failed to verify signature' },
        { status: 400 },
      );
    }

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
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 },
    );
  }
}
