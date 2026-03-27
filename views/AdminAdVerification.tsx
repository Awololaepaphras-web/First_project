
import React from 'react';
import { 
  CheckCircle2, XCircle, PlayCircle, Target, 
  Clock, Monitor, Zap, ShieldCheck, AlertCircle, Users
} from 'lucide-react';
import { Advertisement, AdPlacement, AdType, AdTimeFrame } from '../types';

interface AdminAdVerificationProps {
  ads: Advertisement[];
  onUpdateAd: (ad: Advertisement) => void;
}

const AdminAdVerification: React.FC<AdminAdVerificationProps> = ({ ads, onUpdateAd }) => {
  const pendingAds = ads.filter(ad => ad.status === 'pending_review');

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Ad Verification & Placement</h1>
          <p className="text-brand-muted font-medium italic mt-1">Review approved payments and configure campaign deployment</p>
        </div>
        <div className="bg-brand-card border border-brand-border px-6 py-4 rounded-2xl flex items-center gap-4">
          <div className="bg-yellow-500/10 p-2 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Pending Review</p>
            <p className="text-xl font-black text-white italic">{pendingAds.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-800 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="p-8">Ad Asset</th>
                <th className="p-8">Details</th>
                <th className="p-8">Placement Logic</th>
                <th className="p-8 text-right">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {pendingAds.length > 0 ? pendingAds.map(ad => (
                <tr key={ad.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-gray-800 overflow-hidden border border-gray-700 flex-shrink-0">
                        {ad.mediaType === 'image' ? (
                          <img src={ad.mediaUrl} className="w-full h-full object-cover" alt={ad.title} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-brand-black">
                            <PlayCircle className="w-8 h-8 text-brand-proph" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-black italic text-base text-white break-words max-w-[200px]">{ad.title}</p>
                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-1">{ad.adType}</p>
                        <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-[9px] text-brand-muted hover:text-brand-proph transition-colors truncate block max-w-[150px] mt-1 font-mono">
                          {ad.link}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-brand-muted" />
                        <p className="text-xs font-bold text-gray-300">Duration: {ad.campaignDuration} {ad.campaignUnit}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-brand-muted" />
                        <p className="text-[10px] text-gray-500 uppercase font-black">Target: {ad.targetLocation}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-brand-muted" />
                        <p className="text-[10px] text-gray-500 uppercase font-black">Reach: {ad.targetReach === 'all' ? 'Global' : ad.targetReach}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black uppercase text-gray-500 block mb-1.5 tracking-widest">Set Placement</label>
                        <select 
                          value={ad.placement} 
                          onChange={(e) => onUpdateAd({ ...ad, placement: e.target.value as AdPlacement })}
                          className="bg-gray-950 border border-gray-800 text-[10px] font-black uppercase px-4 py-2.5 rounded-xl outline-none text-white w-full focus:border-brand-proph transition-colors cursor-pointer"
                        >
                          <option value="timeline">Timeline (Main Feed)</option>
                          <option value="search">Search Results</option>
                          <option value="post">Inside Posts</option>
                          <option value="profile">User Profiles</option>
                          <option value="replies">Post Replies</option>
                          <option value="university">University Feed</option>
                          <option value="study-hub">Study Hub</option>
                          <option value="startup">Startup Launchpad</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-gray-500 block mb-1.5 tracking-widest">Set Ad Type</label>
                        <select 
                          value={ad.adType} 
                          onChange={(e) => onUpdateAd({ ...ad, adType: e.target.value as AdType })}
                          className="bg-gray-950 border border-gray-800 text-[10px] font-black uppercase px-4 py-2.5 rounded-xl outline-none text-white w-full focus:border-brand-proph transition-colors cursor-pointer"
                        >
                          <option value="native">Native (X-Style)</option>
                          <option value="banner">Banner</option>
                          <option value="popup">Pop-up</option>
                          <option value="fullscreen">Full Screen App</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-gray-500 block mb-1.5 tracking-widest">Set Time Frames</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(['12am-6am', '6am-12pm', '12pm-6pm', '6pm-12am', 'all-day'] as AdTimeFrame[]).map(tf => (
                            <button
                              key={tf}
                              onClick={() => {
                                const current = ad.timeFrames || [];
                                const next = current.includes(tf) ? current.filter(t => t !== tf) : [...current, tf];
                                onUpdateAd({ ...ad, timeFrames: next });
                              }}
                              className={`px-2 py-1.5 rounded-lg text-[8px] font-black uppercase border transition-all ${ad.timeFrames?.includes(tf) ? 'bg-brand-proph border-brand-proph text-black' : 'bg-gray-950 border-gray-800 text-gray-500 hover:text-white hover:border-gray-600'}`}
                            >
                              {tf}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => onUpdateAd({ ...ad, status: 'active' })}
                        className="p-4 bg-green-600/10 text-green-500 rounded-2xl hover:bg-green-600 hover:text-white transition-all group relative overflow-hidden shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]"
                        title="Approve & Deploy"
                      >
                        <CheckCircle2 className="w-6 h-6 relative z-10" />
                        <div className="absolute inset-0 bg-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button 
                        onClick={() => onUpdateAd({ ...ad, status: 'rejected' })}
                        className="p-4 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all group relative overflow-hidden"
                        title="Reject Campaign"
                      >
                        <XCircle className="w-6 h-6 relative z-10" />
                        <div className="absolute inset-0 bg-red-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-32 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-20">
                      <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
                        <Monitor className="w-12 h-12" />
                      </div>
                      <div>
                        <p className="text-xl font-black uppercase italic tracking-tighter">No Campaigns Awaiting Review</p>
                        <p className="text-xs font-medium mt-2">All approved payments have been processed or are active.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAdVerification;
