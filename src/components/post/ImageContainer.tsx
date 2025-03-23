import { cn } from '@/lib/utils/cn';

interface ImageContainerProps {
  imageUrl: string;
  isImageLoading: boolean;
  onImageLoad: () => void;
}

export const ImageContainer = ({
  imageUrl,
  isImageLoading,
  onImageLoad,
}: ImageContainerProps) => {
  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center">
      {isImageLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/30" />
        </div>
      )}
      <img
        src={imageUrl}
        alt="post content"
        className={cn(
          'max-w-[90%] max-h-[90%] w-auto h-auto object-contain',
          'drop-shadow-2xl',
          'transition-opacity duration-200',
          isImageLoading && 'opacity-0',
        )}
        onLoad={onImageLoad}
      />
    </div>
  );
};
