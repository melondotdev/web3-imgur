'use client';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import type { PropsWithChildren } from 'react';

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-15">{children}</main>
      </div>
    </div>
  );
}
