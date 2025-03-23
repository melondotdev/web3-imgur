'use client';
import { UserProfileProvider } from '@/contexts/UserProfileContext';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { type PropsWithChildren, useMemo } from 'react';

export function SolanaProvider({ children }: PropsWithChildren) {
  const network = WalletAdapterNetwork.Mainnet; // Change to 'Devnet' or 'Testnet' if needed
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // ✅ Use real wallet adapters instead of UnsafeBurnerWalletAdapter
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          <UserProfileProvider>{children}</UserProfileProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
