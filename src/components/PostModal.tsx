import React, { useState } from 'react';
import { ArrowBigUp, Send } from 'lucide-react';
import { Modal } from './Modal';
import { Post } from '../types';

interface PostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onVote: (id: string) => void;
  onComment: (postId: string, content: string) => void;
}

export function PostModal({ post, isOpen, onClose, onVote, onComment }: PostModalProps) {
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onComment(post.id, newComment);
      setNewComment('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-2/3">
          <img
            src={post.imageUrl}
            alt="post content"
            className="w-full h-auto"
          />
        </div>
        <div className="md:w-1/3 p-6 border-l border-yellow-500/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-yellow-500/80">@{post.author}</span>
            <button
              onClick={() => onVote(post.id)}
              className="flex items-center space-x-2 text-yellow-500 hover:text-yellow-400"
            >
              <ArrowBigUp className="w-5 h-5" />
              <span>{post.votes}</span>
            </button>
          </div>

          <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto">
            {post.comments.map((comment) => (
              <div key={comment.id} className="border-b border-yellow-500/10 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-yellow-500/80">@{comment.author}</span>
                  <span className="text-xs text-yellow-500/50">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-yellow-500/90">{comment.content}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmitComment} className="mt-auto">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="add a comment..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-yellow-500/20 rounded-md text-yellow-500 placeholder-yellow-500/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-md hover:bg-yellow-500/30"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}