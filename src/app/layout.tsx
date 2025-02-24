import type { Metadata } from 'next';
import './globals.css';
// import { SuiProvider } from '@/components/providers/SuiProvider';
import { SolanaProvider } from '@/components/providers/SolanaProvider';
import { Toaster } from 'react-hot-toast';
import '@suiet/wallet-kit/style.css';
import { getClientEnv } from '@/lib/config/client-env';
import type { PropsWithChildren } from 'react';

// This will throw if env vars are missing
getClientEnv();

export const metadata: Metadata = {
  title: 'bork.hub',
  description: 'bork.hub is where memecoin communities grow. currently in open beta.',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Toaster position="top-right" />
        {/* <SuiProvider>{children}</SuiProvider> */}
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}
