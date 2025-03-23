import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Post } from '@/lib/types/post';
import { getSolscanAccountUrl } from '@/lib/utils/solana';
import { trimUsername } from '@/lib/utils/trim-username';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Post['user'];
  username: string;
}

export function UserProfileModal({
  isOpen,
  onClose,
  user,
  username,
}: UserProfileModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-100">
            Profile
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Avatar and Username Section */}
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-800">
              {user?.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user?.twitter_handle || trimUsername(username)}
                  fill={true}
                  className="object-cover"
                />
              ) : (
                <img
                  src={`https://api.dicebear.com/6.x/identicon/svg?seed=${username}`}
                  alt={user?.twitter_handle || trimUsername(username)}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div>
              {user?.twitter_handle ? (
                <h3 className="text-xl font-semibold text-gray-100">
                  {user.twitter_handle}
                </h3>
              ) : (
                <h3 className="text-xl font-semibold text-gray-100">
                  {trimUsername(username)}
                </h3>
              )}
            </div>
          </div>

          {/* Wallet Info Section */}
          {username && (
            <div className="bg-gray-800 p-4 rounded-lg space-y-2">
              <h4 className="text-sm font-medium text-gray-300">
                Wallet Address
              </h4>
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm text-gray-400 break-all">
                  {username}
                </p>
                <Link
                  href={getSolscanAccountUrl(username)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-yellow-500 hover:text-yellow-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
