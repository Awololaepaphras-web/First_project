
import React from 'react';
import { Link } from 'react-router-dom';
import { Swords, Shield, Trophy, Users, ArrowRight, Zap, Target, BookOpen, Sparkles, Star, ChevronRight } from 'lucide-react';
import { User } from '../types';

interface GladiatorLandingProps {
  user: User | null;
}

const GladiatorLanding: React.FC<GladiatorLandingProps> = ({ user }) => {
  return (
    <div className="min-h-screen bg-brand-black text-white selection:bg-green-500/30">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
           <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] animate-pulse" />
           <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-green-500/10 text-green-400 text-xs font-black uppercase tracking-[0.3em] animate-fade-in border border-green-500/20">
             <Sparkles className="w-4 h-4" /> The Neural Arena is Open
          </div>

          <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-none text-white">
            Gladiator <span className="text-green-500">Hub</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-brand-muted font-medium italic">
            "Train Your Mind. Conquer the Arena. Claim the 1000-Point Bounty."
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
            <Link 
              to={user ? "/gladiator-hub/arena" : "/signup"}
              className="w-full sm:w-auto px-12 py-6 bg-green-600 text-white rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(22,163,74,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              <Swords className="w-6 h-6" /> {user ? "Host Arena" : "Enter Arena"}
            </Link>
            <Link 
              to="/gladiator-hub/vault"
              className="w-full sm:w-auto px-12 py-6 bg-brand-card border-2 border-brand-border text-white rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] hover:bg-white/5 transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              <BookOpen className="w-6 h-6 text-green-500" /> Study Vault
            </Link>
          </div>
        </div>
      </section>

      {/* Guide Section */}
      <section className="py-32 bg-brand-card border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="p-10 bg-brand-black rounded-[3rem] border border-brand-border shadow-sm space-y-6 group hover:border-green-500/30 transition-all">
                 <div className="w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform">
                    <Shield className="w-8 h-8" />
                 </div>
                 <h3 className="text-2xl font-black uppercase italic">1. Host & Deploy</h3>
                 <p className="text-brand-muted leading-relaxed font-medium italic">Upload any academic document. Our AI extracts the core intel and forges 15 lethal questions.</p>
              </div>

              <div className="p-10 bg-brand-black rounded-[3rem] border border-brand-border shadow-sm space-y-6 group hover:border-green-500/30 transition-all">
                 <div className="w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform">
                    <Users className="w-8 h-8" />
                 </div>
                 <h3 className="text-2xl font-black uppercase italic">2. Engage Peers</h3>
                 <p className="text-brand-muted leading-relaxed font-medium italic">Gladiators join using your Arena Code. Compete in real-time as the AI monitors responses with precision.</p>
              </div>

              <div className="p-10 bg-brand-black rounded-[3rem] border border-brand-border shadow-sm space-y-6 group hover:border-green-500/30 transition-all">
                 <div className="w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform">
                    <Trophy className="w-8 h-8" />
                 </div>
                 <h3 className="text-2xl font-black uppercase italic">3. Claim Rewards</h3>
                 <p className="text-brand-muted leading-relaxed font-medium italic">
                   Earn <span className="text-green-500 font-black">Prophy Points</span> based on your performance. These points are your ticket to the global ad revenue pool, where you get paid based on ads deployed across the network.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-32 px-4 bg-brand-black">
        <div className="max-w-5xl mx-auto space-y-20">
           <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-6xl font-black uppercase italic">Choose Your <span className="text-green-500">Fate</span></h2>
              <p className="text-brand-muted font-bold uppercase tracking-widest text-xs">Different ways to dominate the ecosystem</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-brand-card p-12 rounded-[4rem] border border-brand-border shadow-2xl flex flex-col justify-between h-[450px] group relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform"><Target className="w-64 h-64" /></div>
                 <div className="space-y-6 relative z-10">
                    <Target className="w-12 h-12 text-green-500" />
                    <h4 className="text-3xl font-black italic uppercase">The Advertiser</h4>
                    <p className="text-brand-muted leading-relaxed font-medium italic">Reach students in 50+ Federal Universities. Deploy banners with precise institutional targeting.</p>
                 </div>
                 <Link to="/gladiator-hub/advertiser" className="w-full py-5 bg-white text-black rounded-[1.5rem] font-black uppercase tracking-widest text-center hover:bg-green-500 hover:text-white transition-all relative z-10">Setup Dashboard</Link>
              </div>

              <div className="bg-green-600 p-12 rounded-[4rem] flex flex-col justify-between h-[450px] text-white group relative overflow-hidden shadow-[0_20px_60px_rgba(22,163,74,0.2)]">
                 <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform"><Zap className="w-64 h-64" /></div>
                 <div className="space-y-6 relative z-10">
                    <Zap className="w-12 h-12 text-white" />
                    <h4 className="text-3xl font-black italic uppercase">The Creator</h4>
                    <p className="text-green-50 leading-relaxed font-bold italic">Monetize your knowledge. Host paid arenas, build a following, and earn from every session.</p>
                 </div>
                 <Link to="/gladiator-hub/creator" className="w-full py-5 bg-white text-green-600 rounded-[1.5rem] font-black uppercase tracking-widest text-center hover:scale-[1.02] transition-transform relative z-10 shadow-xl">Creator Portal</Link>
              </div>
           </div>
        </div>
      </section>
      
      <footer className="py-20 border-t border-brand-border text-center space-y-6 bg-brand-card">
         <div className="flex justify-center gap-10 grayscale opacity-30">
            <span className="text-[10px] font-black uppercase tracking-widest">Neural Scoring</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Global Ranking</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Proof of Work</span>
         </div>
         <p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.4em]">&copy; 2025 PROPH GLADIATOR HUB</p>
      </footer>
    </div>
  );
};

export default GladiatorLanding;
