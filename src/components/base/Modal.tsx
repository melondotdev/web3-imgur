import { X } from 'lucide-react';
import type React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/90" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-yellow-500 hover:text-yellow-400"
        >
          <X className="w-6 h-6" />
        </button>
        {children}
      </div>
    </div>
  );
}
