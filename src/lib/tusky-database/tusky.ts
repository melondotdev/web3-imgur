import * as tus from 'tus-js-client';

export function uploadImageUsingTus(image: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(image, {
      endpoint: 'https://api.tusky.io/uploads/',
      headers: {
        'Api-Key': import.meta.env.VITE_TUSKY_API_KEY || '',
      },
      metadata: {
        filename: image.name,
        filetype: image.type,
        vaultId: import.meta.env.VITE_TUSKY_VAULT_ID,
      },
      onError: (error) => {
        console.error('Upload failed:', error.message);
        reject(error);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(`Progress: ${percentage}% (${bytesUploaded}/${bytesTotal} bytes)`);
      },
      onSuccess: () => {
        console.log('Upload completed successfully!');
        // upload.url contains the location of the uploaded file.
        if (!upload.url) {
          reject(new Error('Upload URL is null'));
          return;
        }
        resolve(upload.url);
      },
    });
    
    upload.start();
  });
}
