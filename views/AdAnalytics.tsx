
import React from 'react';
import { BarChart3, TrendingUp, Users, MousePointer2, DollarSign, ArrowLeft, Calendar, Target } from 'lucide-react';
import { Advertisement, User } from '../types';
import { useNavigate } from 'react-router-dom';

interface AdAnalyticsProps {
  user: User;
  ads: Advertisement[];
}

const AdAnalytics: React.FC<AdAnalyticsProps> = ({ user, ads }) => {
  const navigate = useNavigate();
  const userAds = ads.filter(ad => ad.userId === user.id);

  const totalImpressions = userAds.reduce((acc, ad) => acc + (ad.analytics?.reduce((a, b) => a + b.impressions, 0) || 0), 0);
  const totalClicks = userAds.reduce((acc, ad) => acc + (ad.analytics?.reduce((a, b) => a + b.clicks, 0) || 0), 0);
  const totalSpend = userAds.reduce((acc, ad) => acc + (ad.analytics?.reduce((a, b) => a + b.spend, 0) || 0), 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <div className="py-16 px-4 max-w-7xl mx-auto space-y-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <button 
            onClick={() => navigate('/advertise')}
            className="flex items-center gap-2 text-brand-muted hover:text-brand-proph transition-colors font-black uppercase text-[10px] tracking-widest mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Portal
          </button>
          <h1 className="text-4xl md:text-6xl font-black dark:text-white tracking-tighter uppercase italic">
            Campaign <span className="text-brand-proph">Intelligence</span>
          </h1>
          <p className="text-brand-muted font-medium italic">Real-time performance metrics for your institutional outreach.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="p-6 bg-brand-card rounded-3xl border border-brand-border text-center min-w-[150px]">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Spend</p>
            <p className="text-2xl font-black text-white italic">₦{totalSpend.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-8 bg-brand-card rounded-[2.5rem] border border-brand-border space-y-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Reach</p>
            <p className="text-3xl font-black text-white italic">{totalImpressions.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-8 bg-brand-card rounded-[2.5rem] border border-brand-border space-y-4">
          <div className="w-12 h-12 bg-brand-proph/10 rounded-2xl flex items-center justify-center">
            <MousePointer2 className="w-6 h-6 text-brand-proph" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Clicks</p>
            <p className="text-3xl font-black text-white italic">{totalClicks.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-8 bg-brand-card rounded-[2.5rem] border border-brand-border space-y-4">
          <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Avg. CTR</p>
            <p className="text-3xl font-black text-white italic">{avgCtr.toFixed(2)}%</p>
          </div>
        </div>

        <div className="p-8 bg-brand-card rounded-[2.5rem] border border-brand-border space-y-4">
          <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Nodes</p>
            <p className="text-3xl font-black text-white italic">{userAds.filter(a => a.status === 'active').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-brand-card rounded-[3rem] border border-brand-border overflow-hidden">
        <div className="p-8 border-b border-brand-border flex items-center justify-between">
          <h3 className="text-xl font-black uppercase italic text-white">Active Campaigns</h3>
          <div className="flex items-center gap-2 text-[10px] font-black text-brand-muted uppercase">
            <Calendar className="w-4 h-4" /> Last 30 Days
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/20 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <tr>
                <th className="p-8">Campaign</th>
                <th className="p-8">Status</th>
                <th className="p-8">Reach</th>
                <th className="p-8">Clicks</th>
                <th className="p-8">CTR</th>
                <th className="p-8">Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {userAds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-brand-muted italic font-medium">No active campaigns found in the matrix.</td>
                </tr>
              ) : (
                userAds.map(ad => {
                  const impressions = ad.analytics?.reduce((a, b) => a + b.impressions, 0) || 0;
                  const clicks = ad.analytics?.reduce((a, b) => a + b.clicks, 0) || 0;
                  const spend = ad.analytics?.reduce((a, b) => a + b.spend, 0) || 0;
                  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

                  return (
                    <tr key={ad.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-800 overflow-hidden border border-brand-border">
                            <img src={ad.mediaUrl} className="w-full h-full object-cover" alt="" />
                          </div>
                          <p className="font-black italic text-white">{ad.title}</p>
                        </div>
                      </td>
                      <td className="p-8">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          ad.status === 'active' ? 'bg-green-500/10 text-green-500' : 
                          ad.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                          'bg-gray-500/10 text-gray-500'
                        }`}>
                          {ad.status}
                        </span>
                      </td>
                      <td className="p-8 font-bold text-white">{impressions.toLocaleString()}</td>
                      <td className="p-8 font-bold text-white">{clicks.toLocaleString()}</td>
                      <td className="p-8 font-bold text-brand-proph">{ctr.toFixed(2)}%</td>
                      <td className="p-8 font-bold text-white">₦{spend.toLocaleString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdAnalytics;
