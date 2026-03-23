
import React, { useState, useRef } from 'react';
import { Megaphone, Camera, Video, ChevronRight, CheckCircle2, Globe, Building2, Search, X, Link as LinkIcon, Upload, MapPin, CreditCard, BarChart3, Loader2 } from 'lucide-react';
import { User, AdPricing, Advertisement, SystemConfig, PaymentVerification } from '../types';
import { UNIVERSITIES } from '../constants';
import { useNavigate } from 'react-router-dom';
import { CloudinaryService } from '../src/services/cloudinaryService';

interface UserAdsProps {
  user: User;
  pricing: AdPricing;
  config: SystemConfig;
  onDeploy: (ad: Partial<Advertisement>) => void;
  onVerifyPayment: (verification: PaymentVerification) => void;
}

const UserAds: React.FC<UserAdsProps> = ({ user, pricing, config, onDeploy, onVerifyPayment }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | null>(null);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [paymentRef, setPaymentRef] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [isSubmittingRef, setIsSubmittingRef] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    mediaUrl: '',
    link: '',
    mediaType: 'image' as 'image' | 'video',
    tier: 'daily' as keyof AdPricing,
    days: 1
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const basePrice = formData.tier === 'daily' ? pricing.daily * formData.days : pricing[formData.tier];
  const totalCost = basePrice * (selectedSchools.length || 1);

  const toggleSchool = (acronym: string) => {
    setSelectedSchools(prev => 
      prev.includes(acronym) ? prev.filter(a => a !== acronym) : [...prev, acronym]
    );
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await CloudinaryService.uploadFile(file, formData.mediaType);
        setFormData({ ...formData, mediaUrl: url });
      } catch (error) {
        console.error('Ad media upload failed:', error);
        alert('Failed to upload ad media.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSchools.length === 0) {
      alert("Targeting Error: Please select at least one university node.");
      return;
    }
    setStep(2);
  };

  const handlePaymentMethodSelect = (method: 'card' | 'transfer') => {
    setPaymentMethod(method);
    setStep(3);
  };

  const handleSubmitPayment = () => {
    if (paymentMethod === 'transfer' && !paymentRef.trim()) {
      alert("Please enter your payment reference number.");
      return;
    }
    
    if (paymentMethod === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      alert("Please complete all card details.");
      return;
    }

    setIsSubmittingRef(true);
    
    // Generate ID here so it can be used for both verification and ad
    const adId = crypto.randomUUID();
    setFormData(prev => ({ ...prev, id: adId }));
    
    const reference = paymentMethod === 'card' ? `CARD-${crypto.randomUUID().slice(0, 8).toUpperCase()}` : paymentRef;

    const verification: PaymentVerification = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      type: 'ad',
      amount: totalCost,
      reference: reference,
      status: 'pending',
      createdAt: Date.now(),
      details: {
        adId: adId,
        adTitle: formData.title || 'Pending Ad',
        schools: selectedSchools,
        paymentMethod: paymentMethod
      }
    };

    onVerifyPayment(verification);
    
    setTimeout(() => {
      setIsSubmittingRef(false);
      setStep(4);
    }, 1500);
  };

  const handleFinalDeploy = () => {
    if (!formData.title || !formData.mediaUrl) {
      alert("Asset Error: Please provide a title and campaign media.");
      return;
    }
    const newAd: Partial<Advertisement> = {
      id: (formData as any).id || Math.random().toString(36).substr(2, 9),
      title: formData.title,
      mediaUrl: formData.mediaUrl,
      type: formData.mediaType,
      link: formData.link,
      userId: user.id,
      status: 'payment_pending',
      timeFrames: ['12am-6am', '6am-12pm', '12pm-6pm', '6pm-12am'],
      analytics: [],
      // @ts-ignore
      paymentReference: paymentRef || 'CARD_PAYMENT'
    };
    onDeploy(newAd);
    setStep(5);
  };

  return (
    <div className="py-16 px-4 max-w-full mx-auto space-y-16 animate-fade-in">
      <div className="text-center space-y-4">
         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-proph/10 text-brand-proph text-[10px] font-black uppercase tracking-widest border border-brand-proph/20">
           <Megaphone className="w-4 h-4" />
           <span>Outreach Targeting Portal</span>
         </div>
         <h1 className="text-4xl md:text-6xl font-black dark:text-white tracking-tighter uppercase italic">
            Deploy <span className="text-brand-proph">Targeted</span> Ads
         </h1>
         <p className="max-w-2xl mx-auto text-brand-muted font-medium text-lg italic">Select individual nodes or entire federal circuits for maximum visibility.</p>
         
         <div className="flex justify-center pt-4">
           <button 
             onClick={() => navigate('/ad-analytics')}
             className="flex items-center gap-2 px-6 py-3 bg-gray-900 border border-gray-800 rounded-2xl text-brand-muted hover:text-brand-proph transition-all font-black uppercase text-[10px] tracking-widest"
           >
             <BarChart3 className="w-4 h-4" /> View Campaign Analytics
           </button>
         </div>

         {/* Step Progress Bar */}
         <div className="max-w-xl mx-auto pt-8">
            <div className="flex items-center justify-between relative">
               <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-800 -z-10" />
               <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand-proph transition-all duration-500 -z-10" style={{ width: `${((step - 1) / 4) * 100}%` }} />
               
               {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="flex flex-col items-center gap-2">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 ${step >= s ? 'bg-brand-proph text-black shadow-[0_0_15px_rgba(0,186,124,0.4)]' : 'bg-gray-900 text-gray-500 border border-gray-800'}`}>
                        {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                     </div>
                     <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${step >= s ? 'text-brand-proph' : 'text-gray-600'} ${s === 5 && step === 5 ? 'animate-pulse drop-shadow-[0_0_8px_rgba(0,186,124,0.8)]' : ''}`}>
                        {s === 1 ? 'Target' : s === 2 ? 'Method' : s === 3 ? 'Pay' : s === 4 ? 'Asset' : 'Live'}
                     </span>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <div className="bg-white dark:bg-brand-card rounded-[3.5rem] shadow-2xl border border-brand-border overflow-hidden flex flex-col lg:flex-row">
         {step <= 3 && (
           <div className="lg:w-5/12 bg-gray-950 p-10 text-white space-y-10 animate-fade-in">
              <div>
                 <h3 className="text-2xl font-black mb-2 uppercase italic text-brand-proph">Cost Estimator</h3>
                 <p className="text-gray-400 text-sm font-medium italic">Scaling based on node density.</p>
              </div>
              
              <div className="space-y-4">
                 {(['daily', 'weekly', 'monthly'] as const).map(t => (
                   <button 
                    key={t}
                    onClick={() => setFormData({...formData, tier: t})}
                    className={`w-full p-6 rounded-3xl border-2 transition-all flex justify-between items-center ${formData.tier === t ? 'bg-brand-proph border-brand-proph text-black shadow-[0_0_30px_rgba(0,186,124,0.3)]' : 'bg-gray-900 border-gray-800 text-gray-400'}`}
                   >
                      <div className="text-left">
                        <p className="font-black uppercase tracking-widest text-[10px]">{t} Campaign {t === 'weekly' ? '(7 Days)' : t === 'monthly' ? '(30 Days)' : ''}</p>
                        <p className="text-xs font-bold opacity-60">₦{pricing[t].toLocaleString()} / school</p>
                      </div>
                   </button>
                 ))}

                 {formData.tier === 'daily' && (
                   <div className="p-4 bg-gray-900 border border-gray-800 rounded-3xl space-y-2 animate-fade-in">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Campaign Duration (Days)</p>
                      <input 
                        type="number" 
                        min="1"
                        value={formData.days}
                        onChange={e => setFormData({...formData, days: Math.max(1, parseInt(e.target.value) || 1)})}
                        className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none focus:ring-1 focus:ring-brand-proph font-black text-white text-center text-lg"
                      />
                   </div>
                 )}
              </div>

              <div className="p-8 bg-brand-proph/10 rounded-[2.5rem] border border-brand-proph/20 space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-black text-brand-proph uppercase tracking-widest">
                    <span>Targeted Nodes</span>
                    <span>{selectedSchools.length} Schools</span>
                 </div>
                 <div className="h-px bg-white/10" />
                 <p className="text-5xl font-black text-white tracking-tighter italic">₦{totalCost.toLocaleString()}</p>
              </div>
           </div>
         )}

         <div className={`${step <= 3 ? 'lg:w-7/12' : 'w-full'} p-10 lg:p-14 transition-all duration-500`}>
            {step === 1 && (
               <div className="space-y-10 animate-fade-in">
                  <div className="space-y-2">
                     <h3 className="text-3xl font-black dark:text-white uppercase italic">1. Select Target Nodes</h3>
                     <p className="text-brand-muted font-medium italic text-sm">Tap institutions to activate targeting.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[350px] overflow-y-auto custom-scrollbar p-1 snap-y">
                     {UNIVERSITIES.map(uni => (
                        <button 
                          key={uni.id}
                          onClick={() => toggleSchool(uni.acronym)}
                          className={`p-5 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all snap-start flex flex-col items-center gap-2 ${selectedSchools.includes(uni.acronym) ? 'bg-brand-proph border-brand-proph text-black' : 'bg-gray-50 dark:bg-gray-900 border-brand-border dark:text-gray-400 hover:border-brand-proph'}`}
                        >
                           <img src={uni.logo} className="w-8 h-8 object-contain" alt="" />
                           {uni.acronym}
                        </button>
                     ))}
                  </div>

                  <button onClick={() => setStep(2)} disabled={selectedSchools.length === 0} className="w-full bg-brand-proph text-black py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50">Proceed to Settlement <ChevronRight className="w-5 h-5" /></button>
               </div>
            )}

            {step === 2 && (
               <div className="space-y-10 animate-fade-in">
                  <div className="space-y-2">
                     <h3 className="text-3xl font-black dark:text-white uppercase italic">2. Settlement Method</h3>
                     <p className="text-brand-muted font-medium italic text-sm">Choose your preferred payment gateway.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <button 
                      onClick={() => handlePaymentMethodSelect('transfer')}
                      className="flex items-center gap-6 p-8 bg-gray-50 dark:bg-gray-900 border border-brand-border rounded-[2.5rem] hover:border-brand-proph transition-all group text-left"
                    >
                      <div className="p-4 bg-brand-proph/10 rounded-2xl text-brand-proph group-hover:scale-110 transition-transform">
                        <Building2 className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-lg font-black dark:text-white uppercase italic">Bank Transfer</p>
                        <p className="text-xs text-brand-muted font-medium italic">Manual verification via reference ID</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => handlePaymentMethodSelect('card')}
                      className="flex items-center gap-6 p-8 bg-gray-50 dark:bg-gray-900 border border-brand-border rounded-[2.5rem] hover:border-brand-proph transition-all group text-left"
                    >
                      <div className="p-4 bg-brand-proph/10 rounded-2xl text-brand-proph group-hover:scale-110 transition-transform">
                        <CreditCard className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-lg font-black dark:text-white uppercase italic">Card Payment</p>
                        <p className="text-xs text-brand-muted font-medium italic">Secure instant processing</p>
                      </div>
                    </button>
                  </div>

                  <button onClick={() => setStep(1)} className="px-10 py-5 bg-gray-100 dark:bg-gray-800 text-brand-muted rounded-2xl font-black text-xs uppercase">Back</button>
               </div>
            )}

            {step === 3 && (
               <div className="space-y-10 animate-fade-in">
                  <div className="space-y-2">
                     <h3 className="text-3xl font-black dark:text-white uppercase italic">
                       {paymentMethod === 'transfer' ? '3. Bank Transfer' : '3. Card Payment'}
                     </h3>
                     <p className="text-brand-muted font-medium italic text-sm">Complete your settlement for node deployment.</p>
                  </div>

                  {paymentMethod === 'transfer' ? (
                    <div className="p-8 bg-gray-950 rounded-[2.5rem] border border-brand-border space-y-6">
                      <div className="p-6 bg-brand-proph/5 border border-brand-proph/20 rounded-3xl space-y-4">
                        <h4 className="text-brand-proph font-black text-xs uppercase tracking-widest">Bank Transfer Details</h4>
                        <div className="grid grid-cols-1 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-bold italic">Bank Name:</span>
                            <span className="text-white font-black">{config.paymentAccount.bankName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-bold italic">Account Number:</span>
                            <span className="text-white font-black tracking-widest">{config.paymentAccount.accountNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-bold italic">Account Name:</span>
                            <span className="text-white font-black">{config.paymentAccount.accountName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Payment Reference / Transaction ID</p>
                        <input 
                          type="text" 
                          placeholder="Enter Reference Number"
                          value={paymentRef}
                          onChange={e => setPaymentRef(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl outline-none focus:ring-1 focus:ring-brand-proph font-black text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Visual Card Preview */}
                      <div className="relative w-full h-48 bg-gradient-to-br from-gray-800 to-gray-950 rounded-3xl p-8 border border-white/10 shadow-2xl overflow-hidden group">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-brand-proph/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-brand-proph/20 transition-all" />
                         <div className="relative h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                               <div className="w-12 h-8 bg-gray-700/50 rounded-md border border-white/5" />
                               <CreditCard className="w-8 h-8 text-brand-proph" />
                            </div>
                            <div className="space-y-4">
                               <p className="text-xl font-mono tracking-[0.3em] text-white">
                                  {cardDetails.number || '•••• •••• •••• ••••'}
                               </p>
                               <div className="flex justify-between items-end">
                                  <div>
                                     <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Card Holder</p>
                                     <p className="text-xs font-black text-white uppercase italic">{cardDetails.name || 'YOUR NAME'}</p>
                                  </div>
                                  <div>
                                     <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Expires</p>
                                     <p className="text-xs font-black text-white uppercase">{cardDetails.expiry || 'MM/YY'}</p>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="p-8 bg-gray-950 rounded-[2.5rem] border border-brand-border space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Card Number</p>
                            <input 
                              type="text" 
                              placeholder="0000 0000 0000 0000"
                              className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl outline-none focus:ring-1 focus:ring-brand-proph font-black text-white"
                              value={cardDetails.number}
                              onChange={e => setCardDetails({...cardDetails, number: e.target.value})}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Expiry Date</p>
                              <input 
                                type="text" 
                                placeholder="MM/YY"
                                className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl outline-none focus:ring-1 focus:ring-brand-proph font-black text-white"
                                value={cardDetails.expiry}
                                onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">CVV</p>
                              <input 
                                type="text" 
                                placeholder="123"
                                className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl outline-none focus:ring-1 focus:ring-brand-proph font-black text-white"
                                value={cardDetails.cvv}
                                onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Cardholder Name</p>
                            <input 
                              type="text" 
                              placeholder="NAME ON CARD"
                              className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl outline-none focus:ring-1 focus:ring-brand-proph font-black text-white"
                              value={cardDetails.name}
                              onChange={e => setCardDetails({...cardDetails, name: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button onClick={() => setStep(2)} className="px-10 py-5 bg-gray-800 text-brand-muted rounded-2xl font-black text-xs uppercase">Back</button>
                    <button 
                      onClick={handleSubmitPayment}
                      disabled={isSubmittingRef}
                      className="flex-grow bg-brand-proph text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      {isSubmittingRef ? 'Processing...' : 'Confirm Settlement'}
                    </button>
                  </div>
               </div>
            )}

            {step === 4 && (
               <div className="space-y-10 animate-fade-in">
                  <div className="space-y-2">
                     <h3 className="text-3xl font-black dark:text-white uppercase italic">4. Asset Definition</h3>
                     <p className="text-brand-muted font-medium italic text-sm">Define your visual outreach.</p>
                  </div>
                  
                  <div className="space-y-6">
                    <input className="w-full bg-gray-50 dark:bg-gray-900 border border-brand-border p-5 rounded-2xl outline-none focus:ring-1 focus:ring-brand-proph font-bold dark:text-white" placeholder="Campaign Identifier (e.g. Freshers' Discount)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    <input className="w-full bg-gray-50 dark:bg-gray-900 border border-brand-border p-5 rounded-2xl outline-none focus:ring-1 focus:ring-brand-proph font-bold dark:text-white" placeholder="Destination Link (e.g. https://yourwebsite.com)" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={() => setFormData({...formData, mediaType: 'image'})} className={`p-4 rounded-2xl flex items-center justify-center gap-2 border-2 transition-all ${formData.mediaType === 'image' ? 'bg-brand-proph border-brand-proph text-black' : 'bg-gray-900 border-gray-800 text-gray-400'}`}><Camera className="w-4 h-4" /> <span className="text-[10px] font-black uppercase">Image Ad</span></button>
                       <button onClick={() => setFormData({...formData, mediaType: 'video'})} className={`p-4 rounded-2xl flex items-center justify-center gap-2 border-2 transition-all ${formData.mediaType === 'video' ? 'bg-brand-proph border-brand-proph text-black' : 'bg-gray-900 border-gray-800 text-gray-400'}`}><Video className="w-4 h-4" /> <span className="text-[10px] font-black uppercase">Video Ad</span></button>
                    </div>
                    <button disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="w-full p-8 border-2 border-dashed border-brand-border rounded-3xl flex flex-col items-center gap-4 text-brand-muted hover:bg-black/5 transition-all disabled:opacity-50">
                       {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-brand-proph" /> : <Upload className="w-8 h-8" />}
                       <span className="text-xs font-black uppercase tracking-widest">
                         {isUploading ? 'Uploading Asset...' : formData.mediaUrl ? 'Asset Loaded' : 'Select Campaign Media'}
                       </span>
                    </button>
                    <input type="file" ref={fileInputRef} hidden accept={formData.mediaType === 'image' ? 'image/*' : 'video/*'} onChange={handleMediaUpload} />
                    
                    <div className="flex gap-4">
                       <button disabled={isUploading} onClick={handleFinalDeploy} className="w-full bg-brand-proph text-black py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-50">
                         {isUploading ? 'Synchronizing Asset...' : `Deploy Across ${selectedSchools.length} Nodes`}
                       </button>
                    </div>
                  </div>
               </div>
            )}

            {step === 5 && (
               <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-zoom-in">
                  <div className="w-24 h-24 bg-brand-proph rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,186,124,0.5)]">
                     <CheckCircle2 className="w-12 h-12 text-black animate-bounce" />
                  </div>
                  <div className="space-y-3">
                     <h3 className="text-3xl font-black dark:text-white uppercase italic">Mission Deployment Success</h3>
                     <p className="text-brand-muted font-medium max-w-sm italic">Verification nodes are processing your campaign. Reach will begin syncing in 10 minutes.</p>
                  </div>
                  <button onClick={() => setStep(1)} className="px-12 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-proph transition-colors">Setup New Circuit</button>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default UserAds;
