import { z } from 'zod';
import 'dotenv/config';

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  PINATA_JWT: z.string().min(1),
  NEXT_PUBLIC_GATEWAY_URL: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string(),
  TWITTER_CLIENT_ID: z.string(),
  TWITTER_CLIENT_SECRET: z.string(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let serverEnv: ServerEnv;

export function getServerEnv(): ServerEnv {
  if (!serverEnv) {
    const parsed = serverEnvSchema.safeParse(process.env);

    if (!parsed.success) {
      console.error(
        '❌ Invalid environment variables:',
        parsed.error.flatten().fieldErrors,
      );
      throw new Error('Invalid environment variables');
    }

    serverEnv = parsed.data;
  }

  return serverEnv;
}
