'use client';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { X } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';

export function MainLayout({ children }: PropsWithChildren) {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {showBanner && (
        <div className="relative bg-yellow-500/10 border-b border-yellow-500/20">
          <div className="overflow-hidden whitespace-nowrap">
            <div className="animate-[marquee_40s_linear_infinite] inline-block">
              <div className="inline-flex items-center space-x-2 px-4 py-2">
                <span className="text-yellow-500">
                  🔥 FLAMEHUB LAUNCH COMPETITION 🔥
                </span>
                <span className="hidden sm:inline text-yellow-500/70">
                  Hold 250K
                </span>
                <span className="font-mono bg-yellow-500/20 px-2 py-0.5 rounded text-yellow-500">
                  $FLAME
                </span>
                <span className="hidden sm:inline text-yellow-500/70">
                  to qualify! Win up to 2M $FLAME
                </span>
                <a
                  href="https://jup.ag/swap/SOL-kF7eBpyGf4srNeHccizaHNasEbfJ2jfwYTYN2hCYGFM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline text-yellow-500/70 hover:text-yellow-500 transition-colors underline underline-offset-2"
                >
                  (kF7eBpyGf4srNeHccizaHNasEbfJ2jfwYTYN2hCYGFM)
                </a>
                <span className="hidden sm:inline text-yellow-500/70">
                  + 2 $SOL! Tag posts with
                </span>
                <span className="font-mono bg-yellow-500/20 px-2 py-0.5 rounded text-yellow-500">
                  flame
                </span>
                <span className="hidden sm:inline text-yellow-500/70">
                  and connect X account.
                </span>
                <span className="hidden sm:inline text-yellow-500/80 font-bold">
                  JOIN NOW!
                </span>
                <span className="px-8">•</span>
              </div>
            </div>
            <div className="animate-[marquee_40s_linear_infinite] inline-block">
              <div className="inline-flex items-center space-x-2 px-4 py-2">
                <span className="text-yellow-500">
                  🔥 FLAMEHUB LAUNCH COMPETITION 🔥
                </span>
                <span className="hidden sm:inline text-yellow-500/70">
                  Hold 250K
                </span>
                <span className="font-mono bg-yellow-500/20 px-2 py-0.5 rounded text-yellow-500">
                  $FLAME
                </span>
                <span className="hidden sm:inline text-yellow-500/70">
                  to qualify! Win up to 2M $FLAME
                </span>
                <a
                  href="https://jup.ag/swap/SOL-kF7eBpyGf4srNeHccizaHNasEbfJ2jfwYTYN2hCYGFM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline text-yellow-500/70 hover:text-yellow-500 transition-colors underline underline-offset-2"
                >
                  (kF7eBpyGf4srNeHccizaHNasEbfJ2jfwYTYN2hCYGFM)
                </a>
                <span className="hidden sm:inline text-yellow-500/70">
                  + 2 $SOL! Tag posts with
                </span>
                <span className="font-mono bg-yellow-500/20 px-2 py-0.5 rounded text-yellow-500">
                  flame
                </span>
                <span className="hidden sm:inline text-yellow-500/70">
                  and connect X account.
                </span>
                <span className="hidden sm:inline text-yellow-500/80 font-bold">
                  JOIN NOW!
                </span>
                <span className="px-8">•</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowBanner(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-yellow-500/70 hover:text-yellow-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <Header />

      {/* Mobile Sidebar */}
      <div className="lg:hidden border-b border-gray-800">
        <Sidebar />
      </div>

      <div className="flex flex-1 overflow-x-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <main className="flex-1 ml-0 lg:ml-15 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
