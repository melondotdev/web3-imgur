import type { PostSortOption } from '@/lib/services/db/get-all-posts';
import type { TagCount } from '@/lib/types/gallery/tag';

export interface GalleryHeaderProps {
  isSearchOpen: boolean;
  tagSearch: string;
  setTagSearch: (search: string) => void;
  setIsSearchOpen: (isOpen: boolean) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  filteredTags: TagCount[];
  sortBy: PostSortOption;
  setSortBy: (sort: PostSortOption) => void;
}
