import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SolanaProvider } from '@/components/providers/SolanaProvider';
import { Toaster } from 'sonner';
import '@suiet/wallet-kit/style.css';
import { getClientEnv } from '@/lib/config/client-env';
import { SessionProvider } from 'next-auth/react';
import type { PropsWithChildren } from 'react';

// This will throw if env vars are missing
getClientEnv();

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ),
  title: {
    default: 'Web3 Imgur',
    template: '%s | Web3 Imgur',
  },
  description: 'A decentralized image sharing platform',
  openGraph: {
    type: 'website',
    siteName: 'Web3 Imgur',
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className={inter.className}>
        <Toaster position="top-right" />
        <SessionProvider>
          <SolanaProvider>{children}</SolanaProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
