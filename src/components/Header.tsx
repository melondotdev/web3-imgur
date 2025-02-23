'use client';
import { trimAddress } from '@/lib/utils/trim-address';
import { ConnectModal, useWallet } from '@suiet/wallet-kit';
import { Flame, Plus, Wallet } from 'lucide-react';
import { useState } from 'react';
import { CreatePostModal } from './CreatePostModal';

export function Header() {
  const wallet = useWallet();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <header className="bg-gray-900 border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-6 h-6 text-yellow-500" />
              <h1 className="text-2xl font-bold text-yellow-500">bork.hub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                disabled={wallet.status !== 'connected'}
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-md hover:bg-yellow-500/30"
              >
                <Plus className="w-5 h-5" />
                <span>create</span>
              </button>

              <ConnectModal
                open={isConnectModalOpen}
                onConnectSuccess={() => {
                  setIsConnectModalOpen(false);
                }}
              >
                <button
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-md hover:bg-yellow-500/30 w-48"
                  type="button"
                  onClick={() => {
                    if (wallet.status !== 'connected') {
                      setIsConnectModalOpen(true);
                    } else {
                      wallet.disconnect();
                      // TODO: Implement disconnect
                    }
                  }}
                >
                  <Wallet className="w-5 h-5" />
                  <span>
                    {wallet.status === 'connected' && wallet.address
                      ? trimAddress(wallet.address)
                      : 'connect wallet'}
                  </span>
                </button>
              </ConnectModal>
            </div>
          </div>
        </div>
      </header>
      {wallet.status === 'connected' && wallet.address && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          walletAddress={wallet.address}
        />
      )}
    </>
  );
}
