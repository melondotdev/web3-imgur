// CreatePostModal.tsx

import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Modal } from './Modal';
import { uploadImageUsingTus } from '../lib/tusky-database/tusky'; // Adjust the path as needed
import { supabase } from '../lib/web2-database/supabase'; // Adjust the path to your supabase client

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (imageUrl: string, comment: string) => void;
  walletAddress: string;
}

export function CreatePostModal({ isOpen, onClose, onSubmit, walletAddress }: CreatePostModalProps) {
  // Instead of storing a URL string, we now store the actual file.
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [preview, setPreview] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !comment) return;

    try {
      // Upload image to Walrus using the tusky.ts function
      const imageUrl = await uploadImageUsingTus(imageFile);

      // Save the URL and comment to Supabase
      const { error } = await supabase.from('posts').insert([{ image_url: imageUrl, comment, wallet_address: walletAddress }]);
      if (error) {
        throw error;
      }
      
      // Optionally call the onSubmit callback with the image URL and comment
      onSubmit(imageUrl, comment);

      // Reset local state and close modal
      setImageFile(null);
      setComment('');
      setPreview('');
      onClose();
    } catch (error) {
      console.error('Upload or save failed:', error);
      // Optionally, show a user-friendly error message here
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 w-full max-w-2xl mx-auto">
        <h2 className="text-xl text-yellow-500 mb-6">create new post</h2>
        <div className="space-y-4">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setPreview('');
                }}
                className="absolute top-2 right-2 p-1 bg-gray-900/80 rounded-full text-yellow-500 hover:text-yellow-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-yellow-500/20 rounded-lg p-8 text-center">
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setImageFile(file);
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-yellow-500" />
                  <div className="text-yellow-500">upload image</div>
                </div>
              </label>
            </div>
          )}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="add a comment..."
            className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/20 rounded-md text-yellow-500 placeholder-yellow-500/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            rows={3}
            required
          />
          <button
            type="submit"
            className="w-full bg-yellow-500/20 text-yellow-500 py-2 px-4 rounded-md hover:bg-yellow-500/30 flex items-center justify-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>share</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
