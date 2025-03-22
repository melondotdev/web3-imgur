import type { TagCount } from '@/lib/types/gallery/tag';
import type { Post } from '@/lib/types/post';
import { useCallback, useEffect, useState } from 'react';

interface UseTagsProps {
  posts: Post[];
}

export function useTags({ posts }: UseTagsProps) {
  const [tags, setTags] = useState<TagCount[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [tagSearch, setTagSearch] = useState('');

  useEffect(() => {
    const calculateTagCounts = () => {
      // Create a map to store tag counts
      const tagCountMap = new Map<string, number>();

      // Count tags from all posts
      for (const post of posts) {
        if (post.tags) {
          for (const tag of post.tags) {
            tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
          }
        }
      }

      // Convert map to array of TagCount objects
      const tagCounts: TagCount[] = Array.from(tagCountMap.entries()).map(
        ([tag, count]) => ({
          tag,
          count,
        }),
      );

      // Sort by count in descending order
      tagCounts.sort((a, b) => b.count - a.count);

      setTags(tagCounts);
    };

    calculateTagCounts();
  }, [posts]);

  const getFilteredPosts = useCallback(
    (postsToFilter: Post[]) => {
      if (selectedTag === 'all') return postsToFilter;
      return postsToFilter.filter((post) => post.tags?.includes(selectedTag));
    },
    [selectedTag],
  );

  const getFilteredTags = useCallback(() => {
    return tags
      .filter((tag) => tag.tag.toLowerCase().includes(tagSearch.toLowerCase()))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Show top 20 matching tags
  }, [tags, tagSearch]);

  return {
    tags,
    selectedTag,
    setSelectedTag,
    tagSearch,
    setTagSearch,
    getFilteredPosts,
    getFilteredTags,
  };
}
