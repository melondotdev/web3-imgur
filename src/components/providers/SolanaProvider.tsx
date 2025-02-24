'use client';
import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import type { PropsWithChildren } from 'react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

export function SolanaProvider({ children }: PropsWithChildren) {
  const network = WalletAdapterNetwork.Mainnet; // Change to 'Devnet' or 'Testnet' if needed
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // ✅ Use real wallet adapters instead of UnsafeBurnerWalletAdapter
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter()
  ], [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
