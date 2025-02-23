'use client';
import { trimAddress } from '@/lib/utils/trim-address';
import { Flame, Plus, Wallet } from 'lucide-react';
import { useState } from 'react';
import { CreatePostModal } from './modals/CreatePostModal';
import { ConnectModal, useWallet as useSuiWallet } from '@suiet/wallet-kit';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { SetNetworkModal } from './modals/SetNetworkModal';
import '@solana/wallet-adapter-react-ui/styles.css';

export function Header() {
  const suiWallet = useSuiWallet();
  const solanaWallet = useSolanaWallet();
  const { setVisible: setSolanaModalVisible } = useWalletModal();

  // "network" is null initially, meaning no network is selected.
  const [network, setNetwork] = useState<'sui' | 'solana' | null>(null);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isSuiConnectModalOpen, setIsSuiConnectModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Determine connection status and address based on the selected network.
  const isConnected =
    network === 'sui'
      ? suiWallet.connected
      : network === 'solana'
      ? solanaWallet.connected
      : false;
  const address =
    network === 'sui'
      ? suiWallet.address
      : network === 'solana'
      ? solanaWallet.publicKey?.toString()
      : '';

  // When the wallet button is clicked, always open the network selection modal.
  const handleWalletButtonClick = () => {
    setIsNetworkModalOpen(true);
  };

  return (
    <>
      <header className="bg-gray-900 border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div className="flex items-center space-x-2">
              <Flame className="w-6 h-6 text-yellow-500" />
              <h1 className="text-2xl font-bold text-yellow-500">bork.hub</h1>
            </div>
            {/* Buttons */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                disabled={!isConnected}
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-md hover:bg-yellow-500/30"
              >
                <Plus className="w-5 h-5" />
                <span>create</span>
              </button>
              {/* Wallet button always opens network selection */}
              <button
                type="button"
                onClick={handleWalletButtonClick}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-md hover:bg-yellow-500/30 w-48"
              >
                <Wallet className="w-5 h-5" />
                <span>
                  {isConnected && address
                    ? trimAddress(address)
                    : 'connect wallet'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Network Selection Modal */}
      <SetNetworkModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
        network={network}
        suiWallet={suiWallet}
        solanaWallet={solanaWallet}
        onNetworkChange={(selectedNetwork) => {
          // If the selected network is the same as the current network and connected, disconnect and reset.
          if (network === selectedNetwork && isConnected) {
            if (selectedNetwork === 'sui') {
              suiWallet.disconnect();
            } else if (selectedNetwork === 'solana') {
              solanaWallet.disconnect();
            }
            setNetwork(null);
          } else {
            // If switching networks and a wallet is already connected, disconnect first.
            if (network && network !== selectedNetwork && isConnected) {
              if (network === 'sui') {
                suiWallet.disconnect();
              } else if (network === 'solana') {
                solanaWallet.disconnect();
              }
            }
            setNetwork(selectedNetwork);
            // Trigger connection flow for the selected network.
            if (selectedNetwork === 'sui' && !suiWallet.connected) {
              setIsSuiConnectModalOpen(true);
            } else if (selectedNetwork === 'solana' && !solanaWallet.connected) {
              setSolanaModalVisible(true);
            }
          }
          setIsNetworkModalOpen(false);
        }}
      />

      {/* Render SUI ConnectModal if needed */}
      {network === 'sui' && (
        <ConnectModal
          open={isSuiConnectModalOpen}
          onConnectSuccess={() => setIsSuiConnectModalOpen(false)}
          onOpenChange={(open) => setIsSuiConnectModalOpen(open)}
        />
      )}

      {/* Create Post Modal */}
      {isConnected && address && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          walletAddress={address}
        />
      )}
    </>
  );
}
