
import React from 'react';
import { GraduationCap } from 'lucide-react';

interface SplashScreenProps {
  logo?: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ logo }) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-brand-black flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="relative">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-brand-proph rounded-full blur-[60px] opacity-20 animate-pulse"></div>
        
        {/* Logo Container */}
        <div className="relative bg-brand-proph p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,186,124,0.3)] animate-bounce-slow">
          {logo ? (
            <img src={logo} alt="App Logo" className="w-24 h-24 object-contain" />
          ) : (
            <GraduationCap className="w-24 h-24 text-black" />
          )}
        </div>
      </div>
      
      <div className="mt-12 text-center space-y-4">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
          PROPH <span className="text-brand-proph">CORE</span>
        </h1>
        <div className="flex items-center gap-2 justify-center">
          <div className="w-2 h-2 bg-brand-proph rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-brand-proph rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-brand-proph rounded-full animate-bounce"></div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-muted animate-pulse">
          Synchronizing Academic Nodes
        </p>
      </div>
      
      <div className="absolute bottom-12 text-[8px] font-black uppercase tracking-widest text-brand-muted/30">
        Federal Network Alpha Node 2.0
      </div>
    </div>
  );
};

export default SplashScreen;
