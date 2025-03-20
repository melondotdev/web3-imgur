const CACHE_PREFIX = 'web3-imgur-cache-';
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour in milliseconds

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export const cacheService = {
  set: <T>(key: string, data: T) => {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to set cache:', error);
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(CACHE_PREFIX + key);
      if (!item) {
        return null;
      }

      const parsed = JSON.parse(item) as CacheItem<T>;
      if (Date.now() - parsed.timestamp > CACHE_EXPIRY) {
        cacheService.clear(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.warn('Failed to get cache:', error);
      return null;
    }
  },

  clear: (key: string) => {
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  },
};

// Add image-specific cache functions
export const imageCacheService = {
  set: (postId: string, imageUrl: string) => {
    const key = `image-${postId}`;
    cacheService.set(key, imageUrl);
  },

  get: (postId: string): string | null => {
    const key = `image-${postId}`;
    return cacheService.get(key);
  },
};
