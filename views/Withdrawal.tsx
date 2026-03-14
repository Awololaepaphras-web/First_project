
import React, { useState } from 'react';
import { User, WithdrawalRequest } from '../types';
import { 
  Wallet, Banknote, ShieldCheck, History, 
  AlertCircle, ArrowRight, CheckCircle2, Building2,
  Lock, CreditCard, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WithdrawalProps {
  user: User;
  isEnabled: boolean;
  conversionRate: number;
  onAddRequest: (req: WithdrawalRequest) => void;
  requests: WithdrawalRequest[];
}

const Withdrawal: React.FC<WithdrawalProps> = ({ user, isEnabled, conversionRate, onAddRequest, requests }) => {
  const [amount, setAmount] = useState<number>(0);
  const [bankDetails, setBankDetails] = useState({
    accountName: user.bankDetails?.accountName || '',
    accountNumber: user.bankDetails?.accountNumber || '',
    bankName: user.bankDetails?.bankName || ''
  });
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const MIN_WITHDRAWAL_POINTS = 1000;
  const userPoints = user.points || 0;
  const userRequests = requests.filter(r => r.userId === user.id);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEnabled) return;
    if (userPoints < amount) return alert("Insufficient points balance.");
    if (amount < MIN_WITHDRAWAL_POINTS) return alert(`Minimum withdrawal is ${MIN_WITHDRAWAL_POINTS} points.`);

    const newRequest: WithdrawalRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      points: amount,
      amount: amount * conversionRate,
      bankDetails,
      status: 'pending',
      createdAt: Date.now()
    };

    onAddRequest(newRequest);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setAmount(0);
  };

  return (
    <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Institutional Purse</h1>
            <p className="text-brand-muted font-medium italic">Convert your scholarly contributions into verified rewards.</p>
          </div>
          
          <div className="bg-brand-card p-6 rounded-[2rem] shadow-2xl border border-brand-border flex items-center gap-6">
            <div className="w-14 h-14 bg-brand-proph rounded-2xl flex items-center justify-center shadow-lg shadow-brand-proph/20">
              <Wallet className="w-7 h-7 text-black" />
            </div>
            <div>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest leading-none mb-1">Available Points</p>
              <span className="text-3xl font-black text-white italic">{userPoints.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-brand-card p-10 rounded-[3rem] shadow-2xl border border-brand-border relative overflow-hidden">
            {!isEnabled && (
              <div className="absolute inset-0 z-20 bg-brand-black/60 backdrop-blur-[2px] flex items-center justify-center p-8 text-center">
                <div className="bg-brand-card p-8 rounded-[2.5rem] shadow-2xl border border-brand-border max-w-xs animate-in zoom-in">
                  <Lock className="w-12 h-12 text-brand-proph mx-auto mb-4" />
                  <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Vault Sealed</h3>
                  <p className="text-sm text-brand-muted font-bold leading-relaxed italic">
                    Withdrawal protocols are currently offline for maintenance.
                  </p>
                </div>
              </div>
            )}

            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 italic">
              <Banknote className="w-7 h-7 text-brand-proph" /> Payout Request
            </h2>

            <form onSubmit={handleWithdraw} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 px-1">Convert Points</label>
                <div className="relative group">
                  <input
                    type="number"
                    required
                    min={MIN_WITHDRAWAL_POINTS}
                    max={userPoints}
                    className="w-full pl-6 pr-20 py-5 bg-brand-black border border-brand-border rounded-2xl focus:ring-1 focus:ring-brand-proph outline-none font-black text-xl italic text-white transition-all shadow-inner"
                    placeholder="e.g. 5000"
                    value={amount || ''}
                    onChange={(e) => setAmount(parseInt(e.target.value))}
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-brand-proph uppercase italic">
                    ≈ ₦{ (amount * conversionRate).toLocaleString() }
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-brand-border/50">
                <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4 px-1">Bank Destination Node</h3>
                <div className="space-y-4">
                  <input required className="w-full px-6 py-4 bg-brand-black border border-brand-border rounded-2xl text-sm font-bold focus:ring-1 focus:ring-brand-proph outline-none transition-all" placeholder="Account Holder Name" value={bankDetails.accountName} onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})} />
                  <input required maxLength={10} className="w-full px-6 py-4 bg-brand-black border border-brand-border rounded-2xl text-sm font-bold focus:ring-1 focus:ring-brand-proph outline-none transition-all" placeholder="Account Number (10 digits)" value={bankDetails.accountNumber} onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})} />
                  <input required className="w-full px-6 py-4 bg-brand-black border border-brand-border rounded-2xl text-sm font-bold focus:ring-1 focus:ring-brand-proph outline-none transition-all" placeholder="Institutional Bank Name" value={bankDetails.bankName} onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})} />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isEnabled || userPoints < MIN_WITHDRAWAL_POINTS}
                className="w-full bg-brand-proph text-black py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-xl shadow-brand-proph/20 disabled:opacity-50 active:scale-95"
                title="Process Withdrawal"
              >
                {submitted ? <><CheckCircle2 className="w-6 h-6 animate-bounce" /> Transmission Logged</> : <><CreditCard className="w-6 h-6" /> Authenticate Payout</>}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-brand-card p-8 rounded-[2.5rem] shadow-2xl border border-brand-border flex flex-col h-full">
              <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3 italic">
                <History className="w-6 h-6 text-brand-primary" /> Transmission Log
              </h2>
              
              <div className="space-y-4 flex-grow overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {userRequests.length > 0 ? (
                  userRequests.map(req => (
                    <div key={req.id} className="p-5 bg-brand-black rounded-2xl border border-brand-border flex justify-between items-center group hover:border-brand-proph transition-all">
                      <div>
                        <p className="text-lg font-black text-white italic">₦{req.amount.toLocaleString()}</p>
                        <p className="text-[9px] text-brand-muted font-bold uppercase tracking-widest">{new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border ${
                        req.status === 'approved' ? 'bg-brand-proph/10 text-brand-proph border-brand-proph/20' :
                        req.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
                    <History className="w-16 h-16 text-brand-muted" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted">Purse history clear</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-brand-proph p-8 rounded-[2.5rem] text-black shadow-xl shadow-brand-proph/10">
              <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 italic">
                <ShieldCheck className="w-4 h-4" /> Compliance Signature
              </h3>
              <p className="text-xs font-bold leading-relaxed italic opacity-80">
                Verified scholar rewards are synchronized within 48 operational cycles. Node reputation affects priority processing.
              </p>
            </div>
            
            <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-brand-card border border-brand-border text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-border transition-all flex items-center justify-center gap-2" title="Return to Core">
               <ChevronRight className="w-4 h-4 rotate-180" /> Back to Terminal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdrawal;
