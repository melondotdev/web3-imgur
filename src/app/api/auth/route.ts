import { supabaseClient } from '@/lib/config/supabase';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { type NextRequest, NextResponse } from 'next/server';
import nacl from 'tweetnacl';
import { z } from 'zod';

// Validation schema for the auth request
const AuthRequestSchema = z.object({
  publicKey: z.string(),
  signature: z.string(),
  message: z.string(),
  username: z.string().optional(),
});

type AuthRequest = z.infer<typeof AuthRequestSchema>;

export async function POST(request: NextRequest) {
  try {
    const body: AuthRequest = await request.json();
    const validated = AuthRequestSchema.parse(body);

    // Verify the signature
    const message = new TextEncoder().encode(validated.message);
    const signatureBytes = bs58.decode(validated.signature);
    const publicKey = new PublicKey(validated.publicKey);

    // Verify using tweetnacl
    const verified = nacl.sign.detached.verify(
      message,
      signatureBytes,
      publicKey.toBytes(),
    );

    if (!verified) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const supabase = supabaseClient();
    if (!supabase) {
      throw new Error(
        'Server-side Supabase client is required for authentication',
      );
    }

    console.log('Checking if user exists for wallet:', validated.publicKey);

    // Check if user exists - using service role client
    let { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', validated.publicKey)
      .single();

    console.log('User fetch result:', { user, error: fetchError });

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      console.error('Error fetching user:', fetchError);
      throw fetchError;
    }

    const timestamp = new Date().toISOString();

    if (user) {
      console.log('Updating existing user');
      // Update last login time - using service role client
      const { error: updateError } = await supabase
        .from('users')
        .update({ last_login: timestamp })
        .eq('wallet_address', validated.publicKey);

      if (updateError) {
        console.error('Error updating user:', updateError);
        throw updateError;
      }
    } else {
      console.log('Creating new user');
      // Create new user if doesn't exist - using service role client
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            wallet_address: validated.publicKey,
            username:
              validated.username || `user_${validated.publicKey.slice(0, 6)}`,
            last_login: timestamp,
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }

      user = newUser;
    }

    // Return the user data without Supabase Auth
    return NextResponse.json(
      {
        message: 'Authentication successful',
        data: {
          user: {
            id: user.id,
            walletAddress: user.wallet_address,
            username: user.username,
          },
          // Include the verified signature as proof of wallet ownership
          token: validated.signature,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Auth error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 },
    );
  }
}
