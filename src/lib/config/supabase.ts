import { createClient } from '@supabase/supabase-js';
import { getClientEnv } from './client-env';
import { getServerEnv } from './server-env';

// Create a single instance for client operations
const clientEnv = getClientEnv();
const supabaseClientInstance = createClient(
  clientEnv.NEXT_PUBLIC_SUPABASE_URL,
  clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// Server-side only instance creation
let supabaseServerInstance: ReturnType<typeof createClient> | null = null;

export function supabaseClient() {
  // Only create server instance if we're on the server side
  if (typeof window === 'undefined') {
    if (!supabaseServerInstance) {
      const serverEnv = getServerEnv();
      // Create a new Supabase client with the service role key
      supabaseServerInstance = createClient(
        serverEnv.NEXT_PUBLIC_SUPABASE_URL,
        serverEnv.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
          global: {
            headers: {
              Authorization: `Bearer ${serverEnv.SUPABASE_SERVICE_ROLE_KEY}`,
            },
          },
        },
      );
    }
    return supabaseServerInstance;
  }
  throw new Error(
    'Attempted to use server-side Supabase client on the client side',
  );
}

export function supabasePublicClient() {
  return supabaseClientInstance;
}
