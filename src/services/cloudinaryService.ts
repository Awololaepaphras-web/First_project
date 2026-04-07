
export const CloudinaryService = {
  async resizeImage(file: File, maxWidth = 1200, maxHeight = 1200): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas to Blob conversion failed'));
            },
            'image/jpeg',
            0.7 // Decrease resolution/quality to 70%
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  },

  async uploadFile(file: File | string, type: 'image' | 'video' | 'raw' | 'auto' = 'auto'): Promise<string> {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || import.meta.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || import.meta.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'prophs_cloud';

    if (!cloudName) {
      console.error('Cloudinary configuration missing. Please set VITE_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.');
      if (typeof file === 'string') return file;
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file as File);
      });
    }

    let fileToUpload: File | Blob | string = file;
    
    // Decrease resolution before storage if it's an image
    if (file instanceof File && file.type.startsWith('image/')) {
      try {
        fileToUpload = await this.resizeImage(file);
      } catch (err) {
        console.warn('Image resizing failed, uploading original:', err);
      }
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Cloudinary upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  },

  async uploadStatus(file: File): Promise<string> {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || import.meta.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = 'status_upload'; // Unsigned preset for statuses

    if (!cloudName) {
      throw new Error('Cloudinary configuration missing.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const type = file.type.startsWith('video/') ? 'video' : 'image';
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Cloudinary status upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  },

  // High-Quality AI Fetch
  getStatusThumbnail(url: string): string {
    if (!url || !url.includes('cloudinary.com')) return url;
    // w_400,c_fill,g_auto,q_auto:eco
    return url.replace('/upload/', '/upload/w_400,c_fill,g_auto,q_auto:eco/');
  },

  getStatusHDRestore(url: string, isVideo: boolean): string {
    if (!url || !url.includes('cloudinary.com')) return url;
    if (isVideo) {
      // q_auto:best,e_sharpen
      return url.replace('/upload/', '/upload/q_auto:best,e_sharpen/');
    }
    // e_upscale,e_gen_restore
    return url.replace('/upload/', '/upload/e_upscale,e_gen_restore/');
  },

  // Increase back (optimize/upscale) when fetching
  getOptimizedUrl(url: string): string {
    if (!url || !url.includes('cloudinary.com')) return url;
    // Inject transformations: q_auto (auto quality), f_auto (auto format), e_upscale (AI upscale)
    return url.replace('/upload/', '/upload/q_auto,f_auto,e_upscale/');
  }
};
