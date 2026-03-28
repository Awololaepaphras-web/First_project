
import React from 'react';
import { 
  Trophy, Zap, Wallet, Users, ArrowLeft, 
  CheckCircle2, Database, Swords, 
  TrendingUp, ShieldCheck, DollarSign, Award,
  Sparkles, Star, ArrowRight, Megaphone, Info, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SystemConfig } from '../types';

interface EarnManualProps {
  config: SystemConfig;
}

const EarnManual: React.FC<EarnManualProps> = ({ config }) => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Contribution Bounties',
      icon: <Database className="w-8 h-8 text-brand-proph" />,
      desc: 'Synchronize academic intel with the federal grid. Upload verified past questions or handouts to earn instant point allocations.',
      points: `${config.earnRates.contribution} pts per Approved Upload`,
      status: 'High Priority',
      details: 'Points are awarded after admin verification of the document quality and relevance.'
    },
    {
      title: 'Referral Network',
      icon: <Users className="w-8 h-8 text-blue-500" />,
      desc: 'Build your scholar downline. Multi-stage point rewards for every student you link to the Proph ecosystem.',
      points: `Up to ${config.earnRates.referral} pts per Referral`,
      status: 'Exponential',
      details: 'Earn 10 points on signup, 10 points for 4-day login streak, and 60 points on their first withdrawal.'
    },
    {
      title: 'Ad Revenue Sharing',
      icon: <Megaphone className="w-8 h-8 text-orange-500" />,
      desc: 'The core of our economy. Users are paid based on the total ads deployed across the platform. Your share of the monthly ad revenue pool is directly proportional to your accumulated Prophy Points.',
      points: 'Ad Pool % based on Prophy Points',
      status: 'Passive Yield',
      details: 'Requires monetization eligibility (1,000 followers + 2.5M impressions in 3 months).'
    },
    {
      title: 'Arena Commissions',
      icon: <Swords className="w-8 h-8 text-purple-500" />,
      desc: 'Host specialized study hub arenas. Earn commissions from the pool for every gladiator who completes your challenge.',
      points: `${config.earnRates.arena}% Commission`,
      status: 'Commission',
      details: 'Commissions are deducted from the total bounty pool of the arena you host.'
    },
    {
      title: 'Bounty Board Tasks',
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      desc: 'Complete specific institutional actions, surveys, or verifications to claim one-time point drops.',
      points: 'Varies (10 - 200 pts)',
      status: 'Active',
      details: 'Check the Tasks section daily for new high-reward opportunities.'
    },
    {
      title: 'Engagement Dividends',
      icon: <TrendingUp className="w-8 h-8 text-green-500" />,
      desc: 'High-frequency interaction yields institutional dividends. The top performers with the highest engagement metrics every month receive a bonus commission percentage of global ad revenue.',
      points: 'Bonus Ad Revenue %',
      status: 'Monthly Performance',
      details: `Likes: ${config.engagementWeights.likes}pt, Replies: ${config.engagementWeights.replies}pt, Reposts: ${config.engagementWeights.reposts}pt.`
    }
  ];

  return (
    <div className="min-h-screen bg-brand-black text-white py-16 px-4 sm:px-6 lg:px-8 selection:bg-brand-proph/30">
      <div className="max-w-5xl mx-auto space-y-16">
        
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-brand-muted hover:text-white font-black text-[11px] uppercase tracking-widest transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Main Terminal
        </button>

        <div className="text-center space-y-6">
           <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-brand-proph/10 text-brand-proph text-xs font-black uppercase tracking-[0.3em] animate-fade-in border border-brand-proph/20">
              <DollarSign className="w-4 h-4" /> Scholarly Monetization Protocol
           </div>
           <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
              EARN <br /><span className="text-brand-proph">HANDBOOK</span>
           </h1>
           <p className="max-w-2xl mx-auto text-xl text-brand-muted font-medium italic">
             "Your academic effort is a commodity. We provide the infrastructure to monetize your scholarship."
           </p>
        </div>

        {/* Currency Conversion Card */}
        <div className="bg-brand-card p-10 rounded-[4rem] border border-brand-border shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-1000"><Wallet className="w-64 h-64" /></div>
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="space-y-4 text-center md:text-left">
                 <h3 className="text-3xl font-black italic uppercase">Purse Valuation</h3>
                 <p className="text-brand-muted font-bold max-w-sm italic">Points are converted to Naira at a fixed institutional rate. Your War Chest balance is always visible in the dashboard.</p>
              </div>
              <div className="bg-brand-black p-8 rounded-[3rem] border border-brand-border flex items-center gap-8 shadow-inner">
                 <div className="text-center">
                    <p className="text-4xl font-black italic">100</p>
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mt-1">Points</p>
                 </div>
                 <div className="text-brand-proph"><ArrowRight className="w-8 h-8" /></div>
                 <div className="text-center">
                    <p className="text-4xl font-black italic">₦{(100 * config.nairaPerPoint).toLocaleString()}</p>
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mt-1">Naira</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {sections.map((section, idx) => (
             <div key={idx} className="bg-brand-card p-12 rounded-[3.5rem] border border-brand-border hover:border-brand-proph transition-all group flex flex-col justify-between shadow-xl">
                <div className="space-y-6">
                   <div className="flex justify-between items-start">
                      <div className="bg-brand-black p-5 rounded-2xl border border-brand-border group-hover:scale-110 transition-transform">
                         {section.icon}
                      </div>
                      <span className="bg-brand-proph/10 text-brand-proph px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-brand-proph/20">
                         {section.status}
                      </span>
                   </div>
                   <h4 className="text-2xl font-black italic uppercase tracking-tight text-white">{section.title}</h4>
                   <p className="text-brand-muted font-medium italic leading-relaxed">{section.desc}</p>
                   {section.details && (
                     <p className="text-[10px] text-brand-muted/60 font-medium italic mt-2 flex items-center gap-2">
                       <Info className="w-3 h-3" /> {section.details}
                     </p>
                   )}
                </div>
                <div className="mt-10 pt-8 border-t border-brand-border flex justify-between items-center">
                   <p className="text-lg font-black text-brand-proph italic">{section.points}</p>
                   <button className="p-3 bg-brand-black border border-brand-border rounded-2xl text-white hover:bg-brand-proph hover:text-black transition-all">
                      <ArrowRight className="w-5 h-5" />
                   </button>
                </div>
             </div>
           ))}
        </div>

        {/* Premium Perk Card */}
        <div className="bg-gradient-to-r from-brand-proph to-emerald-600 p-12 rounded-[4rem] text-black shadow-2xl flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden group">
           <div className="absolute right-0 top-0 p-10 opacity-10 group-hover:scale-110 transition-transform"><Star className="w-48 h-48" /></div>
           <div className="space-y-4 relative z-10 max-w-xl">
              <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">THE PROPH+ EDGE</h3>
              <p className="font-bold leading-relaxed">Verified Premium nodes receive a 20% point boost on all contribution bounties and higher referral multipliers. Elevate your status to maximize earnings.</p>
           </div>
           <button 
            onClick={() => navigate('/premium')}
            className="bg-black text-white px-10 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl relative z-10 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
           >
              Upgrade Status <Award className="w-5 h-5" />
           </button>
        </div>

        {/* Withdrawal Notice */}
        <div className="p-10 bg-brand-card rounded-[3rem] border border-brand-border text-center space-y-6">
           <div className="flex justify-center gap-4">
              <ShieldCheck className="w-10 h-10 text-brand-proph" />
              <CheckCircle2 className="w-10 h-10 text-blue-500" />
              <Sparkles className="w-10 h-10 text-yellow-500" />
           </div>
           <h3 className="text-2xl font-black uppercase italic">Withdrawal Protocol</h3>
           <p className="text-brand-muted max-w-2xl mx-auto font-medium italic">
             All rewards are verified through the Institutional Payout Flow. Payouts are processed within 48 operational cycles after a withdrawal request is authenticated. Minimum withdrawal: 1,000 points.
           </p>
           <div className="flex flex-col items-center gap-4">
              <button 
                onClick={() => navigate('/withdraw')}
                className="px-12 py-4 bg-white text-black rounded-full font-black uppercase text-xs tracking-widest hover:bg-brand-proph transition-all shadow-xl"
              >
                Initialize Purse Payout
              </button>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-muted">
                <ShieldCheck className="w-3 h-3 text-brand-proph" /> Secured by Paystack Infrastructure
              </div>
           </div>
        </div>

        <footer className="py-20 border-t border-brand-border text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-muted italic opacity-50">
             &copy; 2025 THE PROPH MONETIZATION PROTOCOL V3.0
           </p>
        </footer>
      </div>
    </div>
  );
};

export default EarnManual;
