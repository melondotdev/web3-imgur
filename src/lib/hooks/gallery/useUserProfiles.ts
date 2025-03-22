import { supabasePublicClient } from '@/lib/config/supabase';
import type { Post } from '@/lib/types/post';
import { useCallback, useEffect, useState } from 'react';

interface UserProfile {
  wallet_address: string;
  username?: string;
  avatar_url?: string;
  twitter_handle?: string;
}

export function useUserProfiles(posts: Post[]) {
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(
    new Map(),
  );
  const [loading, setLoading] = useState(false);

  const fetchUserProfiles = useCallback(async (walletAddresses: string[]) => {
    if (walletAddresses.length === 0) return;

    setLoading(true);
    try {
      const supabase = supabasePublicClient();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('wallet_address', walletAddresses);

      if (error) {
        throw error;
      }
      const newProfiles = new Map<string, UserProfile>();
      for (const profile of data) {
        newProfiles.set(profile.wallet_address, profile);
      }

      setUserProfiles(newProfiles);
    } catch (err) {
      console.error('Failed to fetch user profiles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const walletAddresses = posts.map((post) => post.username).filter(Boolean);
    const uniqueAddresses = Array.from(new Set(walletAddresses));
    fetchUserProfiles(uniqueAddresses);
  }, [posts, fetchUserProfiles]);

  return {
    userProfiles,
    loading,
  };
}
