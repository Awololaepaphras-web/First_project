
import React, { useState } from 'react';
import { 
  Search, FileText, Share2, MessageSquareCode, Image as ImageIcon, 
  ChevronDown, Info, Layers, BookOpen, ExternalLink, Megaphone,
  Trophy, Star, Award, Clock, Brain, Upload, Users, Lock, ChevronRight,
  GraduationCap, Zap, LayoutGrid, List, Plus, Wallet, Database,
  Swords, Shield, Heart, Activity, Camera, Book, ListChecks, Coins, Flame, Repeat2
} from 'lucide-react';
import { User, PastQuestion, Announcement, Badge, Advertisement, SystemConfig, Post } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { CloudinaryService } from '../src/services/cloudinaryService';
import StatusPanel from '../src/components/StatusPanel';
import { motion } from 'motion/react';

interface DashboardProps {
  user: User;
  questions: PastQuestion[];
  posts: Post[];
  announcements?: Announcement[];
  activeBadges: Badge[];
  globalAds: Advertisement[];
  config: SystemConfig;
  onLike: (id: string) => void;
  onRepost: (id: string) => void;
  onComment: (id: string, text: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, questions, posts, announcements = [], activeBadges = [], 
  globalAds, config, onLike, onRepost, onComment 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const userUniId = user.university.toLowerCase();
  
  const filteredQuestions = questions.filter(q => {
    const matchesUni = q.universityId.toLowerCase() === userUniId || q.universityId === 'all';
    const matchesSearch = q.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesUni && matchesSearch && q.status === 'approved';
  });

  const services = [
    { name: 'AI Study Buddy', icon: <Brain className="w-5 h-5" />, path: '/ai-assistant', color: 'bg-emerald-500', desc: 'Neural synthesis' },
    { name: 'Squads', icon: <Users className="w-5 h-5" />, path: '/messages', color: 'bg-brand-proph', desc: 'Secure squad nodes' },
    { name: 'Study Hub', icon: <BookOpen className="w-5 h-5" />, path: '/study-hub', color: 'bg-green-600', desc: 'Exam prep' },
    { name: 'Gladiator Hub', icon: <Swords className="w-5 h-5" />, path: '/gladiator-hub', color: 'bg-green-600', desc: 'Arena challenges' },
    { name: 'Bounty Forge', icon: <ListChecks className="w-5 h-5" />, path: '/tasks', color: 'bg-yellow-500', desc: 'Earn rewards' },
    { name: 'Memory Bank', icon: <Database className="w-5 h-5" />, path: '/memory-bank', color: 'bg-purple-500', desc: 'Archival storage' },
    { name: 'Financial Hub', icon: <Wallet className="w-5 h-5" />, path: '/withdraw', color: 'bg-green-600', desc: 'Convert rewards' },
    { name: 'Earn Manual', icon: <Book className="w-5 h-5" />, path: '/earn-manual', color: 'bg-orange-500', desc: 'How to earn' },
  ];

  const approvedAds = globalAds.filter(ad => ad.status === 'active');

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-12 animate-fade-in pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
           <h1 className="text-4xl font-black tracking-tighter italic uppercase text-gray-900 dark:text-white">Scholar Mainframe</h1>
           <div className="flex items-center gap-3 mt-1">
             <p className="text-brand-muted font-medium italic">Status: <span className="text-brand-proph uppercase font-black relative inline-block">Online<span className="absolute inset-0 bg-brand-proph/20 blur-md animate-pulse -z-10" /></span> • {user.university} Integrated Node</p>
             <div className="w-1 h-1 rounded-full bg-brand-border" />
             <p className="text-brand-proph font-black uppercase tracking-widest text-[10px]">Proph ID: {user.referralCode}</p>
           </div>
        </div>
        <div className="flex gap-3">
           {(config.isUploadEnabled || user.role === 'admin') && (
             <button onClick={() => navigate('/upload')} className="bg-brand-proph text-black font-black px-8 py-3 rounded-full text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-brand-proph/20">
               <Plus className="w-4 h-4" /> Archive Intel
             </button>
           )}
           <button onClick={() => navigate('/community')} className="bg-gray-900 dark:bg-white dark:text-black text-white font-black px-8 py-3 rounded-full text-xs uppercase tracking-widest flex items-center gap-2 hover:brightness-110 transition-all shadow-xl">
             <MessageSquareCode className="w-4 h-4" /> Peer Link
           </button>
           <button onClick={() => navigate('/university-feed')} className="bg-brand-proph text-black font-black px-8 py-3 rounded-full text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-brand-proph/20">
             <GraduationCap className="w-4 h-4" /> Campus Node
           </button>
        </div>
      </div>

      {/* Retention Status Panel */}
      <StatusPanel currentUser={user} hideUpload={true} />

      {/* Metrics (Slidable on Mobile) */}
       <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-6 overflow-x-auto no-scrollbar snap-x p-1">
         {[
           { label: 'Daily Allowance', val: user.dailyPoints || 0, icon: <Flame className="w-6 h-6" />, color: 'text-brand-proph', sub: 'Renews 24h' },
           { label: 'Purse Balance', val: user.points || 0, icon: <Coins className="w-6 h-6" />, color: 'text-brand-proph', sub: 'Total Vault' },
           { label: 'Monetization Prophy Coins', val: user.monetization?.pointsEarned || 0, icon: <Star className="w-6 h-6" />, color: 'text-yellow-500' },
           { label: 'Global Standing', val: '#422', icon: <Trophy className="w-6 h-6" />, color: 'text-yellow-500' },
           { label: 'Archived Assets', val: filteredQuestions.length, icon: <Database className="w-6 h-6" />, color: 'text-brand-primary' },
         ].map(s => (
           <div key={s.label} className="bg-white dark:bg-brand-card border border-brand-border p-8 rounded-[2.5rem] flex items-center gap-6 shadow-xl group hover:border-brand-proph/50 transition-all flex-shrink-0 w-[85vw] sm:w-auto snap-center">
              <div className="bg-brand-border/30 dark:bg-brand-border p-4 rounded-2xl group-hover:scale-110 transition-transform">{React.cloneElement(s.icon, { className: `${s.color} w-7 h-7` })}</div>
              <div>
                 <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">{s.label}</p>
                 <p className="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white">{s.val}</p>
                 {(s as any).sub && <p className="text-[8px] font-black uppercase text-brand-proph mt-1 italic tracking-widest leading-none">{(s as any).sub}</p>}
              </div>
           </div>
         ))}
      </div>

      {/* Services Grid (Slidable on Mobile) */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-1">
           <h2 className="text-xl font-black italic uppercase tracking-widest flex items-center gap-2 text-gray-900 dark:text-white">
              <Zap className="w-5 h-5 text-brand-proph" /> Decoupled Services
           </h2>
           <span className="sm:hidden text-[10px] font-black text-brand-muted uppercase italic">Swipe &rarr;</span>
        </div>
        <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto no-scrollbar snap-x pb-4">
           {services.map(service => (
             <Link key={service.name} to={service.path} className="bg-white dark:bg-brand-card p-6 rounded-[2rem] border border-brand-border hover:border-brand-proph transition-all group flex flex-col items-center text-center shadow-lg flex-shrink-0 w-44 md:w-auto snap-start">
                <div className={`${service.color} text-white p-4 rounded-[1.5rem] mb-4 group-hover:rotate-12 transition-transform shadow-lg`}>
                   {service.icon}
                </div>
                <p className="font-black italic uppercase text-[10px] tracking-widest leading-none mb-1 text-gray-900 dark:text-white">{service.name}</p>
                <p className="text-[8px] font-medium text-brand-muted italic leading-tight">{service.desc}</p>
             </Link>
           ))}
        </div>
      </div>

      {approvedAds.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-black italic uppercase tracking-widest flex items-center gap-2 text-gray-900 dark:text-white px-1">
            <Megaphone className="w-5 h-5 text-brand-proph" /> Promoted Intel
          </h2>
          <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x pb-4">
            {approvedAds.map(ad => (
              <a 
                key={ad.id} 
                href={ad.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white dark:bg-brand-card rounded-[2.5rem] border border-brand-border overflow-hidden group hover:border-brand-proph transition-all flex-shrink-0 w-[85vw] sm:w-[400px] snap-center shadow-2xl"
              >
                <div className="aspect-video bg-brand-border/30 dark:bg-brand-border relative">
                  {ad.type === 'video' ? (
                    <video src={ad.mediaUrl} className="w-full h-full object-cover" muted loop autoPlay />
                  ) : (
                    <img src={CloudinaryService.getOptimizedUrl(ad.mediaUrl)} className="w-full h-full object-cover" alt={ad.title} />
                  )}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">
                    Sponsored
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase italic truncate">{ad.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-brand-proph font-black text-[10px] uppercase tracking-widest">
                    Learn More <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Parallel Universe Stream */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black italic uppercase tracking-widest flex items-center gap-2 text-gray-900 dark:text-white">
               <Activity className="w-5 h-5 text-brand-proph" /> Parallel Universe Stream
            </h2>
            <Link to="/community" className="text-[10px] font-black uppercase text-brand-proph hover:underline tracking-widest italic">View Infinite Stream &rarr;</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts
            .filter(p => !p.university || p.university === 'Global')
            .slice(0, 4)
            .map(post => (
              <div key={post.id} className="bg-white dark:bg-brand-card border border-brand-border p-6 rounded-[2rem] shadow-xl hover:border-brand-proph/30 transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <img src={post.userAvatar || `https://picsum.photos/seed/${post.userName}/200`} className="w-10 h-10 rounded-full border border-brand-border" alt="" referrerPolicy="no-referrer" />
                  <div className="min-w-0">
                    <p className="text-sm font-black text-gray-900 dark:text-white leading-none truncate">{post.userName}</p>
                    <p className="text-[10px] font-medium text-brand-muted mt-1 lowercase truncate">@{post.userNickname}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-4 italic leading-relaxed">"{post.content}"</p>
                <div className="flex items-center gap-6 pt-4 border-t border-brand-border">
                  <button onClick={() => onLike(post.id)} className="flex items-center gap-1.5 text-brand-muted hover:text-brand-proph transition-colors group/btn">
                    <Heart className={`w-4 h-4 ${(post.likes || []).includes(user.id) ? 'fill-brand-proph text-brand-proph' : ''} group-hover/btn:scale-110 transition-transform`} />
                    <span className="text-[10px] font-black tracking-widest">{(post.likes || []).length}</span>
                  </button>
                  <button onClick={() => navigate(`/post/${post.id}`)} className="flex items-center gap-1.5 text-brand-muted hover:text-brand-proph transition-colors group/btn">
                    <MessageSquareCode className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-[10px] font-black tracking-widest">{(post.comments || []).length}</span>
                  </button>
                  <button onClick={() => onRepost(post.id)} className="flex items-center gap-1.5 text-brand-muted hover:text-brand-proph transition-colors group/btn">
                    <Repeat2 className={`w-4 h-4 ${(post.reposts || []).includes(user.id) ? 'text-brand-proph stroke-[3px]' : ''} group-hover/btn:scale-110 transition-transform`} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-brand-border pb-6 mt-12">
         <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white">Vault Explorer</h2>
            <span className="bg-brand-proph/10 text-brand-proph px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-brand-proph/20">{user.university} ACCESS</span>
         </div>
         <div className="flex items-center gap-4">
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
               <input 
                placeholder="Find specific intel..." 
                className="bg-brand-border/30 dark:bg-brand-card border border-brand-border rounded-full py-3 pl-12 pr-6 text-xs font-bold focus:ring-1 focus:ring-brand-proph outline-none w-48 sm:w-64 shadow-inner text-gray-900 dark:text-white"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
               />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
         {filteredQuestions.map(q => (
           <div key={q.id} className="bg-white dark:bg-brand-card rounded-[2.5rem] border border-brand-border overflow-hidden group hover:border-brand-proph transition-all flex flex-col h-full shadow-2xl relative">
              <div className="aspect-video bg-brand-border/30 dark:bg-brand-border flex items-center justify-center relative overflow-hidden">
                 <FileText className="w-20 h-20 text-brand-muted opacity-10 group-hover:scale-110 transition-transform duration-500" />
                 <div className="absolute top-4 left-4 bg-brand-proph text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter italic shadow-lg">
                    {q.courseCode}
                 </div>
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 gap-3">
                    <button onClick={() => {
                        localStorage.setItem('proph_last_viewed_doc', q.id);
                        navigate('/study-hub');
                    }} className="bg-brand-proph text-black font-black px-8 py-3 rounded-full text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform active:scale-95">Open Archive</button>
                    <button onClick={() => navigate('/ai-assistant')} className="bg-white text-black font-black px-8 py-3 rounded-full text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform active:scale-95 flex items-center gap-2"><Brain className="w-3.5 h-3.5" /> Analyze AI</button>
                 </div>
              </div>
              <div className="p-8 flex-grow flex flex-col justify-between">
                 <div className="space-y-4">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight italic line-clamp-2 group-hover:text-brand-proph transition-colors">{q.courseTitle}</h3>
                    <div className="flex flex-wrap gap-2">
                       <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest bg-brand-border/30 dark:bg-brand-border px-3 py-1 rounded-full">{q.faculty}</span>
                       <span className="text-[9px] font-black text-brand-proph uppercase tracking-widest bg-brand-proph/5 px-3 py-1 rounded-full">{q.department}</span>
                    </div>
                 </div>
                 <div className="flex items-center justify-between pt-8 border-t border-brand-border mt-8">
                    <div className="flex items-center gap-2 text-brand-muted">
                       <Clock className="w-3.5 h-3.5" />
                       <span className="text-[10px] font-black uppercase tracking-widest">{q.year} Session</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <button className="p-2 text-brand-muted hover:text-brand-proph transition-colors"><Share2 className="w-4 h-4" /></button>
                       <button className="p-2 text-brand-muted hover:text-brand-proph transition-colors"><Heart className="w-4 h-4" /></button>
                    </div>
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default Dashboard;
