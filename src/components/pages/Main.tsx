import { Gallery } from '@/components/Gallery';
import { PostModal } from '@/components/PostModal';
import { mockPosts, mockUsers } from '@/lib/constants/data';
import type { Post } from '@/types';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useState } from 'react';

export function Main() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
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

  return (
    <div>
      <Gallery
        posts={posts}
        onVote={handleVote}
        onPostClick={setSelectedPost}
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
