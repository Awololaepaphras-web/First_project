
import React, { useState, useMemo } from 'react';
import { User, UserAnalytics } from '../types';
// Fixed missing 'Users' import from lucide-react
import { 
  Clock, Navigation, MousePointerClick, TrendingUp, 
  Activity, Calendar, ChevronDown, Trophy, Zap, 
  BarChart3, Layout, Heart, MessageSquare, Repeat2, Home, Users
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface IncomeAnalysisProps {
  user: User;
  analytics: UserAnalytics[];
}

type TimeRange = 'Day' | 'Week' | 'Month' | 'Year';

const IncomeAnalysis: React.FC<IncomeAnalysisProps> = ({ user, analytics }) => {
  const [range, setRange] = useState<TimeRange>('Day');
  const navigate = useNavigate();

  const processedData = useMemo(() => {
    if (analytics.length === 0) return [
        { date: 'Mon', timeSpentMinutes: 120, navigations: 45 },
        { date: 'Tue', timeSpentMinutes: 80, navigations: 30 },
        { date: 'Wed', timeSpentMinutes: 200, navigations: 85 },
        { date: 'Thu', timeSpentMinutes: 150, navigations: 60 },
        { date: 'Fri', timeSpentMinutes: 300, navigations: 120 },
    ];
    return analytics;
  }, [analytics, range]);

  const stats = [
      { label: 'Likes Given', val: user.engagementStats?.totalLikesGiven || 0, icon: <Heart className="w-5 h-5 text-red-500" /> },
      { label: 'Social Reposts', val: user.engagementStats?.totalRepostsGiven || 0, icon: <Repeat2 className="w-5 h-5 text-green-500" /> },
      { label: 'Link Clicks', val: user.engagementStats?.totalLinkClicks || 0, icon: <Activity className="w-5 h-5 text-orange-500" /> },
      // Fixed: added 'Users' icon to lucide-react imports above
      { label: 'Profile Visits', val: user.engagementStats?.totalProfileClicks || 0, icon: <Users className="w-5 h-5 text-brand-primary" /> }
  ];

  return (
    <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-primary/30">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 border border-brand-primary/20">
              <Activity className="w-4 h-4" /> PERFORMANCE MATRIX
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Income Analysis</h1>
            <p className="text-brand-muted font-medium italic">Synchronizing neural impact across temporal horizons.</p>
          </div>
          
          <div className="flex bg-brand-card p-1.5 rounded-2xl shadow-2xl border border-brand-border">
            {(['Day', 'Week', 'Month', 'Year'] as TimeRange[]).map(t => (
              <button key={t} onClick={() => setRange(t)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${range === t ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-muted hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
           {stats.map((s, i) => (
             <div key={i} className="bg-brand-card p-8 rounded-[2.5rem] border border-brand-border flex flex-col gap-4 shadow-2xl group hover:border-brand-proph transition-all">
                <div className="bg-brand-black p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform">{s.icon}</div>
                <div>
                   <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest leading-none mb-1">{s.label}</p>
                   <p className="text-3xl font-black italic tracking-tighter">{s.val}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="bg-brand-card p-10 rounded-[3rem] border border-brand-border shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700"><Trophy className="w-48 h-48" /></div>
           <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-10 flex items-center gap-3"><Trophy className="w-8 h-8 text-yellow-500" /> Milestone Tracking</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
             <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-brand-muted"><span>Usage (2000h)</span><span className="text-brand-primary italic">{((user.lifetimeMinutes || 0) / 60).toFixed(1)}h</span></div>
                <div className="h-2 bg-brand-black rounded-full overflow-hidden border border-brand-border"><div className="h-full bg-brand-primary shadow-[0_0_10px_#1d9bf0] transition-all duration-1000" style={{ width: `${Math.min(100, ((user.lifetimeMinutes || 0) / 120000) * 100)}%` }} /></div>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-brand-muted"><span>Navigations (1000)</span><span className="text-purple-500 italic">{user.lifetimeNavigations || 0}</span></div>
                <div className="h-2 bg-brand-black rounded-full overflow-hidden border border-brand-border"><div className="h-full bg-purple-500 shadow-[0_0_10px_#a855f7] transition-all duration-1000" style={{ width: `${Math.min(100, ((user.lifetimeNavigations || 0) / 1000) * 100)}%` }} /></div>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-brand-muted"><span>Tasks (50)</span><span className="text-brand-proph italic">{(user.completedTasks || []).length}</span></div>
                <div className="h-2 bg-brand-black rounded-full overflow-hidden border border-brand-border"><div className="h-full bg-brand-proph shadow-[0_0_10px_#00ba7c] transition-all duration-1000" style={{ width: `${Math.min(100, ((user.completedTasks || []).length / 50) * 100)}%` }} /></div>
             </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-32">
          <div className="bg-brand-card p-10 rounded-[3rem] border border-brand-border shadow-2xl h-[500px] flex flex-col"><h3 className="font-black text-xl italic uppercase flex items-center gap-3 mb-8 tracking-tighter"><Navigation className="w-6 h-6 text-purple-500" /> Active Nodes</h3><div className="flex-grow"><ResponsiveContainer width="100%" height="100%"><BarChart data={processedData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2f3336" /><XAxis dataKey="date" stroke="#71767b" fontSize={10} tickLine={false} axisLine={false} /><YAxis stroke="#71767b" fontSize={10} tickLine={false} axisLine={false} /><Tooltip cursor={{fill: '#2f3336'}} contentStyle={{ backgroundColor: '#161616', borderRadius: '20px', border: '1px solid #2f3336', color: 'white' }} /><Bar dataKey="navigations" fill="#a855f7" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
          <div className="bg-brand-card p-10 rounded-[3rem] border border-brand-border shadow-2xl h-[500px] flex flex-col"><h3 className="font-black text-xl italic uppercase flex items-center gap-3 mb-8 tracking-tighter"><Clock className="w-6 h-6 text-brand-primary" /> Active Engagement</h3><div className="flex-grow"><ResponsiveContainer width="100%" height="100%"><AreaChart data={processedData}><defs><linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1d9bf0" stopOpacity={0.4}/><stop offset="95%" stopColor="#1d9bf0" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2f3336" /><XAxis dataKey="date" stroke="#71767b" fontSize={10} tickLine={false} axisLine={false} /><YAxis stroke="#71767b" fontSize={10} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ backgroundColor: '#161616', borderRadius: '20px', border: '1px solid #2f3336', color: 'white' }} /><Area type="monotone" dataKey="timeSpentMinutes" stroke="#1d9bf0" fill="url(#colorTime)" strokeWidth={4} /></AreaChart></ResponsiveContainer></div></div>
        </div>
      </div>
      
      <div className="fixed bottom-24 right-10 flex gap-4 animate-fade-in lg:bottom-10 lg:right-20">
         <button onClick={() => navigate('/dashboard')} className="bg-white text-black font-black px-10 py-4 rounded-full text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-brand-proph transition-all active:scale-95" title="User Dashboard"><Home className="w-4 h-4 inline mr-2" /> Main Terminal</button>
      </div>
    </div>
  );
};

export default IncomeAnalysis;
