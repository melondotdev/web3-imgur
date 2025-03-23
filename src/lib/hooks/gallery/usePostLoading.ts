import { cacheService } from '@/lib/services/cache/cache-service';
import {
  type PostSortOption,
  getAllPosts,
} from '@/lib/services/db/get-all-posts';
import type { Post } from '@/lib/types/post';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface UsePostLoadingProps {
  sortBy: PostSortOption;
  defaultTag?: string;
}

export function usePostLoading({ sortBy, defaultTag }: UsePostLoadingProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const postCacheRef = useRef<Map<string, Post>>(new Map());

  const loadPosts = useCallback(
    async (pageNum: number, replace = false) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        const newPosts = await getAllPosts(sortBy, pageNum, defaultTag);

        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          setPosts((prev) => {
            const updatedPosts = replace ? newPosts : [...prev, ...newPosts];
            // Update cache using ref
            const newCache = new Map(postCacheRef.current);
            for (const post of updatedPosts) {
              newCache.set(post.id, post);
            }
            postCacheRef.current = newCache;
            cacheService.set('all-posts', updatedPosts);

            return updatedPosts;
          });
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        toast.error('Failed to load posts');
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [sortBy, defaultTag],
  );

  const handleLoadMore = useCallback(() => {
    setPage((prev) => prev + 1);
    loadPosts(page + 1);
  }, [loadPosts, page]);

  const handleNewPost = useCallback((newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  // Load initial posts when sortBy or defaultTag changes
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    loadPosts(0, true);
  }, [sortBy, defaultTag, loadPosts]);

  return {
    posts,
    loading,
    hasMore,
    page,
    loadPosts,
    handleLoadMore,
    handleNewPost,
    setPosts,
  };
}
