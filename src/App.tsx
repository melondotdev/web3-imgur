import { useCurrentAccount } from '@mysten/dapp-kit';
import { useState } from 'react';
import { mockPosts, mockUsers } from '../data/data';
import { CreatePostModal } from './components/CreatePostModal';
import { Gallery } from './components/Gallery';
import { Header } from './components/Header';
import { PostModal } from './components/PostModal';
import type { Post } from './types';

export function App() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const currentUser = mockUsers[0];
  const currentAccount = useCurrentAccount();

  const handleVote = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, votes: post.votes + 1 } : post,
      ),
    );
  };

  const handleComment = (postId: string, content: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: String(Date.now()),
                  postId,
                  author: currentUser.username,
                  content,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : post,
      ),
    );
  };

  const handleCreatePost = (imageUrl: string, comment: string) => {
    const newPost: Post = {
      id: String(Date.now()),
      imageUrl,
      author: currentUser.username,
      votes: 0,
      createdAt: new Date().toISOString(),
      comments: [
        {
          id: String(Date.now() + 1),
          postId: String(Date.now()),
          author: currentUser.username,
          content: comment,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="min-h-screen bg-black">
      <Header onCreateClick={() => setIsCreateModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Gallery
          posts={posts}
          onVote={handleVote}
          onPostClick={setSelectedPost}
        />
      </main>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
        walletAddress={currentAccount?.address}
      />

      {selectedPost && (
        <PostModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          onVote={handleVote}
          onComment={handleComment}
        />
      )}
    </div>
  );
}
