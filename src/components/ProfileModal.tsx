'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getSolscanAccountUrl } from '@/lib/utils/solana';
import { trimAddress } from '@/lib/utils/trim-address';
import { getXUserUrl } from '@/lib/utils/x';
import { useWallet } from '@solana/wallet-adapter-react';
import { ExternalLink } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { FaXTwitter } from 'react-icons/fa6';
import { toast } from 'sonner';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { data: session, status } = useSession();
  const { publicKey } = useWallet();

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
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'Profile'}
                  fill={true}
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-500 text-2xl">
                  {(session?.user?.name?.[0] || '?').toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-100">
                {session?.user?.name || 'Anonymous'}
              </h3>
              {publicKey && (
                <p className="text-sm text-gray-400 font-mono">
                  {trimAddress(publicKey.toString())}
                </p>
              )}
            </div>
          </div>

          {/* X Section */}
          <div className="space-y-2">
            {status === 'loading' ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto" />
                <p className="mt-2 text-gray-400">Loading profile...</p>
              </div>
            ) : session?.user?.name ? (
              <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                <Link
                  href={getXUserUrl(session.user.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  @{session.user.name}
                  <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => signOut()}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Unlink
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await signIn('twitter');
                  } catch (error) {
                    toast.error('Failed to connect to X', {
                      description: 'Please try again later',
                    });
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-black text-white py-2.5 px-4 rounded-lg hover:bg-gray-950 border border-gray-800 transition-all hover:border-gray-700"
              >
                <FaXTwitter className="w-4 h-4" />
                <span className="font-medium">Connect X</span>
              </button>
            )}
          </div>

          {/* Wallet Info Section */}
          {publicKey && (
            <div className="bg-gray-800 p-4 rounded-lg space-y-2">
              <h4 className="text-sm font-medium text-gray-300">
                Wallet Address
              </h4>
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm text-gray-400 break-all">
                  {publicKey.toString()}
                </p>
                <Link
                  href={getSolscanAccountUrl(publicKey.toString())}
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
