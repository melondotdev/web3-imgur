'use client';

import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { X } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';

export function MainLayout({ children }: PropsWithChildren) {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="min-h-screen bg-black">
      {showBanner && (
        <div className="relative bg-yellow-500/10 border-b border-yellow-500/20">
          <div className="overflow-hidden whitespace-nowrap">
            <div className="animate-[marquee_20s_linear_infinite] inline-block">
              <div className="inline-flex items-center space-x-2 px-4 py-2">
                <span className="text-yellow-500">
                  🔥 FLAMEHUB LAUNCH COMPETITION 🔥
                </span>
                <span className="text-yellow-500/70">Tag your posts with</span>
                <span className="font-mono bg-yellow-500/20 px-2 py-0.5 rounded text-yellow-500">
                  flame
                </span>
                <span className="text-yellow-500/70">
                  connect your X account and HOLD 250K $FLAME to qualify for 1M
                  $FLAME in prizes! 🏆
                </span>
                <span className="text-yellow-500/80 font-bold">
                  LIMITED TIME ONLY!
                </span>
                <span className="px-8">•</span>
              </div>
            </div>
            <div className="animate-[marquee_20s_linear_infinite] inline-block">
              <div className="inline-flex items-center space-x-2 px-4 py-2">
                <span className="text-yellow-500">
                  🔥 FLAMEHUB LAUNCH COMPETITION 🔥
                </span>
                <span className="text-yellow-500/70">Tag your posts with</span>
                <span className="font-mono bg-yellow-500/20 px-2 py-0.5 rounded text-yellow-500">
                  flame
                </span>
                <span className="text-yellow-500/70">
                  and connect your X account to qualify for epic prizes! 🏆
                </span>
                <span className="text-yellow-500/80 font-bold">
                  LIMITED TIME ONLY!
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
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-15">{children}</main>
      </div>
    </div>
  );
}
