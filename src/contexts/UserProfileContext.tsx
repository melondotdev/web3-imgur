import { supabasePublicClient } from '@/lib/config/supabase';
import { useWallet } from '@solana/wallet-adapter-react';
import type { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { createContext, useContext, useEffect, useState } from 'react';

interface UserProfile {
  publicKey: PublicKey | null;
  username?: string;
  avatar?: string;
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
}: { children: React.ReactNode }) {
  const { publicKey, connected, signMessage } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get the public client instance - this is safe to use on the client side
  const supabase = supabasePublicClient();

  useEffect(() => {
    if (connected && publicKey) {
      loadProfile(publicKey);
    } else {
      setProfile(null);
    }
  }, [connected, publicKey]);

  const loadProfile = async (publicKey: PublicKey) => {
    setIsLoading(true);
    try {
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
      });
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load profile'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) {
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: updates.username,
          avatar_url: updates.avatar,
        })
        .eq('wallet_address', profile.publicKey?.toString());

      if (updateError) {
        throw updateError;
      }

      setProfile({ ...profile, ...updates });
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to update profile'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async () => {
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

      const data = await response.json();

      // Set up Supabase session
      await supabase.auth.setSession({
        access_token: data.data.session.access_token,
        refresh_token: data.data.session.refresh_token,
      });

      // Load profile
      await loadProfile(publicKey);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sign in'));
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

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
