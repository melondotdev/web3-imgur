import { Plus, Wallet, Flame } from 'lucide-react';

interface HeaderProps {
  isWalletConnected: boolean;
  onCreateClick: () => void;
  onWalletClick: (walletAddress: string) => void;
  setWalletAddress: (walletAddress: string) => void;
}

export function Header({ isWalletConnected, onCreateClick, onWalletClick, setWalletAddress }: HeaderProps) {
  const handleWalletClick = () => {
    if (!isWalletConnected) {
      const address = prompt('Please enter your wallet address:');
      if (address) {
        setWalletAddress(address);
        onWalletClick(address);
      }
    } else {
      setWalletAddress('');
      onWalletClick('');
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
              onClick={onCreateClick}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-md hover:bg-yellow-500/30"
            >
              <Plus className="w-5 h-5" />
              <span>create</span>
            </button>
            <button
              onClick={handleWalletClick}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-md hover:bg-yellow-500/30"
            >
              <Wallet className="w-5 h-5" />
              <span>{isWalletConnected ? 'disconnect' : 'connect wallet'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}