import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import '@suiet/wallet-kit/style.css';
import type { PropsWithChildren } from 'react';
import { SuiProvider } from '@/components/providers/SuiProvider';
import { SolanaProvider } from '@/components/providers/SolanaProvider';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import '@suiet/wallet-kit/style.css';
import { clusterApiUrl } from '@solana/web3.js';

export const metadata: Metadata = {
  title: 'bork.hub',
  description: 'bork.hub',
};

export default function RootLayout({ children }: PropsWithChildren) {
  // Solana configuration
  const endpoint = clusterApiUrl('mainnet-beta');
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    // Add other wallets as needed
  ];

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Toaster position="top-right" />
        <SuiProvider>
          <SolanaProvider>
            {children}
          </SolanaProvider>
        </SuiProvider>
      </body>
    </html>
  );
}
