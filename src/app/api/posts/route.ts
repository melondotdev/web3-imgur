import { createPost } from '@/lib/services/db/post-service';
import { createTagsIfNotExist } from '@/lib/services/db/tag-service';
import { uploadImage } from '@/lib/services/request/upload-image';
import { validateCreatePostRequest } from '@/lib/types/request/create-post-request';
import type { CreatePostResponse } from '@/lib/types/response/create-post-response';
import { etc, verify } from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { type NextRequest, NextResponse } from 'next/server';

// Configure SHA-512 for ed25519
etc.sha512Sync = (...m: Uint8Array[]) => sha512(Buffer.concat(m));

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const validatedData = validateCreatePostRequest(formData);

    // Verify signature if present
    if (validatedData.signature && validatedData.message) {
      const signature = bs58.decode(validatedData.signature);
      const message = new TextEncoder().encode(validatedData.message);
      const publicKey = new PublicKey(validatedData.username);

      try {
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
    } else {
      return NextResponse.json(
        { error: 'Signature and message are required' },
        { status: 400 },
      );
    }

    // Get the image from form data and treat it as a Blob
    const image = validatedData.image;

    // Safely access properties that exist in both Node.js and browser environments
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageProperties = {
      name: String(image.name || ''),
      type: String(image.type || 'application/octet-stream'),
      size: Number(image.size || 0),
    };

    // Upload image to Pinata
    const imageUrl = await uploadImage({
      buffer,
      filename: imageProperties.name,
      mimetype: imageProperties.type,
      size: imageProperties.size,
    });

    console.log('uploading to db');

    // Create post in database
    const post = await createPost({
      author: validatedData.username,
      title: validatedData.title,
      imageUrl: imageUrl,
      tags: validatedData.tags || [],
    });

    // Create tags and associate them with the post
    const tags = await createTagsIfNotExist(validatedData.tags || []);

    const response: CreatePostResponse = {
      message: 'Post created successfully',
      data: {
        id: post.id,
        username: post.username,
        title: post.title,
        createdAt: post.created_at,
        imageUrl,
        tags: tags.map((tag) => tag.name),
        votes: 0,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred while creating the post',
      },
      { status: 500 },
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
