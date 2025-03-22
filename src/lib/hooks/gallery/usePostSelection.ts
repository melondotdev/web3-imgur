import type { Post } from '@/lib/types/post';
import { useCallback, useState } from 'react';

interface UsePostSelectionProps {
  posts: Post[];
  loadedImages: Map<string, string>;
  preloadImage: (imageUrl: string) => Promise<unknown>;
  handleImageLoad: (postId: string, imageUrl: string) => void;
  setPosts: (updater: (prevPosts: Post[]) => Post[]) => void;
}

export function usePostSelection({
  posts,
  loadedImages,
  preloadImage,
  handleImageLoad,
  setPosts,
}: UsePostSelectionProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handlePostSelect = useCallback(
    async (post: Post) => {
      // Get the most up-to-date post data from our posts array
      const currentPost = posts.find((p) => p.id === post.id) || post;

      const cachedImage = loadedImages.get(currentPost.id);

      if (!cachedImage) {
        try {
          await preloadImage(currentPost.imageUrl);
          handleImageLoad(currentPost.id, currentPost.imageUrl);
        } catch (error) {
          console.error('Failed to preload image:', error);
        }
      }

      setSelectedPost(currentPost);
    },
    [loadedImages, handleImageLoad, preloadImage, posts],
  );

  const handlePostModalVoteUpdate = useCallback(
    (postId: string, newVoteCount: number) => {
      // Update posts array
      setPosts((prevPosts: Post[]) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, votes: newVoteCount } : post,
        ),
      );

      // Update selected post if it's the same one
      if (selectedPost?.id === postId) {
        setSelectedPost((prev) =>
          prev ? { ...prev, votes: newVoteCount } : null,
        );
      }
    },
    [selectedPost, setPosts],
  );

  return {
    selectedPost,
    setSelectedPost,
    handlePostSelect,
    handlePostModalVoteUpdate,
  };
}
