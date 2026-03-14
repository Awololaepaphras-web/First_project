
import React, { useState } from 'react';
import { 
  DollarSign, Target, MousePointer2, TrendingUp, 
  ShieldCheck, AlertCircle, CheckCircle2, ChevronRight,
  BarChart3, Users, Layout
} from 'lucide-react';
import { User, Advertisement } from '../types';
import { UNIVERSITIES } from '../constants';

interface AdvertiseProps {
  user: User | null;
}

const Advertise: React.FC<AdvertiseProps> = ({ user }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    targetUni: 'all',
    bid: 50,
    mediaUrl: '',
    link: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  // Ranking Logic Simulation
  const estimatedAdScore = (formData.bid * 0.5) + (10 * 0.3) + (0.5 * 0.2); // bid, relevance(mock), ctr(mock)

  return (
    <div className="py-16 px-4 max-w-5xl mx-auto space-y-16">
      <div className="text-center space-y-4">
         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest animate-fade-in">
           <Target className="w-4 h-4" />
           <span>Reach the brightest minds in Nigeria</span>
         </div>
         <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter">
            Targeted Campus <span className="text-green-600">Promotion</span>
         </h1>
         <p className="max-w-2xl mx-auto text-gray-500 font-medium text-lg">
            Deploy your message across 50+ federal institutions. Our auction system ensures premium placement for high-relevance content.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Network Reach', val: '250k+', sub: 'Daily Student Sessions', icon: <Users className="w-6 h-6" /> },
          { label: 'Avg CTR', val: '4.2%', sub: 'High Engagement Rate', icon: <MousePointer2 className="w-6 h-6" /> },
          { label: 'Ad Auction', val: 'Real-time', sub: 'Fair Score Allocation', icon: <TrendingUp className="w-6 h-6" /> }
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100 flex flex-col items-center text-center">
             <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">{s.icon}</div>
             <p className="text-3xl font-black text-gray-900">{s.val}</p>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
             <p className="text-[11px] text-gray-500 font-medium mt-2">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-2xl border border-gray-50 overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
         <div className="lg:w-5/12 bg-gray-900 p-12 text-white space-y-12">
            <div>
               <h3 className="text-2xl font-black mb-2">AdScore Protocol</h3>
               <p className="text-gray-400 text-sm font-medium leading-relaxed">
                  We don't just show the highest bidder. Your AdScore determines your visibility:
               </p>
            </div>
            
            <div className="space-y-8">
               <div className="flex gap-5">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-green-400 font-black">50%</div>
                  <div>
                     <p className="font-black text-sm uppercase tracking-widest">Bid Amount</p>
                     <p className="text-xs text-gray-500 mt-1">Your financial commitment per click/session.</p>
                  </div>
               </div>
               <div className="flex gap-5">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 font-black">30%</div>
                  <div>
                     <p className="font-black text-sm uppercase tracking-widest">Relevance Score</p>
                     <p className="text-xs text-gray-500 mt-1">How well your content matches student needs.</p>
                  </div>
               </div>
               <div className="flex gap-5">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-purple-400 font-black">20%</div>
                  <div>
                     <p className="font-black text-sm uppercase tracking-widest">CTR History</p>
                     <p className="text-xs text-gray-500 mt-1">Proven past performance and engagement.</p>
                  </div>
               </div>
            </div>

            <div className="pt-8 border-t border-white/5">
               <div className="bg-green-600/10 p-6 rounded-3xl border border-green-500/20">
                  <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Your Estimated Score</p>
                  <p className="text-5xl font-black text-white tracking-tighter">{estimatedAdScore.toFixed(1)} <span className="text-xl text-green-500">pts</span></p>
               </div>
            </div>
         </div>

         <div className="lg:w-7/12 p-12 lg:p-16">
            {step === 1 && (
               <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-2">
                     <h3 className="text-3xl font-black text-gray-900">Campaign Details</h3>
                     <p className="text-gray-500 font-medium">Start your outreach by defining your asset.</p>
                  </div>
                  <div className="space-y-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Title</label>
                        <input className="w-full bg-gray-50 border border-gray-200 p-5 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g. Internship Opportunities 2025" />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Institution</label>
                        <select className="w-full bg-gray-50 border border-gray-200 p-5 rounded-2xl font-bold uppercase text-xs" value={formData.targetUni} onChange={e => setFormData({...formData, targetUni: e.target.value})}>
                           <option value="all">All Federal Nodes</option>
                           {UNIVERSITIES.map(u => <option key={u.id} value={u.acronym}>{u.acronym}</option>)}
                        </select>
                     </div>
                     <button onClick={() => setStep(2)} className="w-full bg-green-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-green-700 transition-all flex items-center justify-center gap-3">
                        Next: Bidding & Media <ChevronRight className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            )}

            {step === 2 && (
               <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-2">
                     <h3 className="text-3xl font-black text-gray-900">Auction Matrix</h3>
                     <p className="text-gray-500 font-medium">Define your budget and upload creative assets.</p>
                  </div>
                  <div className="space-y-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bid per Click (#)</label>
                        <input type="number" className="w-full bg-gray-50 border border-gray-200 p-5 rounded-2xl font-black text-2xl focus:ring-2 focus:ring-green-500 outline-none" value={formData.bid} onChange={e => setFormData({...formData, bid: parseInt(e.target.value)})} />
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">* Higher bids increase visibility priority.</p>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Media Source (Image/Video URL)</label>
                        <input className="w-full bg-gray-50 border border-gray-200 p-5 rounded-2xl font-bold" placeholder="https://..." value={formData.mediaUrl} onChange={e => setFormData({...formData, mediaUrl: e.target.value})} />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Destination URL</label>
                        <input className="w-full bg-gray-50 border border-gray-200 p-5 rounded-2xl font-bold" placeholder="https://yourbrand.com" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} />
                     </div>
                     
                     <div className="flex gap-4">
                        <button type="button" onClick={() => setStep(1)} className="px-8 py-6 bg-gray-100 text-gray-500 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Back</button>
                        <button type="submit" className="flex-grow bg-gray-900 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all">Deploy Campaign</button>
                     </div>
                  </div>
               </form>
            )}

            {step === 3 && (
               <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center border border-green-200 shadow-inner">
                     <CheckCircle2 className="w-12 h-12 text-green-600 animate-bounce" />
                  </div>
                  <div className="space-y-3">
                     <h3 className="text-3xl font-black text-gray-900">Campaign Initialized</h3>
                     <p className="text-gray-500 font-medium max-w-sm">Your ad is now entering the real-time bidding queue. Monitoring dashboard will activate shortly.</p>
                  </div>
                  <button onClick={() => setStep(1)} className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Create Another</button>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Advertise;
