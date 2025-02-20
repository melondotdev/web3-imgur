import type { Metadata } from 'next';
import './globals.css';
import { SuiProvider } from '@/components/providers/SuiProvider';
import { Toaster } from 'react-hot-toast';
import '@suiet/wallet-kit/style.css';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = {
  title: 'meme.fun',
  description: 'meme.fun',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Toaster position="top-right" />
        <SuiProvider>{children}</SuiProvider>
      </body>
    </html>
  );
}
