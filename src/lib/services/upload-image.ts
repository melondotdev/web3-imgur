import { getEnv } from '@/lib/config/env';
import { Upload } from 'tus-js-client';

type UploadInput = {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  size: number;
};

export function uploadImage(image: UploadInput): Promise<string> {
  return new Promise((resolve, reject) => {
    const env = getEnv();

    // Configure tus upload
    const upload = new Upload(image.buffer, {
      endpoint: 'https://api.tusky.io/uploads/',
      headers: {
        'Api-Key': env.TUSKY_API_KEY,
      },
      metadata: {
        filename: image.filename,
        filetype: image.mimetype,
        vaultId: env.TUSKY_VAULT_ID,
      },
      uploadSize: image.size,
      onError: (error) => {
        console.error('Upload failed:', error.message);
        reject(error);
      },
      onSuccess: () => {
        console.log('Upload completed successfully!');
        if (!upload.url) {
          reject(new Error('Upload URL is null'));
          return;
        }
        const fileId = upload.url.split('/').pop();
        const fileUrl = `https://api.tusky.io/files/${fileId}/data`;
        resolve(fileUrl);
      },
      // Add these options for better control
      removeFingerprintOnSuccess: true,
      overridePatchMethod: false,
      retryDelays: [0, 1000, 3000, 5000],
    });

    upload.start();
  });
}
