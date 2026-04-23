
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gift, Star, Zap, Trophy, Coins, CheckCircle2, Clock, Info } from 'lucide-react';
import { User, PremiumTier } from '../types';
import { SupabaseService } from '../src/services/supabaseService';

interface DailyRewardsProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const DailyRewards: React.FC<DailyRewardsProps> = ({ user, onUpdateUser }) => {
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const checkStatus = () => {
      if (user.lastPointsReset) {
        const lastReset = new Date(user.lastPointsReset);
        const now = new Date();
        const diff = now.getTime() - lastReset.getTime();
        const hours24 = 24 * 60 * 60 * 1000;

        if (diff < hours24) {
          setClaimed(true);
          const remaining = hours24 - diff;
          const h = Math.floor(remaining / (1000 * 60 * 60));
          const m = Math.floor((remaining / (1000 * 60)) % 60);
          setTimeLeft(`${h}h ${m}m`);
        } else {
          setClaimed(false);
        }
      }
    };

    checkStatus();
    const timer = setInterval(checkStatus, 60000);
    return () => clearInterval(timer);
  }, [user]);

  const handleClaim = async () => {
    setLoading(true);
    try {
      const result = await SupabaseService.claimDailyAllowance();
      if (result.success) {
        setMessage(`Success! You received ${result.amount} coins.`);
        setClaimed(true);
        // Refresh user profile
        const updatedUser = await SupabaseService.getUserProfile(user.id);
        if (updatedUser) onUpdateUser(updatedUser);
      } else {
        setMessage(result.message || 'Failed to claim reward.');
      }
    } catch (err) {
      console.error('Claim error:', err);
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTierAllowance = (tier: PremiumTier = 'none') => {
    if (tier === 'alpha_premium') return 10000;
    if (tier === 'premium_plus') return 5000;
    if (tier === 'premium') return 1000;
    return 500;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-32">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-proph/10 text-brand-proph border border-brand-proph/20 shadow-xl shadow-brand-proph/10 animate-pulse">
          <Gift className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase text-gray-900 dark:text-white">Daily Bounty Node</h1>
        <p className="text-brand-muted font-medium italic">Collect your daily fuel to keep the mainframe synchronized.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Main Claim Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-brand-card border border-brand-border p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center space-y-6"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-proph via-emerald-400 to-brand-proph animate-progress" />
          
          <div className="space-y-2">
            <p className="text-xs font-black text-brand-muted uppercase tracking-[0.3em]">Current Tier Availability</p>
            <h2 className="text-5xl font-black italic tracking-tighter text-brand-proph">
              {getTierAllowance(user.premiumTier)} <span className="text-xl inline-block -translate-y-4">COINS</span>
            </h2>
          </div>

          {claimed ? (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-brand-proph/10 text-brand-proph rounded-full text-sm font-black uppercase tracking-widest border border-brand-proph/20">
                <CheckCircle2 className="w-4 h-4" /> Claimed Today
              </div>
              <p className="text-brand-muted text-sm font-medium italic">Next refill in <span className="text-white font-black not-italic">{timeLeft}</span></p>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              disabled={loading}
              className="w-full bg-brand-proph text-black font-black py-6 rounded-2xl text-lg uppercase tracking-[0.2em] shadow-xl shadow-brand-proph/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Decrypting...' : 'Collect Reward'}
            </button>
          )}

          {message && (
            <p className={`text-sm font-bold animate-fade-in ${message.includes('Success') ? 'text-brand-proph' : 'text-red-500'}`}>
              {message}
            </p>
          )}
        </motion.div>

        {/* Tier Info Card */}
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase tracking-tighter italic text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-proph" /> Multiplier Matrix
          </h3>
          
          <div className="space-y-3">
            {[
              { name: 'Standard (Basic)', amt: 500, color: 'text-gray-400', icon: <Coins className="w-4 h-4" /> },
              { name: 'Premium', amt: 1000, color: 'text-blue-400', icon: <Star className="w-4 h-4" /> },
              { name: 'Premium+', amt: 5000, color: 'text-purple-400', icon: <Zap className="w-4 h-4" /> },
              { name: 'Alpha Node', amt: 10000, color: 'text-brand-proph', icon: <Trophy className="w-4 h-4" /> },
            ].map(tier => (
              <div key={tier.name} className={`flex items-center justify-between p-4 rounded-2xl border border-brand-border bg-brand-black/50 ${user.premiumTier === tier.name.toLowerCase().replace(' ', '_') ? 'border-brand-proph bg-brand-proph/5' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-800/50 ${tier.color}`}>{tier.icon}</div>
                  <span className="font-black text-xs uppercase tracking-widest">{tier.name}</span>
                </div>
                <span className="font-black italic text-brand-proph">{tier.amt} / day</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-brand-proph/5 border border-brand-proph/20 flex items-start gap-3">
            <Info className="w-5 h-5 text-brand-proph shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed text-brand-muted font-medium italic">
              Daily rewards are synchronized with the Federal Mainframe every 24 hours. Ensure your mobile node is active during peak hours for maximum data retention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyRewards;
