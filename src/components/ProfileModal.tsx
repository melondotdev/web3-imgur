import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { trimAddress } from '@/lib/utils/trim-address';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { FaXTwitter } from 'react-icons/fa6';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { profile, isLoading, error, updateProfile } = useUserProfile();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for X auth error
    const xError = searchParams.get('error');
    if (xError === 'x_auth_failed') {
      // Handle error (could show a toast or error message)
      console.error('Failed to authenticate with X');
    }
  }, [searchParams]);

  const handleXUnlink = async () => {
    try {
      await updateProfile({
        twitter_handle: undefined,
        username: undefined,
        avatar: undefined,
      });
    } catch (err) {
      console.error('Failed to unlink X account:', err);
    }
  };

  const handleXConnect = () => {
    window.location.href = '/api/auth/x';
  };

  const getSolscanUrl = (address: string) =>
    `https://solscan.io/account/${address}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-100">
            Profile
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto" />
            <p className="mt-2 text-gray-400">Loading profile...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-400">
            <p>Failed to load profile. Please try again.</p>
          </div>
        ) : profile ? (
          <div className="grid gap-6 py-4">
            {/* Avatar and Username Section */}
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-800">
                {profile.avatar ? (
                  <Image
                    src={profile.avatar}
                    alt={profile.username || 'Profile'}
                    fill={true}
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-500 text-2xl">
                    {(profile.username?.[0] || '?').toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-100">
                  {profile.username || 'Anonymous'}
                </h3>
                <p className="text-sm text-gray-400 font-mono">
                  {profile.publicKey
                    ? trimAddress(profile.publicKey.toString())
                    : ''}
                </p>
              </div>
            </div>

            {/* X Section */}
            <div className="space-y-2">
              {profile.twitter_handle ? (
                <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                  <Link
                    href={`https://x.com/${profile.twitter_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    @{profile.twitter_handle}
                    <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <button
                    type="button"
                    onClick={handleXUnlink}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Unlink
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleXConnect}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white py-2.5 px-4 rounded-lg hover:bg-gray-950 border border-gray-800 transition-all hover:border-gray-700"
                >
                  <FaXTwitter className="w-4 h-4" />
                  <span className="font-medium">Connect X</span>
                </button>
              )}
            </div>

            {/* Wallet Info Section */}
            <div className="bg-gray-800 p-4 rounded-lg space-y-2">
              <h4 className="text-sm font-medium text-gray-300">
                Wallet Address
              </h4>
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm text-gray-400 break-all">
                  {profile.publicKey?.toString()}
                </p>
                <Link
                  href={getSolscanUrl(profile.publicKey?.toString() || '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-yellow-500 hover:text-yellow-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400">
            <p>No profile found. Please connect your wallet.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
