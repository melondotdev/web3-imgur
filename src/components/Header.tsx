import { ConnectModal, useCurrentAccount } from '@mysten/dapp-kit';
import { Flame, Plus, Wallet } from 'lucide-react';
import { useState } from 'react';
import { trimAddress } from '../lib/utils/trim-address';
interface HeaderProps {
  onCreateClick: () => void;
}

export function Header({ onCreateClick }: HeaderProps) {
  const currentAccount = useCurrentAccount();
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const handleWalletClick = () => {
    if (currentAccount) {
      currentAccount.signOut();
    } else {
      currentAccount.signIn();
    }
  };

  return (
    <header className="bg-gray-900 border-b border-yellow-500/20">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-6 h-6 text-yellow-500" />
            <h1 className="text-2xl font-bold text-yellow-500">meme.fun</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={onCreateClick}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-md hover:bg-yellow-500/30"
            >
              <Plus className="w-5 h-5" />
              <span>create</span>
            </button>
            <ConnectModal
              trigger={
                <button
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-md hover:bg-yellow-500/30 w-48"
                  type="button"
                >
                  <Wallet className="w-5 h-5" />
                  <span>
                    {currentAccount
                      ? trimAddress(currentAccount.address)
                      : 'connect wallet'}
                  </span>
                </button>
              }
            />
          </div>
        </div>
      </div>
    </header>
  );
}
