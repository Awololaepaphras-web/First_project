import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SoundService } from '../services/soundService';

interface Ripple {
  id: number;
  x: number;
  y: number;
  type: 'drop' | 'wave' | 'bubble';
}

export const WaterEffect: React.FC = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const addRipple = useCallback((x: number, y: number, type: 'drop' | 'wave' | 'bubble') => {
    const id = Date.now() + Math.random();
    setRipples(prev => [...prev, { id, x, y, type }]);
    
    if (type === 'drop') SoundService.playWaterDrop();
    if (type === 'wave') SoundService.playWave();
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 2000);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      addRipple(e.clientX, e.clientY, 'drop');
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      addRipple(touch.clientX, touch.clientY, 'drop');
    };

    let lastX = 0;
    let lastY = 0;
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const dist = Math.hypot(touch.clientX - lastX, touch.clientY - lastY);
      if (dist > 50) {
        addRipple(touch.clientX, touch.clientY, 'wave');
        lastX = touch.clientX;
        lastY = touch.clientY;
      }
    };

    let lastTap = 0;
    const handleDoubleTap = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTap < 300) {
        const touch = e.touches[0];
        addRipple(touch.clientX, touch.clientY, 'bubble');
      }
      lastTap = now;
    };

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchstart', handleDoubleTap);

    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleDoubleTap);
    };
  }, [addRipple]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ 
              scale: ripple.type === 'bubble' ? [1, 1.5, 0] : 4, 
              opacity: 0,
              y: ripple.type === 'bubble' ? -100 : 0
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: ripple.type === 'bubble' ? 1.5 : 1, ease: "easeOut" }}
            style={{
              position: 'absolute',
              left: ripple.x,
              top: ripple.y,
              width: ripple.type === 'bubble' ? 20 : 40,
              height: ripple.type === 'bubble' ? 20 : 40,
              marginLeft: ripple.type === 'bubble' ? -10 : -20,
              marginTop: ripple.type === 'bubble' ? -10 : -20,
              borderRadius: '50%',
              border: ripple.type === 'wave' ? '2px solid rgba(0, 186, 124, 0.3)' : '1px solid rgba(0, 186, 124, 0.5)',
              background: ripple.type === 'drop' ? 'radial-gradient(circle, rgba(0,186,124,0.2) 0%, transparent 70%)' : 
                         ripple.type === 'bubble' ? 'rgba(255,255,255,0.4)' : 'transparent',
              boxShadow: ripple.type === 'bubble' ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
