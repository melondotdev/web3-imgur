import { z } from 'zod';

export const suiAddressSchema = z
  .string()
  .regex(
    /^0x[a-fA-F0-9]{64}$/,
    'Invalid SUI address format. Must be 0x followed by 64 hexadecimal characters',
  );
