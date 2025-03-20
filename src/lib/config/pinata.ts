import { PinataSDK } from 'pinata';
import { getServerEnv } from './server-env';

const env = getServerEnv();

export const pinata = new PinataSDK({
  pinataJwt: env.PINATA_JWT,
  pinataGateway: env.NEXT_PUBLIC_GATEWAY_URL,
});
