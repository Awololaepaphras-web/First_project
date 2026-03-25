
import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { 
  TrendingUp, DollarSign, Users, Activity, 
  ShieldCheck, Zap, BarChart3, PieChart as PieChartIcon,
  ArrowUpRight, Info, CheckCircle2, Lock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { useNavigate } from 'react-router-dom';

interface AdRevenueSharingProps {
  user: User;
}

const AdRevenueSharing: React.FC<AdRevenueSharingProps> = ({ user }) => {
  const navigate = useNavigate();
  const [isEnrolled, setIsEnrolled] = useState(user.isPremium || false);

  // Mock data for the revenue pool
  const revenueData = [
    { day: 'Mon', amount: 4500 },
    { day: 'Tue', amount: 5200 },
    { day: 'Wed', amount: 4800 },
    { day: 'Thu', amount: 6100 },
    { day: 'Fri', amount: 5900 },
    { day: 'Sat', amount: 7200 },
    { day: 'Sun', amount: 6800 },
  ];

  const distributionData = [
    { name: 'User Share', value: 40, color: '#00ba7c' },
    { name: 'Platform Maintenance', value: 30, color: '#1d9bf0' },
    { name: 'Institutional Grants', value: 20, color: '#a855f7' },
    { name: 'Reserve Fund', value: 10, color: '#71767b' },
  ];

  const userStats = {
    estimatedEarnings: (user.points || 0) * 0.15, // Mock calculation
    sharePercentage: user.isPremium ? '0.045%' : '0.012%',
    activeNodes: 12,
    rank: 'Alpha Node'
  };

  const eligibility = {
    followers: { current: user.followers?.length || 0, target: 1000, pointsTarget: 700 },
    impressions: { current: user.monetization?.impressionsLast3Months || 0, target: 2500000 },
  };

  const isEligibleForPoints = eligibility.followers.current >= eligibility.followers.pointsTarget;
  const isMonetized = eligibility.followers.current >= eligibility.followers.target && 
                     eligibility.impressions.current >= eligibility.impressions.target;

  const handlePayout = async (amount: number) => {
    try {
      const response = await fetch('/api/monetization/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount,
          bankDetails: user.bankDetails
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Payout of ₦${amount.toLocaleString()} requested successfully!`);
        window.location.reload();
      } else {
        alert(data.error || "Payout failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-brand-black text-black dark:text-white py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-proph/30">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-proph/10 text-brand-proph text-[10px] font-black uppercase tracking-[0.2em] mb-2 border border-brand-proph/20">
              <DollarSign className="w-4 h-4" /> REVENUE SYNDICATE
            </div>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none text-gray-900 dark:text-white">Ad Revenue <span className="text-brand-proph">Sharing</span></h1>
            <p className="text-brand-muted font-medium italic">Monetize your neural contributions through the Federal Ad Stream.</p>
          </div>
          
          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Points Earned</p>
                <p className="text-2xl font-black text-yellow-500 italic">{user.monetization?.pointsEarned || 0} PTS</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Pending Balance</p>
                <p className="text-2xl font-black text-brand-proph italic">₦{(user.monetization?.pendingBalanceNGN || 0).toLocaleString()}</p>
              </div>
            </div>
            {user.monetization?.pendingBalanceNGN && user.monetization.pendingBalanceNGN >= 5000 ? (
              <button 
                onClick={() => handlePayout(user.monetization!.pendingBalanceNGN)}
                className="bg-brand-proph text-black px-8 py-3 rounded-full font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shadow-brand-proph/20"
              >
                Request Payout
              </button>
            ) : (
              <div className="text-[9px] font-black text-brand-muted uppercase tracking-widest italic">Min. Payout: ₦5,000</div>
            )}
          </div>
        </div>

        {/* Eligibility Progress */}
        <div className="bg-brand-border/20 dark:bg-brand-card p-10 rounded-[3rem] border border-brand-border shadow-2xl space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-gray-900 dark:text-white">
              <Activity className="w-6 h-6 text-brand-proph" /> Eligibility Matrix
            </h3>
            <div className="flex gap-3">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isEligibleForPoints ? 'bg-yellow-500/20 text-yellow-500' : 'bg-brand-border text-brand-muted'}`}>
                {isEligibleForPoints ? 'Points Active' : 'Points Locked'}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isMonetized ? 'bg-brand-proph/20 text-brand-proph' : 'bg-red-500/20 text-red-500'}`}>
                {isMonetized ? 'Monetization Active' : 'Monetization Locked'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-brand-muted">
                  <span>Followers (Points at 700, Full at 1000)</span>
                  <span className="text-brand-proph italic">{eligibility.followers.current} / {eligibility.followers.target}</span>
                </div>
                <div className="h-2 bg-brand-border dark:bg-brand-black rounded-full overflow-hidden border border-brand-border relative">
                  <div className="h-full bg-brand-proph shadow-[0_0_10px_#00ba7c] transition-all duration-1000" style={{ width: `${Math.min(100, (eligibility.followers.current / eligibility.followers.target) * 100)}%` }} />
                  <div className="absolute top-0 left-[70%] w-0.5 h-full bg-yellow-500/50" title="Points Threshold"></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-brand-muted">
                  <span>Impressions (Last 3 Months)</span>
                  <span className="text-brand-primary italic">{eligibility.impressions.current.toLocaleString()} / {eligibility.impressions.target.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-brand-border dark:bg-brand-black rounded-full overflow-hidden border border-brand-border">
                  <div className="h-full bg-brand-primary shadow-[0_0_10px_#1d9bf0] transition-all duration-1000" style={{ width: `${Math.min(100, (eligibility.impressions.current / eligibility.impressions.target) * 100)}%` }} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-brand-border/30 dark:bg-brand-black/40 rounded-3xl border border-brand-border space-y-4">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Monetization Status</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium italic">Points Eligibility</span>
                    {isEligibleForPoints ? <CheckCircle2 className="w-4 h-4 text-brand-proph" /> : <Lock className="w-4 h-4 text-brand-muted" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium italic">Ad Revenue Sharing</span>
                    {isMonetized ? <CheckCircle2 className="w-4 h-4 text-brand-proph" /> : <Lock className="w-4 h-4 text-brand-muted" />}
                  </div>
                  <p className="text-[9px] text-brand-muted italic leading-relaxed">
                    Once eligible for points, you earn 1 point for every ₦100 of calculated ad revenue. Full monetization enables direct Naira payouts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Estimated Monthly Yield', val: `₦${userStats.estimatedEarnings.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5 text-brand-proph" />, trend: '+12.4%' },
            { label: 'Network Share', val: userStats.sharePercentage, icon: <Activity className="w-5 h-5 text-brand-primary" />, trend: 'Stable' },
            { label: 'Active Ad Nodes', val: userStats.activeNodes, icon: <Users className="w-5 h-5 text-purple-500" />, trend: '+2' },
            { label: 'Syndicate Rank', val: userStats.rank, icon: <ShieldCheck className="w-5 h-5 text-yellow-500" />, trend: 'Top 5%' }
          ].map((s, i) => (
            <div key={i} className="bg-brand-border/20 dark:bg-brand-card p-8 rounded-[2.5rem] border border-brand-border space-y-4 shadow-2xl group hover:border-brand-proph transition-all">
              <div className="flex justify-between items-start">
                <div className="bg-brand-border/30 dark:bg-brand-black p-4 rounded-2xl group-hover:scale-110 transition-transform">{s.icon}</div>
                <span className="text-[10px] font-bold text-brand-proph bg-brand-proph/10 px-2 py-1 rounded-lg">{s.trend}</span>
              </div>
              <div>
                <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest leading-none mb-1">{s.label}</p>
                <p className="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white">{s.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Trend */}
          <div className="lg:col-span-2 bg-brand-border/20 dark:bg-brand-card p-10 rounded-[3rem] border border-brand-border shadow-2xl h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-xl italic uppercase flex items-center gap-3 tracking-tighter text-gray-900 dark:text-white">
                <BarChart3 className="w-6 h-6 text-brand-proph" /> Network Revenue Stream
              </h3>
              <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Last 7 Cycles</div>
            </div>
            <div className="flex-grow">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ba7c" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00ba7c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2f3336" />
                  <XAxis dataKey="day" stroke="#71767b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71767b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₦${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161616', borderRadius: '20px', border: '1px solid #2f3336', color: 'white' }}
                    itemStyle={{ color: '#00ba7c' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#00ba7c" fill="url(#colorRev)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Pie */}
          <div className="bg-brand-border/20 dark:bg-brand-card p-10 rounded-[3rem] border border-brand-border shadow-2xl h-[500px] flex flex-col">
            <h3 className="font-black text-xl italic uppercase flex items-center gap-3 mb-8 tracking-tighter text-gray-900 dark:text-white">
              <PieChartIcon className="w-6 h-6 text-brand-primary" /> Distribution
            </h3>
            <div className="flex-grow relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161616', borderRadius: '20px', border: '1px solid #2f3336', color: 'white' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-2xl font-black italic text-gray-900 dark:text-white">40%</p>
                  <p className="text-[8px] font-black text-brand-muted uppercase">User Pool</p>
                </div>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              {distributionData.map((d, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[10px] font-bold text-brand-muted uppercase">{d.name}</span>
                  </div>
                  <span className="text-[10px] font-black italic text-gray-900 dark:text-white">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-brand-border/20 dark:bg-brand-card p-12 rounded-[4rem] border border-brand-border shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700"><Info className="w-48 h-48" /></div>
          <div className="max-w-3xl space-y-8 relative z-10">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white">The Monetization Protocol</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-proph/10 text-brand-proph rounded-xl flex items-center justify-center font-black">01</div>
                  <h4 className="font-black uppercase italic text-sm text-gray-900 dark:text-white">Contribution Weight</h4>
                </div>
                <p className="text-brand-muted text-sm font-medium italic leading-relaxed">Your share is calculated based on the quality and engagement of your uploaded past questions and study materials.</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center font-black">02</div>
                  <h4 className="font-black uppercase italic text-sm text-gray-900 dark:text-white">Engagement Dividends</h4>
                </div>
                <p className="text-brand-muted text-sm font-medium italic leading-relaxed">The top 10 users with the highest engagement metrics every month receive a commission percentage of global ad revenue by transferring their points.</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center font-black">03</div>
                  <h4 className="font-black uppercase italic text-sm text-gray-900 dark:text-white">Ad Revenue Pool</h4>
                </div>
                <p className="text-brand-muted text-sm font-medium italic leading-relaxed">40% of all platform ad revenue is distributed back to active contributors every 30-day cycle.</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center font-black">04</div>
                  <h4 className="font-black uppercase italic text-sm text-gray-900 dark:text-white">Proph+ Multiplier</h4>
                </div>
                <p className="text-brand-muted text-sm font-medium italic leading-relaxed">Premium nodes receive a 3x multiplier on all revenue distributions and priority syndicate ranking.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="pb-32 flex flex-col md:flex-row gap-6">
          <div className="flex-grow bg-gradient-to-r from-brand-proph/20 to-transparent p-10 rounded-[3rem] border border-brand-proph/20 flex items-center justify-between">
            <div className="space-y-2">
              <h4 className="text-xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white">Ready to scale your impact?</h4>
              <p className="text-brand-muted text-sm font-medium italic">Upgrade to Proph+ for maximum revenue sharing potential.</p>
            </div>
            <button onClick={() => navigate('/premium')} className="bg-brand-proph text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:brightness-110 transition-all">Go Premium</button>
          </div>
          <button onClick={() => navigate('/dashboard')} className="px-10 py-4 bg-white dark:bg-brand-card border border-brand-border rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-gray-900 dark:text-white">Return to Terminal</button>
        </div>
      </div>
    </div>
  );
};

export default AdRevenueSharing;
