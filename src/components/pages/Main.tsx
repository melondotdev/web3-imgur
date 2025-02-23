'use client';

import { useEffect, useState } from 'react';
import { Gallery } from '@/components/Gallery';
import { PostModal } from '@/components/PostModal';
import { mockPosts, mockUsers } from '@/lib/constants/data';
import type { Post } from '@/types';
import { getPosts } from '@/lib/web2-database/supabase';

export function Main() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const currentUser = mockUsers[0];

  useEffect(() => {
    async function fetchPosts() {
      try {
        const fetchedPosts = await getPosts();
        // Append fetched posts to the mock posts.
        setPosts((prevPosts) => [...prevPosts, ...fetchedPosts]);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    }
    fetchPosts();
  }, []);

  const handleVote = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, votes: post.votes + 1 } : post,
      ),
    );
  };

  const handleComment = (postId: string, content: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
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
      <Gallery posts={posts} onVote={handleVote} onPostClick={setSelectedPost} />
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
