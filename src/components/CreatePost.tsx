import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface CreatePostProps {
  onSubmit: (imageUrl: string, comment: string) => void;
}

export function CreatePost({ onSubmit }: CreatePostProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [comment, setComment] = useState('');
  const [preview, setPreview] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl && comment) {
      onSubmit(imageUrl, comment);
      setImageUrl('');
      setComment('');
      setPreview('');
    }
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setPreview(url);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg border border-yellow-500/20 p-6 mb-8">
      <div className="space-y-4">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => {
                setImageUrl('');
                setPreview('');
              }}
              className="absolute top-2 right-2 p-1 bg-gray-900/80 rounded-full text-yellow-500 hover:text-yellow-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-yellow-500/20 rounded-lg p-8 text-center">
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-yellow-500" />
              <div className="text-yellow-500">Share your haunting image</div>
            </div>
          </div>
        )}
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => handleImageUrlChange(e.target.value)}
          placeholder="Enter image URL"
          className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/20 rounded-md text-yellow-500 placeholder-yellow-500/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
          required
        />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full px-3 py-2 bg-gray-800 border border-yellow-500/20 rounded-md text-yellow-500 placeholder-yellow-500/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
          rows={3}
          required
        />
        <button
          type="submit"
          className="w-full bg-yellow-500/20 text-yellow-500 py-2 px-4 rounded-md hover:bg-yellow-500/30 flex items-center justify-center space-x-2"
        >
          <Upload className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>
    </form>
  );
}