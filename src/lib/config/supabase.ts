import { createClient } from '@supabase/supabase-js';
import { getClientEnv } from './client-env';
import { getServerEnv } from './server-env';

export function supabaseClient() {
  const env = getServerEnv();
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function supabasePublicClient() {
  const env = getClientEnv();
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
