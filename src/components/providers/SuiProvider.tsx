'use client';
import { WalletProvider } from '@suiet/wallet-kit';
import type { PropsWithChildren } from 'react';

export function SuiProvider({ children }: PropsWithChildren) {
  return <WalletProvider autoConnect={true}>{children}</WalletProvider>;
}
