import React, { useEffect, useState } from 'react';
import { Camera, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import { SupabaseService } from '../services/supabaseService';
import { motion, AnimatePresence } from 'motion/react';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

interface CloudinaryPostUploaderProps {
  onSuccess?: () => void;
  isParallel?: boolean;
}

export const CloudinaryPostUploader: React.FC<CloudinaryPostUploaderProps> = ({ 
  onSuccess, 
  isParallel = false 
}) => {
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Load Cloudinary script once
  useEffect(() => {
    if (!document.getElementById('cloudinary-upload-widget')) {
      const script = document.createElement('script');
      script.id = 'cloudinary-upload-widget';
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const openWidget = () => {
    if (!(window as any).cloudinary) {
      alert('Cloudinary SDK not loaded yet. Please wait a moment.');
      return;
    }

    const widget = (window as any).cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        sources: ['local', 'url', 'camera'],
        multiple: false,
        cropping: true,
        styles: {
          palette: {
            window: '#000000',
            windowBorder: '#333333',
            tabIcon: '#FFFFFF',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#10b981',
            action: '#10b981',
            inactiveTabIcon: '#E4EBF1',
            error: '#F44235',
            inProgress: '#0078FF',
            complete: '#20B832',
            sourceBg: '#000000'
          }
        }
      },
      (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          console.log('Done! Here is the image info: ', result.info);
          setImageUrl(result.info.secure_url);
          setIsUploading(false);
        } else if (error) {
          console.error('Upload Error:', error);
          setIsUploading(false);
        }
      }
    );

    setIsUploading(true);
    widget.open();
  };

  const handlePost = async () => {
    if (!message.trim() && !imageUrl) return;

    setIsPosting(true);
    try {
      // Save to Supabase using the updated createPostV2 RPC
      await SupabaseService.createPostV2(
        message,
        undefined, // mediaUrl (standard)
        imageUrl ? 'image' : undefined, // mediaType
        imageUrl || undefined, // image_url (our new specific column)
        undefined, // parentId
        isParallel
      );

      setMessage('');
      setImageUrl(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to create post:', err);
      alert('Failed to post. Check if you have enough points (30 required).');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-xl">
      <textarea
        className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 border-none outline-none resize-none min-h-[100px] text-lg"
        placeholder="What's happening in the universe?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <AnimatePresence>
        {imageUrl && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative mt-4 rounded-lg overflow-hidden border border-zinc-800"
          >
            <img src={imageUrl} alt="Upload preview" className="w-full h-auto max-h-64 object-cover" />
            <button 
              onClick={() => setImageUrl(null)}
              className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition-colors"
            >
              <Loader2 className="w-4 h-4 rotate-45" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={openWidget}
            disabled={isUploading}
            className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-all disabled:opacity-50"
            title="Upload Image"
          >
            {isUploading ? <Loader2 className="w-5 h-4 animate-spin" /> : <Camera className="w-5 h-5" />}
          </button>
          <button
            onClick={openWidget}
            disabled={isUploading}
            className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-all disabled:opacity-50"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handlePost}
          disabled={isPosting || (!message.trim() && !imageUrl)}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${
            isPosting || (!message.trim() && !imageUrl)
              ? 'bg-zinc-800 text-zinc-600'
              : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
          }`}
        >
          {isPosting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Post</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
