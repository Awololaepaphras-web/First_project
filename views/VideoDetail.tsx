
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ThumbsUp, ThumbsDown, Share2, MoreHorizontal, 
  UserPlus, MessageCircle, Send, Play, List,
  ChevronRight, Award, ShieldCheck, Heart
} from 'lucide-react';
import { Video, User } from '../types';

interface VideoDetailProps {
  videos: Video[];
  user: User | null;
  onLike: (id: string) => void;
  onShare: (id: string) => void;
}

const VideoDetail: React.FC<VideoDetailProps> = ({ videos, user, onLike, onShare }) => {
  const { id } = useParams<{ id: string }>();
  const video = videos.find(v => v.id === id);
  const [comment, setComment] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  if (!video) return <div className="p-20 text-center font-black bg-brand-black min-h-screen text-white uppercase italic">Transmission Signal Lost</div>;

  const isLiked = user ? video.likes.includes(user.id) : false;

  const handleShare = async () => {
    onShare(video.id);
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Check out this scholarly transmission on Proph TV: ${video.title}`,
          url: window.location.href,
        });
      } catch (err) { console.error(err); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Encryption Link Copied to Dashboard.");
    }
  };

  return (
    <div className="bg-brand-black min-h-screen text-white py-8 px-4 lg:px-10 flex flex-col xl:flex-row gap-10">
      <div className="flex-grow space-y-6 min-w-0">
         <div className="relative aspect-video bg-black rounded-[3rem] overflow-hidden shadow-2xl group border-4 border-brand-border">
            <video 
              src={video.videoUrl} 
              className="w-full h-full object-contain" 
              controls 
              autoPlay
              poster={video.thumbnailUrl}
            />
         </div>

         <div className="space-y-6">
            <h1 className="text-3xl font-black text-white tracking-tighter leading-tight italic uppercase">{video.title}</h1>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-brand-border">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-brand-card rounded-full flex items-center justify-center font-black text-xl text-brand-muted border border-brand-border">
                     {video.userName.charAt(0)}
                  </div>
                  <div>
                     <p className="font-black text-white flex items-center gap-1.5 italic">
                        {video.userName}
                        <ShieldCheck className="w-4 h-4 text-brand-proph" />
                     </p>
                     <p className="text-[10px] font-black text-brand-proph uppercase tracking-widest">{video.dolzTag}</p>
                  </div>
                  <button 
                    onClick={() => setIsSubscribed(!isSubscribed)}
                    className={`ml-4 px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${isSubscribed ? 'bg-brand-card text-brand-muted' : 'bg-white text-black shadow-xl hover:bg-brand-proph'}`}
                  >
                    {isSubscribed ? 'Linked' : 'Link Node'}
                  </button>
               </div>

               <div className="flex items-center gap-2 bg-brand-card p-2 rounded-3xl border border-brand-border">
                  <button onClick={() => onLike(video.id)} className={`flex items-center gap-2 px-6 py-2.5 hover:bg-brand-border rounded-full transition-all font-black text-xs uppercase tracking-tighter border-r border-brand-border ${isLiked ? 'text-brand-proph' : 'text-white'}`}>
                     <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /> {video.likes.length}
                  </button>
                  <button onClick={handleShare} className="flex items-center gap-2 px-6 py-2.5 hover:bg-brand-border rounded-full transition-all font-black text-xs uppercase tracking-tighter">
                     <Share2 className="w-4 h-4" /> Share ({video.shares})
                  </button>
                  <button className="p-2.5 hover:bg-brand-border rounded-full transition-colors">
                     <MoreHorizontal className="w-5 h-5 text-brand-muted" />
                  </button>
               </div>
            </div>

            <div className="bg-brand-card rounded-[2rem] p-8 space-y-4 border border-brand-border">
               <div className="flex items-center gap-6 text-[11px] font-black text-white uppercase tracking-widest">
                  <span>{video.views.toLocaleString()} Views</span>
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  <span className="bg-brand-border px-3 py-1 rounded-lg text-brand-proph">#{video.category}</span>
               </div>
               <p className="text-sm text-gray-300 font-medium leading-relaxed italic">
                  {video.description || "No description provided for this academic transmission."}
               </p>
            </div>
         </div>

         <div className="space-y-8 pt-10">
            <h3 className="text-xl font-black text-white flex items-center gap-3 italic uppercase">
               <MessageCircle className="w-6 h-6 text-brand-muted" /> Signal Reponse
            </h3>
            
            <div className="flex gap-4">
               <div className="w-12 h-12 bg-brand-card rounded-full flex-shrink-0 border border-brand-border" />
               <div className="flex-grow space-y-4">
                  <textarea 
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Enter scholarly discourse..."
                    className="w-full bg-transparent border-b-2 border-brand-border focus:border-brand-proph transition-colors py-2 text-sm font-medium outline-none resize-none text-white"
                  />
                  <div className="flex justify-end gap-3">
                     <button onClick={() => setComment('')} className="px-6 py-2 rounded-full text-xs font-black text-brand-muted hover:bg-brand-card uppercase tracking-widest">Cancel</button>
                     <button className="bg-brand-proph text-black px-8 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-proph/20">Transmit</button>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <aside className="xl:w-[400px] flex-shrink-0 space-y-8">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] flex items-center gap-2 italic">
               <Award className="w-4 h-4 text-brand-proph" /> Neural Feed
            </h3>
         </div>

         <div className="space-y-6">
            {videos.filter(v => v.id !== id).slice(0, 5).map(v => (
              <Link key={v.id} to={`/video/${v.id}`} className="flex gap-4 group">
                 <div className="w-40 aspect-video rounded-2xl overflow-hidden bg-brand-card flex-shrink-0 shadow-sm relative border border-brand-border">
                    <img src={v.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                    <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-black text-white">12:05</div>
                 </div>
                 <div className="space-y-1 min-w-0">
                    <h4 className="text-sm font-black text-white leading-tight line-clamp-2 group-hover:text-brand-proph transition-colors italic uppercase">{v.title}</h4>
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mt-1">{v.userName}</p>
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-tighter">{v.views.toLocaleString()} Views</p>
                 </div>
              </Link>
            ))}
         </div>
      </aside>
    </div>
  );
};

export default VideoDetail;
