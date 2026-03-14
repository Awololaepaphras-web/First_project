
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Volume2, VolumeX, GripHorizontal, Maximize2, Minimize2, ChevronRight, ChevronLeft } from 'lucide-react';

const StudyTimer: React.FC = () => {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 300, y: window.innerHeight - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive && seconds > 0) {
      timerRef.current = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0) {
      setSeconds(25 * 60);
      alert("Neural Rest Cycle Initialized.");
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, seconds]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    dragOffset.current = { x: clientX - position.x, y: clientY - position.y };
  };

  useEffect(() => {
    const move = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setPosition({ 
        x: Math.max(10, Math.min(window.innerWidth - (isCollapsed ? 50 : 250), clientX - dragOffset.current.x)),
        y: Math.max(10, Math.min(window.innerHeight - 80, clientY - dragOffset.current.y))
      });
    };
    const up = () => setIsDragging(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [isDragging, isCollapsed]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    if (newCollapsed) {
        setPosition(prev => ({ ...prev, x: window.innerWidth - 45 }));
    } else {
        setPosition(prev => ({ ...prev, x: window.innerWidth - 280 }));
    }
  };

  return (
    <div 
      onDoubleClick={handleDoubleClick}
      className={`fixed z-[999] transition-all duration-300 ${isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'} ${isCollapsed ? 'hover:translate-x-0 translate-x-[70%]' : ''}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      title="Double-tap to dock right"
    >
      <div className={`bg-brand-black/90 backdrop-blur-xl rounded-full border border-brand-border p-2 flex items-center shadow-2xl transition-all ${isCollapsed ? 'gap-2 pr-4 bg-brand-proph border-brand-proph' : 'gap-4 pr-3'}`}>
        <div onMouseDown={handleMouseDown} onTouchStart={handleMouseDown} className={`p-2 transition-colors ${isCollapsed ? 'text-black' : 'text-brand-muted hover:text-white'}`}>
          <GripHorizontal className="w-5 h-5" />
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-brand-proph text-black animate-pulse' : isCollapsed ? 'bg-black text-brand-proph' : 'bg-brand-card text-brand-muted'}`}>
          <Timer className="w-5 h-5" />
        </div>
        {!isCollapsed && (
          <>
            <div className="flex flex-col pr-2 border-r border-brand-border">
              <span className="text-[8px] font-black text-brand-muted uppercase tracking-widest leading-none mb-0.5 italic">Study Pulse</span>
              <span className="text-xl font-black text-white font-mono tracking-tighter leading-none">{formatTime(seconds)}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={(e) => { e.stopPropagation(); setIsActive(!isActive); }} className="p-2 text-brand-proph hover:bg-brand-proph/10 rounded-full transition-all" title={isActive ? 'Pause' : 'Start'}>
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); setSeconds(25*60); setIsActive(false); }} className="p-2 text-brand-muted hover:text-white transition-all" title="Reset"><RotateCcw className="w-4 h-4" /></button>
            </div>
          </>
        )}
        {isCollapsed && <ChevronLeft className="w-4 h-4 text-black animate-pulse" />}
      </div>
    </div>
  );
};

export default StudyTimer;
