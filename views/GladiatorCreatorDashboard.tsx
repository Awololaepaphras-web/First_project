
import React from 'react';
import { User } from '../types';
import { Swords, Wallet, TrendingUp, Users, Award, Play, ChevronRight, BarChart3, Star, Clock, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GladiatorCreatorDashboardProps {
  user: User;
}

const GladiatorCreatorDashboard: React.FC<GladiatorCreatorDashboardProps> = ({ user }) => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Earnings', val: `₦${(user.gladiatorEarnings || 0).toLocaleString()}`, icon: <Wallet className="w-6 h-6 text-green-600" /> },
    { label: 'Arenas Hosted', val: user.arenaHistory?.length || 0, icon: <Swords className="w-6 h-6 text-green-600" /> },
    { label: 'Scholar Impact', val: '2.4k', icon: <Users className="w-6 h-6 text-orange-600" /> },
    { label: 'Growth Rating', val: '94%', icon: <TrendingUp className="w-6 h-6 text-purple-600" /> }
  ];

  return (
    <div className="min-h-screen bg-brand-black text-white py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
           <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest mb-4 border border-green-500/20">
                 <Star className="w-4 h-4" /> Creator Portal Alpha
              </div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">Command Studio</h1>
              <p className="text-brand-muted font-medium italic">Monetize your academic archives through professional arenas.</p>
           </div>
           <button 
            onClick={() => navigate('/gladiator-hub/arena')}
            className="px-10 py-5 bg-green-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-green-500/20 hover:bg-green-700 transition-all flex items-center gap-3"
           >
              Initialize Arena <Play className="w-4 h-4 fill-current" />
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {stats.map((s, i) => (
             <div key={i} className="bg-brand-card p-8 rounded-[3rem] border border-brand-border space-y-4 shadow-xl">
                <div className="p-4 bg-brand-black rounded-2xl w-fit border border-brand-border">{s.icon}</div>
                <div>
                   <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{s.label}</p>
                   <p className="text-3xl font-black mt-1 italic tracking-tighter text-white">{s.val}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-brand-card rounded-[3.5rem] border border-brand-border overflow-hidden shadow-2xl">
              <div className="p-10 border-b border-brand-border flex justify-between items-center bg-brand-black/50">
                 <h3 className="text-xl font-black uppercase italic flex items-center gap-3"><Clock className="w-5 h-5 text-green-500" /> Recent Arenas</h3>
                 <button className="text-[10px] font-black text-brand-muted uppercase tracking-widest hover:text-green-500 transition-colors">View Archive</button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-brand-black text-[10px] font-black text-brand-muted uppercase tracking-widest">
                       <tr>
                          <th className="p-8">Arena Identity</th>
                          <th className="p-8">Scroll Type</th>
                          <th className="p-8 text-center">Peers</th>
                          <th className="p-8 text-right">Revenue</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                       {[1, 2, 3].map(i => (
                         <tr key={i} className="hover:bg-brand-black/50 transition-colors group cursor-pointer">
                            <td className="p-8 font-mono font-black text-green-500">#HUB-42{i}</td>
                            <td className="p-8 font-black uppercase text-xs text-brand-muted font-bold italic">Past Question {i} Archive</td>
                            <td className="p-8 text-center font-black text-white">42</td>
                            <td className="p-8 text-right font-black text-green-500">₦1,420</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           <div className="bg-green-600 p-12 rounded-[4rem] text-white shadow-[0_20px_60px_rgba(22,163,74,0.2)] flex flex-col justify-between group overflow-hidden relative border border-green-500/30">
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700"><Trophy className="w-64 h-64" /></div>
              <div className="space-y-6 relative z-10">
                 <h4 className="text-3xl font-black uppercase italic leading-none">Elite Status</h4>
                 <p className="font-bold leading-relaxed opacity-90 italic">You are in the top 10% of creators. Host 2 more high-engagement arenas to unlock the "Master Archivist" bounty bonus.</p>
              </div>
              <div className="pt-10 space-y-4 relative z-10">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span>Rank Progress</span>
                    <span>72%</span>
                 </div>
                 <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white transition-all duration-1000" style={{ width: '72%' }} />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GladiatorCreatorDashboard;
