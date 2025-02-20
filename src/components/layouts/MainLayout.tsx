import { Header } from '@/components/Header';
import type { PropsWithChildren } from 'react';

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
