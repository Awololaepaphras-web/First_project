
import React, { useEffect, useRef } from 'react';

interface CloudinaryUploadWidgetProps {
  onSuccess: (url: string) => void;
  onClose?: () => void;
  folder?: string;
  buttonText?: string;
}

const CloudinaryUploadWidget: React.FC<CloudinaryUploadWidgetProps> = ({ 
  onSuccess, 
  onClose, 
  folder = 'community_posts',
  buttonText = 'Upload Media'
}) => {
  const cloudinaryRef = useRef<any>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically load Cloudinary Upload Widget script if not present
    if (!(window as any).cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      script.onload = () => initWidget();
      document.body.appendChild(script);
    } else {
      initWidget();
    }

    function initWidget() {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'proph_network';

      if (!cloudName) {
        console.error('Cloudinary Cloud Name missing!');
        return;
      }

      cloudinaryRef.current = (window as any).cloudinary;
      widgetRef.current = cloudinaryRef.current.createUploadWidget(
        {
          cloudName: cloudName,
          uploadPreset: uploadPreset,
          folder: folder,
          sources: ['local', 'url', 'camera'],
          multiple: false,
          clientAllowedFormats: ['png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'webm'],
          maxFileSize: 20000000, // 20MB
          styles: {
            palette: {
              window: '#000000',
              windowBorder: '#1e1e1e',
              tabIcon: '#00BA7C',
              menuIcons: '#5a5a5a',
              textDark: '#ffffff',
              textLight: '#ffffff',
              link: '#00BA7C',
              action: '#00BA7C',
              inactiveTabIcon: '#5a5a5a',
              error: '#ff4b4b',
              inProgress: '#00BA7C',
              complete: '#20B2AA',
              sourceBg: '#0a0a0a'
            }
          }
        },
        (error: any, result: any) => {
          if (!error && result && result.event === "success") {
            console.log('Done! Here is the image info: ', result.info);
            onSuccess(result.info.secure_url);
            if (onClose) onClose();
          }
        }
      );
    }

    return () => {
      // Cleanup? Not strictly necessary for this widget
    };
  }, [folder]);

  const openWidget = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    } else {
      alert('Cloudinary matrix initializing... Please retry in a moment.');
    }
  };

  return (
    <button
      onClick={openWidget}
      className="flex items-center gap-2 px-4 py-2 bg-brand-proph/10 text-brand-proph hover:bg-brand-proph/20 rounded-xl font-bold transition-all border border-brand-proph/20"
      type="button"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.587-1.587a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {buttonText}
    </button>
  );
};

export default CloudinaryUploadWidget;
