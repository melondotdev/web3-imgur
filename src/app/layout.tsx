import type { Metadata } from 'next';
import './globals.css';
import { SuiProvider } from '@/components/providers/SuiProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'meme.fun',
  description: 'meme.fun',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Toaster position="top-right" />
        <SuiProvider>{children}</SuiProvider>
      </body>
    </html>
  );
}
