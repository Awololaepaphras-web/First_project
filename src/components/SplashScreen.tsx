
import React, { useEffect, useState } from 'react';
import { SplashConfig } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  config: SplashConfig;
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ config, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, config.duration);

    return () => clearTimeout(timer);
  }, [config.duration, onComplete]);

  if (!config.isEnabled) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center p-6"
          style={{ backgroundColor: config.backgroundColor || '#000000' }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center space-y-6 text-center"
          >
            {config.logoUrl ? (
              <img 
                src={config.logoUrl} 
                alt="App Logo" 
                className="w-32 h-32 object-contain animate-pulse"
              />
            ) : (
              <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
                <span className="text-4xl font-black text-white italic">P</span>
              </div>
            )}
            
            <div className="space-y-2">
              <h1 
                className="text-5xl font-black tracking-tighter uppercase italic"
                style={{ color: config.textColor || '#ffffff' }}
              >
                {config.title || 'PROPH'}
              </h1>
              <p 
                className="text-sm font-medium tracking-widest uppercase opacity-60"
                style={{ color: config.textColor || '#ffffff' }}
              >
                {config.subtitle || 'Academic Node & Past Questions Hub'}
              </p>
            </div>

            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-8">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: config.duration / 1000, ease: "linear" }}
                className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              />
            </div>
          </motion.div>

          <div className="absolute bottom-10 text-[10px] font-black uppercase tracking-[0.3em] opacity-30 text-white">
            Initializing Academic Node...
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
