import { supabasePublicClient } from '@/lib/config/supabase';
import { useWallet } from '@solana/wallet-adapter-react';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function useConnectTwitter() {
  const { data: session, update: updateSession } = useSession();
  const { publicKey } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [pendingWalletAddress, setPendingWalletAddress] = useState<
    string | null
  >(null);

  // Effect to update database when session changes during connection
  useEffect(() => {
    const updateUserData = async () => {
      // Only proceed if we're connecting and have a session
      if (!isConnecting || !session?.user) return;

      // Use either the current wallet or the pending wallet address
      const walletAddress = publicKey?.toString() || pendingWalletAddress;
      if (!walletAddress) {
        setIsConnecting(false);
        return;
      }

      try {
        const supabase = supabasePublicClient();

        console.log(session);

        // Update or create user record
        const userData = {
          wallet_address: walletAddress,
          twitter_handle: session.user.name,
          avatar_url: session.user.image,
          username: session.user.name,
        };

        const { error: upsertError } = await supabase
          .from('users')
          .upsert(userData, {
            onConflict: 'wallet_address',
          });

        if (upsertError) {
          console.error('Error updating user:', upsertError);
          toast.error('Failed to update profile');
          return;
        }

        toast.success('Successfully connected X account');
      } catch (error) {
        console.error('Error updating user data:', error);
        toast.error('Failed to update profile');
      } finally {
        setIsConnecting(false);
        setPendingWalletAddress(null);
      }
    };

    updateUserData();
  }, [session, publicKey, isConnecting, pendingWalletAddress]);

  const connectTwitter = async () => {
    try {
      if (!publicKey) {
        toast.error('Please connect your wallet first');
        return;
      }

      setIsConnecting(true);
      // Store the wallet address before redirecting
      setPendingWalletAddress(publicKey.toString());

      // Sign in with Twitter, passing the wallet address in state
      const result = await signIn('twitter', {
        redirect: false,
        callbackUrl: '/',
        state: JSON.stringify({ walletAddress: publicKey.toString() }),
      });

      if (result?.error) {
        setIsConnecting(false);
        setPendingWalletAddress(null);
        toast.error('Failed to connect to X', {
          description: result.error,
        });
        return;
      }

      // Force session update
      await updateSession();
    } catch (error) {
      console.error('Error connecting Twitter:', error);
      toast.error('Failed to connect to X', {
        description: 'Please try again later',
      });
      setIsConnecting(false);
      setPendingWalletAddress(null);
    }
  };

  return { connectTwitter, isConnecting };
}
