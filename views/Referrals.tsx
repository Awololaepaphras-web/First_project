
import React, { useState } from 'react';
import { User } from '../types';
import { 
  Users, Share2, Copy, CheckCircle2, TrendingUp, 
  MousePointer2, UserPlus, Wallet, Gift, ExternalLink,
  ChevronRight, Sparkles, BarChart3, Clock, Zap, ShieldCheck
} from 'lucide-react';

interface ReferralsProps {
  user: User;
}

const Referrals: React.FC<ReferralsProps> = ({ user }) => {
  const [copied, setCopied] = useState(false);
  
  const referralLink = `${window.location.origin}/#/signup?ref=${user.referralCode}`;
  const stats = user.referralStats || { clicks: 0, signups: 0, withdrawals: 0, loginStreaks: 0 };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Proph - Federal University Past Questions',
          text: 'Get access to thousands of Nigerian Federal University past questions and earn points!',
          url: referralLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-brand-proph/10 text-brand-proph text-[10px] font-black uppercase tracking-[0.3em] border border-brand-proph/20">
            <Gift className="w-4 h-4" />
            <span>Growth Bounty Terminal</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none italic uppercase">
            Recruit <span className="text-brand-proph">Peers</span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-500 font-medium text-lg italic">
            Expand the federal network and build your wealth. Multi-stage point rewards for every node you bring online.
          </p>
        </div>

        {/* Reward Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl flex flex-col items-center text-center group hover:border-brand-proph transition-all">
              <div className="w-16 h-16 bg-brand-proph/10 text-brand-proph rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <UserPlus className="w-8 h-8" />
              </div>
              <p className="text-3xl font-black italic text-gray-900">+10 pts</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Signup Reward</p>
              <p className="text-xs text-gray-500 mt-3 font-medium italic">Awarded upon successful account verification.</p>
           </div>
           
           <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl flex flex-col items-center text-center group hover:border-blue-500 transition-all">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <Clock className="w-8 h-8" />
              </div>
              <p className="text-3xl font-black italic text-gray-900">+10 pts/day</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Active Node Bonus</p>
              <p className="text-xs text-gray-500 mt-3 font-medium italic">Earn when referee logins daily for 4 days.</p>
           </div>

           <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl flex flex-col items-center text-center group hover:border-purple-500 transition-all">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <Zap className="w-8 h-8" />
              </div>
              <p className="text-3xl font-black italic text-gray-900">+60 pts</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Conversion Bounty</p>
              <p className="text-xs text-gray-500 mt-3 font-medium italic">Earned when referee makes first withdrawal.</p>
           </div>
        </div>

        {/* Referral Link UI */}
        <div className="bg-gray-900 p-8 md:p-14 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-proph/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 space-y-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                <Share2 className="w-10 h-10 text-brand-proph" />
              </div>
              <div>
                <h2 className="text-3xl font-black italic uppercase tracking-tight">Your Recruitment Signature</h2>
                <p className="text-gray-400 font-medium italic">Distribute this link to onboard new scholars into your downline.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow bg-white/5 border border-white/10 px-8 py-6 rounded-3xl text-xl font-bold text-gray-300 flex items-center overflow-hidden">
                <span className="truncate flex-grow opacity-60">{referralLink}</span>
                <button onClick={copyToClipboard} className="ml-4 p-3 bg-brand-proph rounded-2xl text-black hover:scale-110 transition-all shadow-xl shadow-brand-proph/20">
                  {copied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                </button>
              </div>
              <button 
                onClick={shareLink}
                className="bg-white text-black px-12 py-6 rounded-3xl font-black text-sm uppercase tracking-[0.2em] transition-all hover:bg-gray-200 flex items-center justify-center gap-3 shadow-2xl"
              >
                Broadcast Link <ExternalLink className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
              <h3 className="text-xl font-black text-gray-900 italic uppercase flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-brand-proph" />
                Live Network Performance
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Clicks</p>
                    <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.clicks}</p>
                 </div>
                 <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Scholars</p>
                    <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.signups}</p>
                 </div>
                 <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Streak Completions</p>
                    <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.loginStreaks}</p>
                 </div>
                 <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
                    <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Conversions</p>
                    <p className="text-4xl font-black text-green-700 tracking-tighter">{stats.withdrawals}</p>
                 </div>
              </div>
           </div>

           <div className="bg-gray-900 p-10 rounded-[3rem] text-white flex flex-col justify-between">
              <div className="space-y-6">
                 <h3 className="text-2xl font-black italic uppercase text-brand-proph">Growth Protocol</h3>
                 <p className="text-gray-400 text-sm font-medium leading-relaxed italic">
                    Points are automatically synchronized once verification checkpoints are met. Ensure your recruits complete their institutional node verification for rewards to activate.
                 </p>
                 <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 text-brand-proph flex-shrink-0" />
                    <div>
                       <p className="text-xs font-black uppercase tracking-widest text-brand-proph">Anti-Fraud Protection</p>
                       <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-1">
                          Our system monitors IP signatures and institutional identity to prevent Sybil attacks on the growth bounty pool.
                       </p>
                    </div>
                 </div>
              </div>
              <div className="pt-8 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                 <span>Recruitment Version 2.1</span>
                 <span className="text-brand-proph">Active Node: {user.university}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
