import type { Metadata } from 'next';
import './globals.css';
import { SolanaProvider } from '@/components/providers/SolanaProvider';
import { Toaster } from 'sonner';
import '@suiet/wallet-kit/style.css';
import { getClientEnv } from '@/lib/config/client-env';
import { SessionProvider } from 'next-auth/react';
import type { PropsWithChildren } from 'react';

// This will throw if env vars are missing
getClientEnv();

export const metadata: Metadata = {
  title: 'bork.hub',
  description:
    'bork.hub is where memecoin communities grow. currently in early alpha.',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Toaster position="top-right" />
        <SessionProvider>
          <SolanaProvider>{children}</SolanaProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
