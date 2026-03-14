
import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { Advertisement } from '../types';

interface BannerAdProps {
  ad: Advertisement;
}

const BannerAd: React.FC<BannerAdProps> = ({ ad }) => {
  return (
    <div className="w-full bg-gray-900/40 border border-gray-800 rounded-[2rem] overflow-hidden group hover:border-brand-proph/30 transition-all">
      <div className="flex flex-col md:flex-row items-center gap-6 p-6">
        <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-black border border-gray-800 shrink-0">
          {ad.type === 'image' ? (
            <img src={ad.mediaUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
            <video src={ad.mediaUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
          )}
        </div>
        
        <div className="flex-grow space-y-3 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="px-2 py-0.5 rounded bg-brand-proph/10 text-brand-proph text-[8px] font-black uppercase tracking-widest border border-brand-proph/20">Sponsored</span>
            <ShieldCheck className="w-3 h-3 text-gray-500" />
          </div>
          <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">{ad.title}</h4>
          <p className="text-xs text-gray-400 font-medium italic line-clamp-2">{ad.description}</p>
        </div>

        <div className="shrink-0">
          <a 
            href={ad.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-proph hover:text-white transition-all active:scale-95"
          >
            Learn More <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default BannerAd;
