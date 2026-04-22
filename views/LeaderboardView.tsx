import React, { useState, useEffect } from 'react';
import { 
  Trophy, TrendingUp, Users, ArrowLeft, 
  DollarSign, Zap, Info, ChevronRight,
  Wallet, Gift, Coins
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { SupabaseService } from '../src/services/supabaseService';
import { Post, User } from '../types';
import { CloudinaryService } from '../src/services/cloudinaryService';

const LeaderboardView: React.FC = () => {
  const navigate = useNavigate();
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [topReferrers, setTopReferrers] = useState<User[]>([]);
  const [topEarners, setTopEarners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'referrers' | 'earners' | 'guide'>('earners');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [posts, referrers, earners] = await Promise.all([
        SupabaseService.getTopPosts(20),
        SupabaseService.getTopReferrers(20),
        SupabaseService.getTopEarnersMonthly(20)
      ]);
      setTopPosts(posts);
      setTopReferrers(referrers);
      setTopEarners(earners);
    } catch (err) {
      console.error('Failed to load leaderboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getEngagementCount = (post: Post) => {
    return (post.likes?.length || 0) + (post.comments?.length || 0) + (post.reposts?.length || 0);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-brand-black pb-20">
      {/* Header */}
      <div className="bg-brand-proph p-8 pt-16 text-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest mb-8 hover:bg-black/10 p-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Matrix
        </button>
        <div className="flex items-center gap-6">
          <div className="bg-black/10 p-4 rounded-3xl backdrop-blur-xl border border-black/10">
            <Trophy className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Hall of Fame</h1>
            <p className="font-bold opacity-80 italic text-sm mt-1">The elite nodes of the Proph network.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white dark:bg-brand-card p-2 rounded-[2rem] shadow-2xl border border-brand-border flex gap-2">
          <button 
            onClick={() => setActiveTab('earners')}
            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'earners' ? 'bg-brand-proph text-black shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-brand-black'}`}
          >
            <Trophy className="w-4 h-4" /> Monthly Champions
          </button>
          <button 
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'posts' ? 'bg-brand-proph text-black shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-brand-black'}`}
          >
            <TrendingUp className="w-4 h-4" /> Top Intel
          </button>
          <button 
            onClick={() => setActiveTab('referrers')}
            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'referrers' ? 'bg-brand-proph text-black shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-brand-black'}`}
          >
            <Users className="w-4 h-4" /> Top Recruiters
          </button>
          <button 
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'guide' ? 'bg-brand-proph text-black shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-brand-black'}`}
          >
            <Coins className="w-4 h-4" /> Earning Guide
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-brand-proph border-t-transparent rounded-full animate-spin" />
            <p className="font-black text-[10px] uppercase tracking-widest text-brand-muted">Synchronizing Data...</p>
          </div>
        ) : activeTab === 'earners' ? (
          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted px-4 mb-6">Top 20 Monthly Prophy Earners</h2>
            {topEarners.map((user, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={user.id}
                className="bg-white dark:bg-brand-card p-6 rounded-[2.5rem] border border-brand-border flex items-center gap-6"
              >
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center font-black text-2xl italic text-brand-proph/30">
                  #{index + 1}
                </div>
                <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 border border-brand-border">
                  <img 
                    src={CloudinaryService.getOptimizedUrl(user.user_avatar || `https://ui-avatars.com/api/?name=${user.nickname}`)} 
                    className="w-full h-full object-cover" 
                    alt="" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm dark:text-white truncate uppercase italic">@{user.nickname}</p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Accumulated this month</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 text-brand-proph">
                    <Coins className="w-5 h-5" />
                    <span className="font-black text-xl italic">{Math.floor(user.total_points || 0).toLocaleString()}</span>
                  </div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Prophy Coins</p>
                </div>
              </motion.div>
            ))}
            {topEarners.length === 0 && (
              <div className="text-center py-20 bg-gray-50 dark:bg-brand-card/50 rounded-[3rem] border border-dashed border-brand-border">
                <p className="font-black text-xs text-brand-muted uppercase tracking-[0.2em]">No data available for this month</p>
              </div>
            )}
          </div>
        ) : activeTab === 'posts' ? (
          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted px-4 mb-6">Top 20 High-Engagement Intel</h2>
            {topPosts.map((post, index) => (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={post.id}
                onClick={() => navigate(`/post/${post.id}`)}
                className="w-full bg-white dark:bg-brand-card p-6 rounded-[2.5rem] border border-brand-border hover:border-brand-proph transition-all flex items-center gap-6 group text-left"
              >
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center font-black text-2xl italic text-brand-proph/30 group-hover:text-brand-proph transition-colors">
                  #{index + 1}
                </div>
                <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 border border-brand-border">
                  <img 
                    src={CloudinaryService.getOptimizedUrl(post.userAvatar || `https://ui-avatars.com/api/?name=${post.userNickname}`)} 
                    className="w-full h-full object-cover" 
                    alt="" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm dark:text-white truncate uppercase italic">@{post.userNickname}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{post.content}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 text-brand-proph">
                      <Zap className="w-4 h-4" />
                      <span className="font-black text-sm">{getEngagementCount(post)}</span>
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Engagement</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-proph transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>
        ) : activeTab === 'referrers' ? (
          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted px-4 mb-6">Top 20 Elite Recruiters</h2>
            {topReferrers.map((user, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={user.id}
                className="bg-white dark:bg-brand-card p-6 rounded-[2.5rem] border border-brand-border flex items-center gap-6"
              >
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center font-black text-2xl italic text-brand-proph/30">
                  #{index + 1}
                </div>
                <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 border border-brand-border">
                  <img 
                    src={CloudinaryService.getOptimizedUrl(user.profilePicture || `https://ui-avatars.com/api/?name=${user.nickname}`)} 
                    className="w-full h-full object-cover" 
                    alt="" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm dark:text-white truncate uppercase italic">@{user.nickname}</p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{user.university}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 text-blue-500">
                    <Users className="w-4 h-4" />
                    <span className="font-black text-sm">{user.referralCount || 0}</span>
                  </div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Referrals</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-brand-proph/10 rounded-2xl flex items-center justify-center">
                  <Coins className="w-6 h-6 text-brand-proph" />
                </div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">How to Earn Prophy Coins</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-brand-card p-8 rounded-[3rem] border border-brand-border space-y-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="font-black uppercase italic text-sm">Elite Recruitment</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Invite new nodes to the matrix using your referral link. Earn massive bonuses for every verified student who joins.</p>
                  <div className="pt-2">
                    <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">500 Coins / Referral</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-brand-card p-8 rounded-[3rem] border border-brand-border space-y-4">
                  <div className="w-10 h-10 bg-brand-proph/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-brand-proph" />
                  </div>
                  <h3 className="font-black uppercase italic text-sm">Intel Engagement</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Post high-quality academic intel. Earn coins every time someone likes, comments, or reposts your content.</p>
                  <div className="pt-2">
                    <span className="bg-brand-proph/10 text-brand-proph px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Passive Earnings</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-brand-card p-8 rounded-[3rem] border border-brand-border space-y-4">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <Gift className="w-5 h-5 text-purple-500" />
                  </div>
                  <h3 className="font-black uppercase italic text-sm">Premium Dividends</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Upgrade to Premium to receive daily coin injections and a share of the platform's group messaging revenue.</p>
                  <div className="pt-2">
                    <span className="bg-purple-500/10 text-purple-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Up to 10k Daily</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-brand-card p-8 rounded-[3rem] border border-brand-border space-y-4">
                  <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="font-black uppercase italic text-sm">Archive Contribution</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Upload missing past questions to the vault. Earn rewards once your intel is verified by the Academic Board.</p>
                  <div className="pt-2">
                    <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Verified Rewards</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-gray-900 text-white p-10 rounded-[4rem] space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-proph/10 rounded-full blur-3xl" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-brand-proph" />
                </div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Cashing Out to Real Fiat</h2>
              </div>

              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-black text-brand-proph shrink-0">1</div>
                  <div>
                    <h4 className="font-black uppercase text-xs tracking-widest mb-2">Accumulate Prophy Coins</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">Build your balance through the earning methods above. The minimum withdrawal threshold is 5,000 Prophy Coins.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-black text-brand-proph shrink-0">2</div>
                  <div>
                    <h4 className="font-black uppercase text-xs tracking-widest mb-2">Initiate Withdrawal</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">Go to your Wallet and select "Withdraw". Enter the amount of coins you wish to convert to Naira.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-black text-brand-proph shrink-0">3</div>
                  <div>
                    <h4 className="font-black uppercase text-xs tracking-widest mb-2">Bank Verification</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">Ensure your bank details are correctly set in your profile. Our system supports all major Nigerian banks.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-black text-brand-proph shrink-0">4</div>
                  <div>
                    <h4 className="font-black uppercase text-xs tracking-widest mb-2">Matrix Processing</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">Withdrawals are processed within 24-48 hours. You will receive a notification once the fiat hits your account.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-brand-proph" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Conversion Rate: 10 Coins = ₦1.00</p>
                </div>
                <button onClick={() => navigate('/withdraw')} className="px-6 py-3 bg-brand-proph text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                  Go to Wallet
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default LeaderboardView;
