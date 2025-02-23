'use client';
import React from 'react';
import { trimAddress } from '@/lib/utils/trim-address';
import { useWallet as useSuiWallet } from '@suiet/wallet-kit';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';

interface SetNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  network: 'sui' | 'solana' | null;
  onNetworkChange: (selectedNetwork: 'sui' | 'solana') => void;
  suiWallet: ReturnType<typeof useSuiWallet>;
  solanaWallet: ReturnType<typeof useSolanaWallet>;
}

export const SetNetworkModal: React.FC<SetNetworkModalProps> = ({
  isOpen,
  onClose,
  network,
  onNetworkChange,
  suiWallet,
  solanaWallet,
}) => {
  if (!isOpen) return null;

  const suiText =
    suiWallet.connected && suiWallet.address
      ? `Disconnect (${trimAddress(suiWallet.address)})`
      : 'Connect to SUI Wallet';

  const solanaText =
    solanaWallet.connected && solanaWallet.publicKey
      ? `Disconnect (${trimAddress(solanaWallet.publicKey.toString())})`
      : 'Connect to SOLANA Wallet';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-80">
        <h2 className="text-xl font-bold mb-4">Select Wallet</h2>
        <div className="flex flex-col space-y-2">
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            onClick={() => onNetworkChange('sui')}
          >
            {suiText}
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={() => onNetworkChange('solana')}
          >
            {solanaText}
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-600 underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
