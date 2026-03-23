
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  logo?: string;
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ logo, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-black pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 1.2, 
              ease: "easeOut",
              scale: { type: "spring", damping: 15 }
            }}
            className="relative z-10 flex flex-col items-center gap-12"
          >
            <div className="w-64 h-64 md:w-80 md:h-80 relative">
              {/* Spinning Ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8 border border-blue-500/20 rounded-full border-dashed"
              />
              
              <div className="w-full h-full bg-gray-900 rounded-[3rem] p-8 shadow-2xl shadow-blue-500/20 border border-white/10 flex items-center justify-center overflow-hidden relative group">
                {logo ? (
                  <img src={logo} alt="Proph Logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/40">
                      <span className="text-4xl font-black text-white italic">P</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center space-y-4">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic text-white"
              >
                proph
              </motion.h1>
              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-blue-400 font-black uppercase text-xs tracking-[0.3em] ml-2"
              >
                Student Social Network
              </motion.p>
            </div>
          </motion.div>

          {/* Loading Bar */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-1 bg-gray-900 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)]"
            />
          </div>

          <div className="absolute bottom-10 text-[10px] font-black text-gray-600 uppercase tracking-widest">
            Initializing Academic Node...
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
