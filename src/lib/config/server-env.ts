import { z } from 'zod';
import 'dotenv/config';

const serverEnvSchema = z.object({
  TUSKY_API_KEY: z.string().min(1),
  TUSKY_VAULT_ID: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export function getServerEnv() {
  const envParse = serverEnvSchema.safeParse(process.env);

  if (!envParse.success) {
    console.error(
      '❌ Invalid server environment variables:',
      envParse.error.flatten().fieldErrors,
    );
    throw new Error('Invalid server environment variables');
  }
  return envParse.data;
}
