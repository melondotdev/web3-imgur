import { z } from 'zod';
import 'dotenv/config';

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  PINATA_JWT: z.string().min(1),
  NEXT_PUBLIC_GATEWAY_URL: z.string().min(1),
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
