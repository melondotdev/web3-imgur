import { z } from 'zod';
import 'dotenv/config';

// Schema for environment variables
const envSchema = z.object({
  TUSKY_API_KEY: z.string().min(1),
  TUSKY_VAULT_ID: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
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

export function getPublicEnv() {
  console.log('process.env', process.env);
  const envParse = publicEnvSchema.safeParse(process.env);
  if (!envParse.success) {
    console.error(
      '❌ Invalid environment variables:',
      envParse.error.flatten().fieldErrors,
    );
    throw new Error('Invalid public environment variables');
  }
  return envParse.data;
}
