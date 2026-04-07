
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface VideoEmbedProps {
  content: string;
}

const VideoEmbed: React.FC<VideoEmbedProps> = ({ content }) => {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [platform, setPlatform] = useState<'youtube' | 'tiktok' | null>(null);
  const [previewEnded, setPreviewEnded] = useState(false);

  useEffect(() => {
    // YouTube Regex
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = content.match(youtubeRegex);
    if (youtubeMatch) {
      setEmbedUrl(`https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0&start=0&end=30`);
      setPlatform('youtube');
      return;
    }

    // TikTok Regex
    const tiktokRegex = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com\/@[\w.-]+\/video\/|vm\.tiktok\.com\/)(\d+)/;
    const tiktokMatch = content.match(tiktokRegex);
    if (tiktokMatch) {
      setEmbedUrl(`https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`);
      setPlatform('tiktok');
      return;
    }

    setEmbedUrl(null);
    setPlatform(null);
  }, [content]);

  useEffect(() => {
    if (embedUrl) {
      const timer = setTimeout(() => {
        setPreviewEnded(true);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [embedUrl]);

  if (!embedUrl) return null;

  return (
    <div className="mt-3 rounded-2xl overflow-hidden border border-brand-border bg-black aspect-video relative">
      {!previewEnded ? (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video Player"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
          <div className="w-12 h-12 bg-brand-proph/20 rounded-full flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-brand-proph" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest mb-1">Preview Ended</p>
          <p className="text-[10px] text-gray-500 font-medium">30-second scholarly preview complete.</p>
        </div>
      )}
      <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[8px] font-black text-white uppercase tracking-widest pointer-events-none">
        30s Preview Mode
      </div>
    </div>
  );
};

export default VideoEmbed;
