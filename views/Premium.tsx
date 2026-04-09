import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, CheckCircle2, ShieldCheck, Zap, Award, Crown, ArrowRight, BookOpen, User, CreditCard, X, Building, Info, Copy, Loader2 } from 'lucide-react';
import { SystemConfig, User as UserType, PaymentVerification } from '../types';
import { SupabaseService } from '../src/services/supabaseService';

interface PremiumProps {
  user: UserType;
  config: SystemConfig;
  onUpgrade: (user: UserType) => void;
}

const Premium: React.FC<PremiumProps> = ({ user, config, onUpgrade }) => {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<{id: string, name: string, price: number} | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'card'>('bank');
  const [txRef, setTxRef] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const tiers = [
    {
      id: 'weekly',
      name: 'Free Node',
      price: 0,
      period: 'forever',
      features: ['Access to 50% of vault', 'Standard AI Buddy (Slow)', 'Public Community access', 'Basic study timer'],
      color: 'bg-gray-900',
      btnText: 'Current Plan',
      isPremium: false
    },
    {
      id: 'monthly',
      name: 'Proph Plus (Monthly)',
      price: config.premiumTiers.monthly,
      period: 'per month',
      features: ['100% Vault Unlock', 'High-priority Gemini AI', 'Ad-free experience', 'Verified Creator status', 'Premium memory bank extensions'],
      color: 'bg-brand-proph',
      btnText: 'Select Monthly',
      isPremium: true,
      featured: true
    },
    {
      id: 'yearly',
      name: 'Session Master (Yearly)',
      price: config.premiumTiers.yearly,
      period: 'per session',
      features: ['Lifetime institutional access', 'Neural forging unlimited', 'Direct Academic Board link', 'Exclusive 500L Masterclasses', 'Custom AI study paths'],
      color: 'bg-yellow-600',
      btnText: 'Select Master',
      isPremium: true
    }
  ];

  const handlePurchaseRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txRef.trim() || !selectedTier) return;
    setIsProcessing(true);
    
    try {
      const verification: PaymentVerification = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        type: 'premium',
        amount: selectedTier.price,
        reference: txRef,
        status: 'pending',
        createdAt: Date.now(),
        details: { tier: selectedTier.id }
      };

      await SupabaseService.savePaymentVerification(verification);
      
      alert("Verification Request Sent. Our admins will approve your upgrade within 2 hours of payment confirmation.");
      setSelectedTier(null);
      setTxRef('');
    } catch (error) {
      console.error('Failed to save payment verification:', error);
      alert('Failed to submit verification request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardPayment = async () => {
    if (!selectedTier) return;
    setIsProcessing(true);
    
    try {
      // Simulate Paystack/Flutterwave success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedUser = await SupabaseService.upgradeUserToPremium(user.id, selectedTier.id as any);
      if (updatedUser) {
        onUpgrade(updatedUser);
        alert(`Congratulations! Your node has been elevated to ${selectedTier.name}.`);
        navigate('/dashboard');
      } else {
        throw new Error('Upgrade failed');
      }
    } catch (error) {
      console.error('Card payment failed:', error);
      alert('Payment failed. Please try again or use bank transfer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-brand-black text-white py-12 px-4 selection:bg-brand-proph/30">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-6">
           <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-brand-proph/10 text-brand-proph text-xs font-black uppercase tracking-[0.3em] animate-fade-in border border-brand-proph/20">
              <Crown className="w-4 h-4" /> Elevate Your Academic Identity
           </div>
           <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">The <span className="text-brand-proph">Elite</span> Tier</h1>
           <p className="max-w-2xl mx-auto text-lg text-brand-muted font-medium italic">Upgrade your student node to unlock the full potential of federal institutional intelligence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {tiers.map((tier, idx) => (
             <div key={idx} className={`relative flex flex-col p-10 rounded-[3.5rem] border ${tier.featured ? 'border-brand-proph border-4 shadow-[0_0_50px_rgba(0,186,124,0.15)] bg-brand-card' : 'border-brand-border bg-brand-black'} transition-transform hover:scale-[1.02]`}>
                {tier.featured && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-brand-proph text-black font-black uppercase text-[10px] tracking-widest px-6 py-2 rounded-full italic shadow-xl">Best Value</div>
                )}
                
                <div className="space-y-4 mb-10">
                   <h3 className="text-2xl font-black italic uppercase tracking-tighter">{tier.name}</h3>
                   <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black italic tracking-tighter">₦{tier.price.toLocaleString()}</span>
                      <span className="text-xs font-black text-brand-muted uppercase italic tracking-widest">/{tier.period}</span>
                   </div>
                </div>

                <div className="space-y-6 mb-12 flex-grow">
                   <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-proph" /> Inclusion Criteria:</p>
                   <ul className="space-y-5">
                      {tier.features.map((f, i) => (
                        <li key={i} className="flex gap-3 text-sm font-medium text-gray-300 italic leading-snug">
                           <ShieldCheck className="w-4 h-4 text-brand-proph flex-shrink-0" /> {f}
                        </li>
                      ))}
                   </ul>
                </div>

                <button 
                  onClick={() => tier.isPremium && setSelectedTier({id: tier.id, name: tier.name, price: tier.price})}
                  className={`w-full py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl ${tier.id === 'weekly' ? 'bg-gray-800 text-gray-500 cursor-default' : `${tier.color} text-white hover:brightness-110`}`}
                  title={tier.btnText}
                >
                   {tier.btnText}
                </button>
             </div>
           ))}
        </div>

        {/* Purchase Modal */}
        {selectedTier && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-brand-card w-full max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-[3rem] border border-brand-border p-8 md:p-12 shadow-2xl relative">
               <button onClick={() => setSelectedTier(null)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white z-10"><X className="w-6 h-6" /></button>
               
               <div className="text-center mb-10">
                  <div className="bg-brand-proph/10 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-brand-proph/20">
                     <CreditCard className="w-8 h-8 text-brand-proph" />
                  </div>
                  <h2 className="text-2xl font-black italic uppercase">Initiate Upgrade</h2>
                  <p className="text-brand-muted text-sm italic">{selectedTier.name} • ₦{selectedTier.price.toLocaleString()}</p>
               </div>

               {config.isCardPaymentEnabled && (
                 <div className="flex gap-4 mb-8">
                   <button 
                     onClick={() => setPaymentMethod('bank')}
                     className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${paymentMethod === 'bank' ? 'bg-brand-proph text-black border-brand-proph' : 'bg-transparent text-gray-400 border-brand-border hover:border-brand-proph/50'}`}
                   >
                     Bank Transfer
                   </button>
                   <button 
                     onClick={() => setPaymentMethod('card')}
                     className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${paymentMethod === 'card' ? 'bg-brand-proph text-black border-brand-proph' : 'bg-transparent text-gray-400 border-brand-border hover:border-brand-proph/50'}`}
                   >
                     Card / USSD
                   </button>
                 </div>
               )}

               {paymentMethod === 'bank' ? (
                 <>
                   <div className="bg-brand-black p-6 rounded-3xl border border-brand-border space-y-4 mb-8">
                       <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-2"><Building className="w-3 h-3" /> Admin Collection Node</p>
                   <div className="space-y-3">
                      <div className="flex justify-between items-center group cursor-pointer" onClick={() => copyToClipboard(config.paymentAccount.accountNumber)}>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Account Number</p>
                         <div className="flex items-center gap-2">
                            <p className="font-black text-lg text-white font-mono">{config.paymentAccount.accountNumber}</p>
                            <Copy className="w-4 h-4 text-brand-muted group-hover:text-brand-proph" />
                         </div>
                      </div>
                      <div className="flex justify-between items-center">
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Bank Name</p>
                         <p className="font-black text-sm text-brand-proph uppercase">{config.paymentAccount.bankName}</p>
                      </div>
                      <div className="flex justify-between items-center">
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Recipient</p>
                         <p className="font-black text-xs text-white uppercase italic">{config.paymentAccount.accountName}</p>
                      </div>
                   </div>
                </div>

                <form onSubmit={handlePurchaseRequest} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Payment Reference / Transaction ID</label>
                      <input required className="w-full bg-brand-black border border-brand-border p-5 rounded-2xl outline-none focus:ring-1 focus:ring-brand-proph font-bold text-white italic" placeholder="Enter reference from your bank app..." value={txRef} onChange={e => setTxRef(e.target.value)} />
                   </div>

                   <div className="bg-blue-600/5 p-4 rounded-2xl border border-blue-500/20 flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <p className="text-[10px] text-gray-400 font-medium italic leading-relaxed">Please make the exact transfer of ₦{selectedTier.price.toLocaleString()} to the account above before submitting.</p>
                   </div>

                   <button disabled={isProcessing} className="w-full bg-brand-proph text-black py-5 rounded-[1.5rem] font-black uppercase text-sm tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3">
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Proof of Payment'}
                   </button>
                </form>
             </>
           ) : (
             <div className="space-y-8 animate-fade-in">
                <div className="bg-brand-black p-8 rounded-[2.5rem] border border-brand-border text-center space-y-6">
                   <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20">
                      <ShieldCheck className="w-10 h-10 text-blue-500" />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-xl font-black italic uppercase">Secure Gateway</h3>
                      <p className="text-xs text-brand-muted font-medium italic">You will be redirected to our secure payment partner to complete your ₦{selectedTier.price.toLocaleString()} transaction.</p>
                   </div>
                </div>

                <button 
                  onClick={handleCardPayment}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-sm tracking-widest shadow-xl hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                   {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay with Card / USSD'}
                </button>

                <p className="text-[9px] text-center text-brand-muted font-bold uppercase tracking-widest opacity-50 italic">Encrypted by Paystack Protocol</p>
             </div>
           )}
            </div>
          </div>
        )}

        <div className="bg-brand-card p-12 rounded-[4rem] border border-brand-border flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none"><Zap className="w-64 h-64" /></div>
           <div className="space-y-6 relative z-10 max-w-xl">
              <h3 className="text-3xl font-black italic uppercase">Institutional Grant?</h3>
              <p className="text-brand-muted leading-relaxed font-medium">If your University Student Union (SUG) has a partnership with Proph, you may qualify for a free premium upgrade. Verify your matriculation identity now.</p>
           </div>
           <button className="bg-white text-black px-12 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all flex items-center gap-2 group relative z-10 shadow-2xl" title="SUG Verification">
              Verify SUG Identity <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default Premium;
