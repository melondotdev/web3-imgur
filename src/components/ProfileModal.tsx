import { useWallet } from '@solana/wallet-adapter-react';
import type { FC } from 'react';
import { useUserProfile } from '../contexts/UserProfileContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { connected } = useWallet();
  const { profile, isLoading, updateProfile } = useUserProfile();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Profile</h2>
          <button onClick={onClose}>&times;</button>
        </div>

        {connected ? (
          isLoading ? (
            <p>Loading...</p>
          ) : profile ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Wallet Address</p>
                <p className="font-mono">{profile.publicKey?.toString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <input
                  type="text"
                  value={profile.username || ''}
                  onChange={(e) => updateProfile({ username: e.target.value })}
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>
          ) : (
            <p>No profile found</p>
          )
        ) : (
          <p>Please connect your wallet to view profile</p>
        )}
      </div>
    </div>
  );
};
