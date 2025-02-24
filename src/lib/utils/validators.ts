import { z } from 'zod';

export const suiAddressSchema = z
  .string()
  .regex(
    /^0x[a-fA-F0-9]{64}$/,
    'Invalid SUI address format. Must be 0x followed by 64 hexadecimal characters',
  );

// Solana address regex pattern: base58-encoded string of 32-44 characters
export const SOLANA_ADDRESS_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export const solanaAddressSchema = z.string().regex(SOLANA_ADDRESS_PATTERN);
export type SolanaAddress = z.infer<typeof solanaAddressSchema>;
