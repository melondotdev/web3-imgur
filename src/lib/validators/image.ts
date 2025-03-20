import {
  ACCEPTED_IMAGE_TYPES,
  type AcceptedImageType,
  MAX_FILE_SIZE,
  type UploadInput,
} from '../types/upload';

export function isValidImageFile(file: UploadInput): boolean {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return false;
  }

  // Check mimetype
  return ACCEPTED_IMAGE_TYPES.includes(file.mimetype as AcceptedImageType);
}
