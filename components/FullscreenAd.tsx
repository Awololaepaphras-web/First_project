
import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ShieldCheck, Timer, Volume2 } from 'lucide-react';
import { Advertisement } from '../types';

interface FullscreenAdProps {
  ad: Advertisement;
  onClose: () => void;
}

const FullscreenAd: React.FC<FullscreenAdProps> = ({ ad, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(ad.duration);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCanClose(true);
    }
  }, [timeLeft]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-10 animate-in fade-in duration-500">
      {/* Top Bar Info */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent z-50">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg border border-white/10 backdrop-blur-md">
            <ShieldCheck className="w-5 h-5 text-green-50" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Sponsored Content</p>
            <p className="text-sm font-black text-white leading-none">{ad.title}</p>
          </div>
        </div>
        
        {!canClose ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
            <Timer className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="text-xs font-black text-white uppercase tracking-widest">Available in {timeLeft}s</span>
          </div>
        ) : (
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-600 text-white font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-900/40 animate-in zoom-in"
          >
            Continue to Study <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="w-full max-w-5xl h-full flex items-center justify-center relative group">
        {ad.type === 'image' ? (
          <img 
            src={ad.mediaUrl} 
            alt={ad.title} 
            className="max-h-[80vh] w-auto max-w-full rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] border-4 border-white/10 object-contain"
          />
        ) : (
          <div className="relative w-full flex items-center justify-center">
            <video 
              src={ad.mediaUrl} 
              autoPlay 
              muted 
              loop 
              playsInline
              className="max-h-[80vh] w-auto max-w-full rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] border-4 border-white/10"
            />
            {!canClose && (
              <div className="absolute bottom-6 right-6 bg-black/40 backdrop-blur-md px-3 py-2 rounded-xl flex items-center gap-2 pointer-events-none">
                <Volume2 className="w-4 h-4 text-gray-400" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Muted for UX</span>
              </div>
            )}
          </div>
        )}

        {/* Call to Action Overlay (Visible when time is up) */}
        {canClose && ad.link && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-in slide-in-from-bottom-6 duration-700">
            <a 
              href={ad.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-transform shadow-2xl"
            >
              Explore Insight <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {/* Progress Bar (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
        <div 
          className="h-full bg-blue-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_#3b82f6]"
          style={{ width: `${((ad.duration - timeLeft) / ad.duration) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default FullscreenAd;
