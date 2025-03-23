import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type ReactNode, useCallback, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  returnRoute?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  returnRoute = '/',
}: ModalProps) {
  const router = useRouter();

  const handleClose = useCallback(() => {
    onClose();
    router.replace(returnRoute, { scroll: false });
  }, [onClose, router, returnRoute]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Background overlay with click handler */}
      <div
        className="fixed w-screen inset-0 bg-black/80 z-50"
        onClick={handleClose}
      >
        <div className="h-full w-screen md:p-4 md:flex md:items-center md:justify-center">
          <div
            className="h-full w-screen md:h-[85vh] md:w-[90vw] md:max-h-[900px] md:rounded-lg bg-black/80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white z-50"
              type="button"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
