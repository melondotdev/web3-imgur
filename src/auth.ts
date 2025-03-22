import { getServerEnv } from '@/lib/config/server-env';
import { supabaseClient } from '@/lib/config/supabase';
import NextAuth from 'next-auth';
import Twitter from 'next-auth/providers/twitter';

const env = getServerEnv();

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Twitter({
      clientId: env.AUTH_CLIENT_ID,
      clientSecret: env.AUTH_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'twitter' && user.name && user.image) {
        try {
          const supabase = supabaseClient();

          // First check if user exists with this twitter handle
          const { data: existingUser } = await supabase
            .from('users')
            .select('wallet_address, twitter_handle, username')
            .eq('twitter_handle', user.name)
            .single();

          const updateData = {
            twitter_handle: user.name,
            avatar_url: user.image,
            username: existingUser?.username || user.name,
          };

          // If user exists, update while preserving wallet_address
          if (existingUser) {
            const { error } = await supabase
              .from('users')
              .update(updateData)
              .eq('twitter_handle', user.name);

            if (error) {
              console.error('Error updating user in Supabase:', error);
              return false;
            }
          } else {
            // Create new user if doesn't exist
            const { error } = await supabase.from('users').insert([updateData]);

            if (error) {
              console.error('Error creating user in Supabase:', error);
              return false;
            }
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
  },
  //   adapter: SupabaseAdapter({
  //     url: env.NEXT_PUBLIC_SUPABASE_URL,
  //     secret: env.SUPABASE_SERVICE_ROLE_KEY,
  //   }),
});
