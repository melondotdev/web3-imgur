import { Upload } from 'tus-js-client';

export function uploadImageUsingTus(image: File): Promise<string> {
  if (
    !process.env.NEXT_PUBLIC_TUSKY_API_KEY ||
    !process.env.NEXT_PUBLIC_TUSKY_VAULT_ID
  ) {
    throw new Error('Missing Tusky API configuration');
  }

  return new Promise((resolve, reject) => {
    const upload = new Upload(image, {
      endpoint: 'https://api.tusky.io/uploads/',
      headers: {
        'Api-Key': process.env.NEXT_PUBLIC_TUSKY_API_KEY,
        'Tus-Resumable': '1.0.0',
        'Upload-Metadata': {
          filename: image.name,
          filetype: image.type,
          vaultId: process.env.NEXT_PUBLIC_TUSKY_VAULT_ID,
        },
        'Upload-Length': image.size,
      },
      onError: (error) => {
        console.error('Upload failed:', error.message);
        reject(error);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(
          `Progress: ${percentage}% (${bytesUploaded}/${bytesTotal} bytes)`,
        );
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
    });

    upload.start();
  });
}
