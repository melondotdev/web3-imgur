import { z } from 'zod';
import 'dotenv/config';

// Schema for environment variables
const envSchema = z.object({
  TUSKY_API_KEY: z.string().min(1),
  TUSKY_VAULT_ID: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export function getEnv() {
  // Parse and validate environment variables
  const envParse = envSchema.safeParse(process.env);

  if (!envParse.success) {
    console.error(
      '❌ Invalid environment variables:',
      envParse.error.flatten().fieldErrors,
    );
    throw new Error('Invalid environment variables');
  }
  return envParse.data;
}
