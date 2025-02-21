import { getEnv } from '@/lib/config/env';
import { createClient } from '@supabase/supabase-js';

export function supabaseClient() {
  const env = getEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}
