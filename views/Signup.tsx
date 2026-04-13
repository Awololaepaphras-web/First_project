
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Mail, BookOpen, GraduationCap, ChevronRight, Lock, User, AtSign, Loader2 } from 'lucide-react';
import { UNIVERSITIES } from '../constants';
import { User as UserType } from '../types';
import { SupabaseService } from '../src/services/supabaseService';
import PolicyModal from '../src/components/PolicyModal';

interface SignupProps {
  onSignup: (user: UserType) => void;
  allUsers: UserType[];
  onReferralClick: (refCode: string) => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, allUsers, onReferralClick }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    university: '',
    level: '100',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingNickname, setCheckingNickname] = useState(false);
  const [nicknameStatus, setNicknameStatus] = useState<'idle' | 'available' | 'taken'>('idle');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  
  const referralCode = searchParams.get('ref');

  useEffect(() => {
    if (referralCode) {
      onReferralClick(referralCode);
    }
  }, [referralCode]);

  useEffect(() => {
    const checkNickname = async () => {
      const cleanNickname = formData.nickname.toLowerCase().replace(/\s/g, '');
      if (cleanNickname.length < 3) {
        setNicknameStatus('idle');
        return;
      }

      setCheckingNickname(true);
      const isAvailable = await SupabaseService.isNicknameAvailable(cleanNickname);
      setNicknameStatus(isAvailable ? 'available' : 'taken');
      setCheckingNickname(false);
    };

    const timeoutId = setTimeout(checkNickname, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.nickname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNickname = formData.nickname.toLowerCase().replace(/\s/g, '');
    
    setLoading(true);
    setError('');

    if (formData.password.length < 8) {
      setLoading(false);
      return setError('Passphrase must be 8+ characters.');
    }
    if (formData.password !== formData.confirmPassword) {
      setLoading(false);
      return setError('Passphrases mismatch.');
    }

    // Check nickname availability in real-time
    const isAvailable = await SupabaseService.isNicknameAvailable(cleanNickname);
    if (!isAvailable) {
      setLoading(false);
      return setError('This nickname is already claimed. Please choose another.');
    }

    try {
      const referrer = allUsers.find(u => u.referralCode === referralCode);

      // We don't need to generate a random ID here, Supabase Auth will do it.
      // We pass the user metadata to signUp, and the database trigger will handle the rest.
      const userData = {
        name: formData.name,
        nickname: cleanNickname,
        university: formData.university,
        level: formData.level,
        referredBy: referrer?.id
      };

      // Create in Supabase Auth
      const { data, error: authError } = await SupabaseService.signUp(formData.email, formData.password, userData);
      
      if (authError) {
        setError(authError.message);
      } else if (data.user) {
        // If session is null, it means email confirmation is required
        if (!data.session) {
          setError('Verification required. Please check your email for a confirmation link before logging in.');
          setLoading(false);
          return;
        }

        // The trigger in Supabase will automatically create the user in the 'public.users' table
        // We can now fetch that user to get the full profile (including the generated Proph ID)
        const profile = await SupabaseService.getUserProfile(data.user.id);
        
        if (profile) {
          onSignup(profile);
          navigate('/');
        } else {
          // Fallback if profile isn't ready immediately
          const fallbackUser: UserType = {
            id: data.user.id,
            name: formData.name,
            nickname: cleanNickname,
            email: formData.email,
            university: formData.university,
            level: formData.level,
            role: 'student',
            referralCode: 'PENDING', // Will be updated on next fetch
            points: 500
          };
          onSignup(fallbackUser);
          navigate('/');
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('User already registered')) {
        setError('This email is already registered. Try logging in.');
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-brand-black py-20">
      <div className="max-w-4xl w-full bg-brand-card rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-brand-border">
        <div className="hidden md:flex md:w-5/12 bg-brand-proph p-12 text-black flex-col justify-between relative">
          <div className="absolute top-0 right-0 p-10 opacity-10"><GraduationCap className="w-64 h-64 -rotate-12" /></div>
          <div className="relative z-10">
            <div className="bg-black/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-black/5"><BookOpen className="w-10 h-10" /></div>
            <h2 className="text-4xl font-black mb-6 leading-tight italic uppercase tracking-tighter">FEDERAL <br />NODE <br />SYNC</h2>
            <p className="text-sm font-bold opacity-70 italic leading-relaxed">Access decentralized academic archives across Nigeria's federal network.</p>
          </div>
          <div className="flex items-center gap-3 bg-black/5 p-4 rounded-2xl border border-black/5 relative z-10">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Protocol Verified</span>
          </div>
        </div>
        
        <div className="w-full md:w-7/12 p-8 sm:p-14">
          <div className="mb-10">
            <h3 className="text-3xl font-black text-white tracking-tight uppercase italic">Sync Identity</h3>
            <p className="text-brand-muted font-medium text-sm">Forge your link to the university repository.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p className="text-[10px] font-black uppercase">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  required 
                  className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-brand-border rounded-2xl focus:ring-1 focus:ring-brand-proph outline-none font-bold text-white" 
                  placeholder="Scholar Full Name" 
                  value={formData.name} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '');
                    setFormData({...formData, name: val});
                  }} 
                />
              </div>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  required 
                  className={`w-full pl-12 pr-12 py-4 bg-gray-900 border ${
                    nicknameStatus === 'available' ? 'border-brand-proph' : 
                    nicknameStatus === 'taken' ? 'border-red-500' : 
                    'border-brand-border'
                  } rounded-2xl focus:ring-1 focus:ring-brand-proph outline-none font-bold text-white transition-colors`} 
                  placeholder="Handle (e.g. josh_unilag)" 
                  value={formData.nickname} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                    setFormData({...formData, nickname: val});
                  }} 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {checkingNickname && <div className="w-4 h-4 border-2 border-brand-proph border-t-transparent rounded-full animate-spin" />}
                  {nicknameStatus === 'available' && <ShieldCheck className="w-5 h-5 text-brand-proph" />}
                  {nicknameStatus === 'taken' && <AlertCircle className="w-5 h-5 text-red-500" />}
                </div>
                {nicknameStatus === 'taken' && (
                  <p className="absolute -bottom-5 left-4 text-[8px] font-black text-red-500 uppercase tracking-widest">Handle already claimed</p>
                )}
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input required type="email" className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-brand-border rounded-2xl focus:ring-1 focus:ring-brand-proph outline-none font-bold text-white" placeholder="Institutional Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select required className="w-full px-5 py-4 bg-gray-900 border border-brand-border rounded-2xl outline-none font-bold text-white text-xs uppercase" value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})}>
                  <option value="">Institution</option>
                  {UNIVERSITIES.map(uni => <option key={uni.id} value={uni.acronym}>{uni.acronym}</option>)}
                </select>
                <select className="w-full px-5 py-4 bg-gray-900 border border-brand-border rounded-2xl outline-none font-bold text-white text-xs uppercase" value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})}>
                  {['100', '200', '300', '400', '500'].map(l => <option key={l} value={l}>{l} Level</option>)}
                </select>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input required type="password" className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-brand-border rounded-2xl focus:ring-1 focus:ring-brand-proph outline-none font-bold text-white" placeholder="Matrix Passphrase" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input required type="password" className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-brand-border rounded-2xl focus:ring-1 focus:ring-brand-proph outline-none font-bold text-white" placeholder="Verify Passphrase" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
              </div>
            </div>

            <div className="flex items-start gap-3 p-2">
              <input 
                type="checkbox" 
                id="policy-agree"
                checked={agreedToPolicy}
                onChange={(e) => setAgreedToPolicy(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-brand-border bg-gray-900 text-brand-proph focus:ring-brand-proph cursor-pointer"
              />
              <label htmlFor="policy-agree" className="text-[10px] font-bold text-brand-muted uppercase tracking-widest leading-relaxed cursor-pointer">
                I have read and agree to the <button type="button" onClick={() => setIsPolicyModalOpen(true)} className="text-brand-proph hover:underline font-black">Protocol & Privacy Policy</button> of the Federal Node Sync.
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading || checkingNickname || nicknameStatus === 'taken' || !agreedToPolicy}
              className="w-full bg-brand-proph text-black py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>Syncing... <Loader2 className="w-5 h-5 animate-spin" /></>
              ) : (
                <>Sync Identity <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
          <p className="mt-8 text-center text-brand-muted font-medium text-xs uppercase tracking-widest italic">Already archived? <Link to="/login" className="text-brand-proph font-black hover:underline">Verify Identity</Link></p>
        </div>
      </div>
      
      <PolicyModal 
        isOpen={isPolicyModalOpen} 
        onClose={() => setIsPolicyModalOpen(false)} 
      />
    </div>
  );
};

export default Signup;
