import { getEnv } from '@/lib/config/env';
import { createClient } from '@supabase/supabase-js';

const env = getEnv();

export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
