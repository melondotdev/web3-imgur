import { imageCacheService } from '@/lib/services/cache/cache-service';
import { useEffect, useState } from 'react';

interface UseImageLoadingProps {
  imageUrl: string | undefined;
  postId: string | undefined;
  loadedImages?: Map<string, string>;
}

export function useImageLoading({
  imageUrl,
  postId,
  loadedImages,
}: UseImageLoadingProps) {
  const [isImageLoading, setIsImageLoading] = useState(false);

  useEffect(() => {
    if (!imageUrl || !postId) return;

    // Check loaded images first
    if (loadedImages?.has(postId)) {
      setIsImageLoading(false);
      return;
    }

    // Then check cache
    const cachedImage = imageCacheService.get(postId);
    if (cachedImage) {
      setIsImageLoading(false);
      return;
    }

    // If not cached, load the image
    setIsImageLoading(true);
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setIsImageLoading(false);
      // Update cache
      imageCacheService.set(postId, imageUrl);
    };
  }, [postId, imageUrl, loadedImages]);

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const getImageUrl = () => {
    if (!postId || !imageUrl) return '';
    return (
      loadedImages?.get(postId) || imageCacheService.get(postId) || imageUrl
    );
  };

  return {
    isImageLoading,
    handleImageLoad,
    getImageUrl,
  };
}
