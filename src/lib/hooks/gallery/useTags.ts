import type { TagCount } from '@/lib/types/gallery/tag';
import type { Post } from '@/lib/types/post';
import { useEffect, useState } from 'react';

export interface UseTagsProps {
  posts: Post[];
  defaultTag?: string;
}

export function useTags({ posts, defaultTag }: UseTagsProps) {
  const [tags, setTags] = useState<TagCount[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>(defaultTag || 'all');
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

  useEffect(() => {
    if (defaultTag && selectedTag === 'all') {
      setSelectedTag(defaultTag);
    }
  }, [defaultTag]);

  const handleSetSelectedTag = (tag: string) => {
    if (defaultTag) {
      const postsWithTag = posts.filter((post) => post.tags?.includes(tag));
      const postsWithDefaultTag = postsWithTag.filter((post) =>
        post.tags?.includes(defaultTag),
      );
      if (postsWithDefaultTag.length > 0) {
        setSelectedTag(tag);
      }
    } else {
      setSelectedTag(tag);
    }
  };

  const getFilteredTags = (): TagCount[] => {
    const tagCounts = new Map<string, number>();

    // Only count tags from posts that include the defaultTag if it's present
    const relevantPosts = defaultTag
      ? posts.filter((post) => post.tags?.includes(defaultTag))
      : posts;

    for (const post of relevantPosts) {
      if (post.tags) {
        for (const tag of post.tags) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      }
    }

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .filter((tagCount) =>
        tagCount.tag.toLowerCase().includes(tagSearch.toLowerCase()),
      )
      .sort((a, b) => b.count - a.count);
  };

  const getFilteredPosts = (postsToFilter: Post[]): Post[] => {
    // If defaultTag is present, always filter by it
    const defaultTagFiltered = defaultTag
      ? postsToFilter.filter((post) => post.tags?.includes(defaultTag))
      : postsToFilter;

    // Then apply the selected tag filter if it's not 'all'
    return selectedTag === 'all'
      ? defaultTagFiltered
      : defaultTagFiltered.filter((post) => post.tags?.includes(selectedTag));
  };

  return {
    tags,
    selectedTag,
    setSelectedTag: handleSetSelectedTag,
    tagSearch,
    setTagSearch,
    getFilteredPosts,
    getFilteredTags,
  };
}
