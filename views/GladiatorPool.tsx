import React, { useState } from 'react';
import { 
  Trophy, Zap, Wallet, AlertTriangle, ArrowRight, 
  Swords, Shield, Clock, Users, ArrowLeft,
  CheckCircle2, Loader2, BookOpen
} from 'lucide-react';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';

interface GladiatorPoolProps {
  user: User;
  onCommit: (points: number) => void;
}

const GladiatorPool: React.FC<GladiatorPoolProps> = ({ user, onCommit }) => {
  const [committed, setCommitted] = useState(false);
  const [points, setPoints] = useState(200);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCommit = () => {
    if ((user.points || 0) < points) {
      alert("Insufficient points for this level of combat.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      onCommit(points);
      setCommitted(true);
      setLoading(false);
    }, 1500);
  };

  const poolStats = {
    participants: 12,
    totalPool: (12 * 200) + 500,
    timeRemaining: '02:45:12'
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <button 
          onClick={() => navigate('/gladiator-hub')}
          className="flex items-center gap-2 text-gray-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Hub Base
        </button>

        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] border border-red-600/20">
             <Zap className="w-4 h-4 fill-current" /> High Stakes Arena
          </div>
          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
            POINT <span className="text-red-600">DROP</span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-400 font-medium text-lg italic">
            "High Commitment. High Reward. The ultimate test of institutional knowledge."
          </p>
        </div>

        {!committed ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="bg-gray-900 p-10 rounded-[4rem] border border-gray-800 space-y-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000"><Shield className="w-64 h-64" /></div>
                <div className="space-y-4 relative z-10">
                   <h3 className="text-3xl font-black italic uppercase">The Pool Deck</h3>
                   <p className="text-gray-500 font-medium text-sm">Contribute your points to the communal pot. Top gladiators split the combined pool + system bonus.</p>
                </div>

                <div className="space-y-6 relative z-10">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Your Commitment (Min 200)</label>
                      <div className="relative">
                         <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 w-6 h-6" />
                         <input 
                           type="number" 
                           min={200}
                           value={points}
                           onChange={e => setPoints(parseInt(e.target.value) || 0)}
                           className="w-full bg-gray-950 border border-gray-800 p-6 pl-16 rounded-[2.5rem] text-4xl font-black italic text-red-600 outline-none focus:ring-4 focus:ring-red-600/20 transition-all"
                         />
                      </div>
                   </div>

                   <button 
                    onClick={handleCommit}
                    disabled={loading}
                    className="w-full py-6 bg-red-600 text-white rounded-[2.5rem] font-black uppercase text-sm tracking-[0.2em] shadow-xl shadow-red-900/40 hover:bg-red-500 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                   >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Swords className="w-6 h-6" /> COMMIT TO ARENA</>}
                   </button>
                </div>
             </div>

             <div className="space-y-6">
                <div className="bg-gray-900 p-8 rounded-[3.5rem] border border-gray-800 space-y-8 shadow-xl">
                   <h3 className="text-xl font-black italic uppercase flex items-center gap-3"><Trophy className="w-6 h-6 text-yellow-500" /> Current Arena Status</h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-gray-950 rounded-[2rem] border border-gray-800">
                         <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Live Pool</p>
                         <p className="text-3xl font-black text-white italic">{(poolStats.totalPool + points).toLocaleString()}</p>
                      </div>
                      <div className="p-6 bg-gray-950 rounded-[2rem] border border-gray-800">
                         <p className="text-[9px] font-black text-gray-500 uppercase mb-1">House Bonus</p>
                         <p className="text-3xl font-black text-green-600 italic">+500</p>
                      </div>
                   </div>
                   <div className="p-6 bg-red-600/5 rounded-[2rem] border border-red-600/20 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <Users className="w-8 h-8 text-red-600" />
                         <div>
                            <p className="text-lg font-black text-white">{poolStats.participants + 1}</p>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Active Challengers</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-lg font-black text-white font-mono">{poolStats.timeRemaining}</p>
                         <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Time to Lock</p>
                      </div>
                   </div>
                </div>

                <div className="p-8 bg-gray-800 rounded-[3rem] border border-gray-700 flex items-start gap-4">
                   <AlertTriangle className="w-8 h-8 text-orange-500 flex-shrink-0" />
                   <div className="space-y-2">
                      <p className="text-sm font-black uppercase text-orange-500">Survival Protocol</p>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed italic">Points committed to the Point Drop are non-refundable. Only the highest ranking nodes in the session will receive a cut of the total spoils.</p>
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="bg-gray-900 p-20 rounded-[5rem] border border-red-600/30 text-center space-y-10 animate-in zoom-in duration-700 shadow-[0_0_100px_rgba(220,38,38,0.1)]">
             <div className="relative w-40 h-40 mx-auto">
                <div className="absolute inset-0 bg-red-600/20 rounded-full animate-ping" />
                <div className="relative w-full h-full bg-red-600 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-red-900/40">
                   <Swords className="w-16 h-16 text-white" />
                </div>
             </div>
             <div className="space-y-4">
                <h2 className="text-4xl font-black italic uppercase">Neural combat Linked</h2>
                <p className="text-gray-400 font-medium max-w-sm mx-auto">Protocol synchronization complete. Awaiting arena deployment. Prepare for the ultimate study trial.</p>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                <button 
                  onClick={() => navigate('/gladiator-hub/arena')}
                  className="py-5 bg-white text-black rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3"
                >
                  <BookOpen className="w-5 h-5" /> Load Study Intel
                </button>
                <button 
                  onClick={() => setCommitted(false)}
                  className="py-5 bg-gray-800 text-gray-500 rounded-[2rem] font-black uppercase text-xs tracking-widest border border-gray-700"
                >
                  View Standings
                </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GladiatorPool;