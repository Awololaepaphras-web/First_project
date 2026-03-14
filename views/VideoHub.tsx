
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, Search, Filter, PlayCircle, Clock, Eye, TrendingUp, MoreVertical, Play, PlusCircle, Camera, Tv, Heart, Share2 } from 'lucide-react';
import { Video as VideoType } from '../types';

interface VideoHubProps {
  videos: VideoType[];
}

const VideoHub: React.FC<VideoHubProps> = ({ videos }) => {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const categories = ['All', 'Mathematics', 'Engineering', 'Campus Life', 'Social', 'Medicine', 'Handouts'];

  const filteredVideos = videos.filter(v => {
    const matchesCategory = filter === 'All' || v.category === filter;
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-brand-black min-h-screen pb-32">
      <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3"><Tv className="w-8 h-8 text-brand-youtube" /> Proph TV</h1>
            <p className="text-brand-muted font-medium text-sm italic">Visual intelligence from scholars across the federal network.</p>
         </div>
         <div className="flex gap-3">
            <button onClick={() => navigate('/video/upload')} className="bg-brand-proph text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-proph/20 flex items-center gap-2" title="Upload Video">
               <PlusCircle className="w-4 h-4" /> Upload
            </button>
            <button onClick={() => navigate('/gladiator-hub/creator')} className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-2" title="Creator Dashboard">
               <Camera className="w-4 h-4" /> Studio
            </button>
         </div>
      </div>

      <div className="sticky top-[53px] bg-brand-black/95 backdrop-blur-md z-30 px-6 py-3 border-b border-brand-border overflow-x-auto no-scrollbar flex items-center justify-between gap-6">
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                filter === cat ? 'bg-white text-black' : 'bg-brand-card text-white hover:bg-brand-border'
              }`}
              title={`Filter by ${cat}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative hidden sm:block">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted w-4 h-4" />
           <input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search TV..." 
            className="bg-brand-card border border-brand-border rounded-full py-2 pl-11 pr-4 text-xs font-bold text-white focus:ring-1 focus:ring-brand-proph outline-none w-64" 
           />
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
        {filteredVideos.map(video => (
          <Link key={video.id} to={`/video/${video.id}`} className="flex flex-col gap-3 group" title={`Watch ${video.title}`}>
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-brand-card border border-brand-border">
              <img src={video.thumbnailUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300 opacity-80" alt="" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                 <Play className="text-white opacity-0 group-hover:opacity-100 scale-150 transition-all fill-current" />
              </div>
              <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-tighter">
                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <div className="flex gap-3">
               <div className="w-10 h-10 bg-brand-border rounded-xl flex-shrink-0 flex items-center justify-center font-black text-brand-muted border border-white/5">{video.userName.charAt(0)}</div>
               <div className="min-w-0">
                  <h3 className="font-black text-white text-sm leading-snug line-clamp-2 uppercase italic">{video.title}</h3>
                  <div className="mt-1 flex items-center gap-2 text-[10px] font-black text-brand-muted uppercase">
                    <span>{video.userName}</span>
                    <span>•</span>
                    <span>{video.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-brand-muted">
                     <div className="flex items-center gap-1"><Heart className="w-3 h-3" /> <span className="text-[10px] font-black">{video.likes.length}</span></div>
                     <div className="flex items-center gap-1"><Share2 className="w-3 h-3" /> <span className="text-[10px] font-black">{video.shares}</span></div>
                     <div className="text-[10px] font-black text-brand-proph ml-auto">{video.dolzTag}</div>
                  </div>
               </div>
            </div>
          </Link>
        ))}
        {filteredVideos.length === 0 && (
           <div className="col-span-full py-40 text-center space-y-6">
              <Video className="w-20 h-20 text-brand-muted mx-auto opacity-20" />
              <h3 className="text-2xl font-black text-brand-muted uppercase italic">No Transmissions Found</h3>
              <p className="text-brand-muted max-w-xs mx-auto font-medium">Be the first to contribute scholarly visual intel.</p>
              <button onClick={() => navigate('/video/upload')} className="bg-brand-proph text-black px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">Setup Transmission</button>
           </div>
        )}
      </div>
    </div>
  );
};

export default VideoHub;
