import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MAX_VISIBLE_TAGS } from '@/lib/constants/gallery';
import type { GalleryHeaderProps } from '@/lib/types/gallery/gallery-header';
import { ChevronDown, Search } from 'lucide-react';

export function GalleryHeader({
  isSearchOpen,
  tagSearch,
  setTagSearch,
  setIsSearchOpen,
  selectedTag,
  setSelectedTag,
  filteredTags,
  sortBy,
  setSortBy,
}: GalleryHeaderProps) {
  return (
    <div className="mb-4 flex items-center gap-2 px-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          {isSearchOpen ? (
            <input
              type="text"
              placeholder="Search tags..."
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="w-48 px-3 py-1.5 text-sm border border-gray-700 rounded-full bg-transparent text-gray-300 focus:outline-none focus:border-gray-600"
              onBlur={() => {
                if (!tagSearch) {
                  setIsSearchOpen(false);
                }
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 text-gray-400 hover:text-white transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {/* Add the "All" tag */}
          <button
            type="button"
            onClick={() => setSelectedTag('all')}
            className={`shrink-0 px-3 py-1.5 text-sm rounded-full transition-colors ${
              selectedTag === 'all'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          {filteredTags
            .slice(0, tagSearch ? undefined : MAX_VISIBLE_TAGS)
            .map(({ tag }) => (
              <button
                type="button"
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`shrink-0 px-3 py-1.5 text-sm rounded-full transition-colors ${
                  selectedTag === tag
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tag}
              </button>
            ))}
        </div>
      </div>

      <div className="flex-grow" />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="flex items-center justify-center space-x-2 px-4 py-2 ml-6 rounded-md transition-colors bg-transparent text-gray-400 hover:text-white">
          <span className="text-sm">
            {sortBy === 'newest' ? 'Latest' : 'Top'}
          </span>
          <ChevronDown className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setSortBy('newest')}
          >
            <span>Latest</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setSortBy('most-voted')}
          >
            <span>Top</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
