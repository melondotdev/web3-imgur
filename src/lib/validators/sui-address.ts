import { z } from 'zod';

// SUI address regex pattern: 0x followed by exactly 64 hex characters
export const SUI_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{64}$/;

export const suiAddressSchema = z.string().regex(SUI_ADDRESS_PATTERN);
export type SuiAddress = z.infer<typeof suiAddressSchema>;
