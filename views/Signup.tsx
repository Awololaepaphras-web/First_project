
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Mail, BookOpen, GraduationCap, ChevronRight, Lock, User, AtSign, Loader2 } from 'lucide-react';
import { UNIVERSITIES } from '../constants';
import { User as UserType } from '../types';
import { SupabaseService } from '../src/services/supabaseService';

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
  
  const referralCode = searchParams.get('ref');

  useEffect(() => {
    if (referralCode) {
      onReferralClick(referralCode);
    }
  }, [referralCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password.length < 8) {
      setLoading(false);
      return setError('Passphrase must be 8+ characters.');
    }
    if (formData.password !== formData.confirmPassword) {
      setLoading(false);
      return setError('Passphrases mismatch.');
    }
    if (allUsers.some(u => u.email?.toLowerCase() === formData.email.toLowerCase())) {
      setLoading(false);
      return setError('Email already indexed.');
    }
    if (allUsers.some(u => u.nickname?.toLowerCase() === formData.nickname.toLowerCase())) {
      setLoading(false);
      return setError('Nickname already claimed.');
    }

    try {
      const referrer = allUsers.find(u => u.referralCode === referralCode);

      const newUser: UserType = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        nickname: formData.nickname.toLowerCase().replace(/\s/g, ''),
        email: formData.email,
        password: formData.password,
        isVerified: false,
        university: formData.university,
        level: formData.level,
        role: 'student',
        referralCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
        referredBy: referrer?.id,
        referralStats: { clicks: 0, signups: 0, withdrawals: 0, loginStreaks: 0 },
        points: 500 
      };

      // Create in Supabase Auth
      const { data, error: authError } = await SupabaseService.signUp(formData.email, formData.password, newUser);
      
      if (authError) {
        setError(authError.message);
      } else {
        // Save to users table
        await SupabaseService.saveUser(newUser);
        onSignup(newUser);
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError('Signup failed. Please try again.');
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
                <input required className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-brand-border rounded-2xl focus:ring-1 focus:ring-brand-proph outline-none font-bold text-white" placeholder="Scholar Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input required className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-brand-border rounded-2xl focus:ring-1 focus:ring-brand-proph outline-none font-bold text-white" placeholder="Handle (e.g. josh_unilag)" value={formData.nickname} onChange={(e) => setFormData({...formData, nickname: e.target.value})} />
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
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-proph text-black py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
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
    </div>
  );
};

export default Signup;
