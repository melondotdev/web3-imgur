import { imageCacheService } from '@/lib/services/cache/cache-service';
import { useCallback, useState } from 'react';

export function useImagePreload() {
  const [loadedImages, setLoadedImages] = useState<Map<string, string>>(
    new Map(),
  );

  const preloadImage = useCallback((imageUrl: string) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }, []);

  const handleImageLoad = useCallback((postId: string, imageUrl: string) => {
    setLoadedImages((prev) => {
      const newMap = new Map(prev);
      newMap.set(postId, imageUrl);
      return newMap;
    });
    // Cache the image URL
    imageCacheService.set(postId, imageUrl);
  }, []);

  return {
    loadedImages,
    preloadImage,
    handleImageLoad,
  };
}
