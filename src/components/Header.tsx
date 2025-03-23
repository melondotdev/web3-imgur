'use client';
import { trimAddress } from '@/lib/utils/trim-address';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LogOut, Plus, User, Wallet } from 'lucide-react';
import { useState } from 'react';
import { ProfileModal } from './ProfileModal';
import { CreatePostModal } from './gallery/CreatePostModal';
import '@solana/wallet-adapter-react-ui/styles.css';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { setVisible } = useWalletModal();
  const { connected, disconnect, publicKey } = useWallet();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <>
      <header>
        <div className="mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-500">
                bork.hub{' '}
                <span className="bg-gray-500/20 text-xs sm:text-sm px-1 py-0.5 rounded-md ml-1">
                  v0.11
                </span>
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                type="button"
                disabled={!connected}
                onClick={() => setIsCreateModalOpen(true)}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-md transition-colors ${
                  connected
                    ? 'bg-yellow-500/80 hover:bg-yellow-500 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">create</span>
              </button>

              {connected ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-md transition-colors w-32 sm:w-48 bg-gray-500/20 text-gray-500 hover:bg-gray-500/30">
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base truncate">
                      {publicKey ? trimAddress(publicKey.toString()) : ''}
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32 sm:w-48">
                    <DropdownMenuItem
                      className="flex items-center space-x-2 cursor-pointer"
                      onClick={() => setIsProfileModalOpen(true)}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center space-x-2 cursor-pointer text-red-500 focus:text-red-500"
                      onClick={() => disconnect()}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Disconnect</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  type="button"
                  className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-md transition-colors w-32 sm:w-48 bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={() => setVisible(true)}
                >
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">connect</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      {connected && publicKey && (
        <>
          <CreatePostModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            walletAddress={publicKey.toString()}
          />
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
          />
        </>
      )}
    </>
  );
}
