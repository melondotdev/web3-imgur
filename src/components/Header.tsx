'use client';
import { trimAddress } from '@/lib/utils/trim-address';
import { Flame, Plus, Wallet } from 'lucide-react';
import { useState } from 'react';
import { CreatePostModal } from './CreatePostModal';
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import "@solana/wallet-adapter-react-ui/styles.css";

export function Header() {
  const { setVisible } = useWalletModal();
  const { connected, disconnect, publicKey } = useWallet();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  return (
    <>
      <header className="bg-gray-900 border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-6 h-6 text-yellow-500" />
              <h1 className="text-2xl font-bold text-yellow-500">bork.hub <span className="bg-yellow-500/20 text-sm px-2 py-0.5 rounded-md ml-1">BETA</span></h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                disabled={!connected}
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-md hover:bg-yellow-500/30"
              >
                <Plus className="w-5 h-5" />
                <span>create</span>
              </button>

              <button
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-md hover:bg-yellow-500/30 w-48"
                type="button"
                onClick={() => {
                  if (!connected) {
                    setVisible(true);
                  } else {
                    disconnect();
                  }
                }}
              >
                <Wallet className="w-5 h-5" />
                <span>
                  {connected && publicKey
                    ? trimAddress(publicKey.toString())
                    : 'connect wallet'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
      {connected && publicKey && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          walletAddress={publicKey.toString()}
        />
      )}
    </>
  );
}
