import { supabasePublicClient } from '@/lib/config/supabase';
import { useWallet } from '@solana/wallet-adapter-react';
import type { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { useSession } from 'next-auth/react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface UserProfile {
  publicKey: PublicKey | null;
  username?: string;
  avatar?: string;
  twitter_handle?: string;
  // Add other profile fields as needed
}

interface UserProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined,
);

export function UserProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { publicKey, connected, signMessage } = useWallet();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get the public client instance - this is safe to use on the client side
  const supabase = supabasePublicClient();

  const loadProfile = useCallback(
    async (publicKey: PublicKey) => {
      setIsLoading(true);
      try {
        // Load the latest profile data
        const { data: user, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', publicKey.toString())
          .single();

        if (fetchError) {
          throw fetchError;
        }

        setProfile({
          publicKey,
          username: user.username,
          avatar: user.avatar_url,
          twitter_handle: user.twitter_handle,
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError(
          err instanceof Error ? err : new Error('Failed to load profile'),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [supabase],
  );

  const signIn = useCallback(async () => {
    if (!publicKey || !signMessage) {
      return;
    }

    try {
      setIsLoading(true);
      // Create message to sign
      const message = `Sign in to our app: ${new Date().toISOString()}`;
      const encodedMessage = new TextEncoder().encode(message);

      // Request signature from wallet
      const signature = await signMessage(encodedMessage);

      // Send to our API
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey: publicKey.toString(),
          signature: bs58.encode(signature),
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      // Check if user exists, if not create them
      const { data: existingUser } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('wallet_address', publicKey.toString())
        .single();

      if (!existingUser) {
        const { error: createError } = await supabase.from('users').insert({
          wallet_address: publicKey.toString(),
          username: publicKey.toString(), // Use wallet address as initial username
        });

        if (createError) {
          console.error('Error creating new user:', createError);
          throw new Error('Failed to create user profile');
        }
      }

      // Load profile after successful auth and user creation
      await loadProfile(publicKey);
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign in'));
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, signMessage, loadProfile, supabase]);

  const signOut = useCallback(async () => {
    setProfile(null);
    setError(null);
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!profile?.publicKey) return;

      setIsLoading(true);
      try {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            username: updates.username,
            avatar_url: updates.avatar,
            twitter_handle: updates.twitter_handle,
          })
          .eq('wallet_address', profile.publicKey.toString());

        if (updateError) {
          throw updateError;
        }

        setProfile({ ...profile, ...updates });
      } catch (err) {
        console.error('Update profile error:', err);
        setError(
          err instanceof Error ? err : new Error('Failed to update profile'),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [profile, supabase],
  );

  // Handle wallet connection/disconnection and Twitter session
  useEffect(() => {
    if (!connected || !publicKey) {
      signOut();
      return;
    }

    const updateProfileWithTwitter = async () => {
      try {
        if (session?.user) {
          const { error: updateError } = await supabase
            .from('users')
            .update({
              twitter_handle: session.user.name,
              avatar_url: session.user.image,
              username: session.user.name,
            })
            .eq('wallet_address', publicKey.toString());

          console.log('updated user in db');

          if (updateError) {
            // If update fails because user doesn't exist, create new record
            if (updateError.code === 'PGRST116') {
              const { error: insertError } = await supabase
                .from('users')
                .insert({
                  wallet_address: publicKey.toString(),
                  twitter_handle: session.user.name,
                  avatar_url: session.user.image,
                  username: session.user.name,
                });

              if (insertError) {
                console.error(
                  'Error creating new user with Twitter data:',
                  insertError,
                );
              }
            } else {
              console.error(
                'Error updating user with Twitter data:',
                updateError,
              );
            }
          }
          // Only reload profile if we successfully updated Twitter data
          await loadProfile(publicKey);
        }
      } catch (err) {
        console.error('Error updating profile with Twitter data:', err);
      }
    };

    // Initial profile load or sign in when wallet connects
    const initializeProfile = async () => {
      if (!profile?.publicKey) {
        try {
          // Check if user exists first
          const { data: existingUser } = await supabase
            .from('users')
            .select('wallet_address')
            .eq('wallet_address', publicKey.toString())
            .single();

          if (existingUser) {
            // If user exists, load their profile
            await loadProfile(publicKey);
          } else {
            // If no user exists, trigger sign in flow which will create the user
            await signIn();
          }
        } catch (err) {
          // If error is no user found, trigger sign in
          if (
            typeof err === 'object' &&
            err &&
            'code' in err &&
            err.code === 'PGRST116'
          ) {
            await signIn();
          } else {
            console.error('Error initializing profile:', err);
          }
        }
      } else if (
        session?.user &&
        profile.publicKey.toString() === publicKey.toString()
      ) {
        // Only update Twitter data if the profile matches current wallet
        await updateProfileWithTwitter();
      }
    };

    initializeProfile();
  }, [
    connected,
    publicKey,
    session,
    profile?.publicKey,
    loadProfile,
    signIn,
    supabase,
  ]);

  return (
    <UserProfileContext.Provider
      value={{ profile, isLoading, error, updateProfile, signIn, signOut }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};
