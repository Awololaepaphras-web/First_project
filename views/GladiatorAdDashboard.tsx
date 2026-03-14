
import React, { useState } from 'react';
import { User } from '../types';
import { Target, Layout, TrendingUp, MousePointer2, Plus, Users, ChevronRight, BarChart3, Globe, ShieldCheck } from 'lucide-react';
import { UNIVERSITIES } from '../constants';

interface GladiatorAdDashboardProps {
  user: User;
}

const GladiatorAdDashboard: React.FC<GladiatorAdDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'ended'>('active');

  const stats = [
    { label: 'Institutional Views', val: '142.5k', icon: <Users className="w-5 h-5" /> },
    { label: 'Campus CTR', val: '4.8%', icon: <MousePointer2 className="w-5 h-5" /> },
    { label: 'Investment', val: '₦45,000', icon: <TrendingUp className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-brand-black text-white py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
           <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest mb-4 border border-green-500/20">
                 <Target className="w-4 h-4" /> Advertiser Console
              </div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">Campaign Matrix</h1>
              <p className="text-brand-muted font-medium italic">Reach scholars in all federal institutions with surgical precision.</p>
           </div>
           <button className="px-10 py-5 bg-green-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-green-500/20 hover:bg-green-700 transition-all flex items-center gap-3">
              Deploy New Asset <Plus className="w-4 h-4" />
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {stats.map((s, i) => (
             <div key={i} className="bg-brand-card p-10 rounded-[3.5rem] border border-brand-border space-y-4 group hover:border-green-500/30 transition-all shadow-xl">
                <div className="p-4 bg-brand-black rounded-2xl w-fit border border-brand-border text-green-500 group-hover:scale-110 transition-transform">{s.icon}</div>
                <div>
                   <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{s.label}</p>
                   <p className="text-4xl font-black mt-1 italic text-white">{s.val}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="bg-brand-card rounded-[3.5rem] border border-brand-border overflow-hidden shadow-2xl">
           <div className="p-10 border-b border-brand-border flex justify-between items-center bg-brand-black/50">
              <div className="flex bg-brand-black p-1 rounded-2xl border border-brand-border">
                 {(['active', 'pending', 'ended'] as const).map(t => (
                   <button 
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' : 'text-brand-muted hover:text-green-500'}`}
                   >
                     {t}
                   </button>
                 ))}
              </div>
              <div className="flex items-center gap-4 text-brand-muted">
                 <Globe className="w-5 h-5" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Proph Network</span>
              </div>
           </div>

           <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[1, 2].map(i => (
                   <div key={i} className="bg-brand-black p-8 rounded-[3rem] border border-brand-border space-y-6 group hover:border-green-500/50 transition-all shadow-sm">
                      <div className="flex justify-between items-start">
                         <div className="space-y-1">
                            <h4 className="text-xl font-black italic uppercase text-white">Institution Campaign {i}</h4>
                            <p className="text-[9px] font-black text-green-500 uppercase tracking-[0.2em]">Nodes: UNILAG, UI, OAU, FUNAAB</p>
                         </div>
                         <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-green-500/20">Live</span>
                      </div>
                      
                      <div className="aspect-video bg-brand-card rounded-[2rem] overflow-hidden border border-brand-border relative">
                         <img src={`https://picsum.photos/seed/ad${i+10}/600/340`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Layout className="w-12 h-12 text-white/10" />
                         </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-brand-border">
                         <div>
                            <p className="text-[8px] font-black text-brand-muted uppercase mb-1">Clicks</p>
                            <p className="text-lg font-black italic text-white">842</p>
                         </div>
                         <div>
                            <p className="text-[8px] font-black text-brand-muted uppercase mb-1">CTR</p>
                            <p className="text-lg font-black italic text-green-500">4.2%</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[8px] font-black text-brand-muted uppercase mb-1">Cost</p>
                            <p className="text-lg font-black italic text-white">₦4,2k</p>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="p-12 bg-green-600 rounded-[4rem] text-white flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl shadow-green-500/20 relative overflow-hidden group border border-green-500/30">
           <div className="absolute right-0 top-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-700"><ShieldCheck className="w-48 h-48" /></div>
           <div className="max-w-xl space-y-4 relative z-10">
              <h3 className="text-4xl font-black italic uppercase tracking-tighter">Optimization Protocol</h3>
              <p className="text-green-50 font-bold leading-relaxed italic">Boost your AdScore by including academic-relevant content. Higher AdScores guarantee first-row placement in high-traffic study arenas.</p>
           </div>
           <button className="bg-white text-green-600 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl relative z-10 flex items-center gap-2 hover:scale-105 transition-transform">
              Refine Campaign <ChevronRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default GladiatorAdDashboard;
