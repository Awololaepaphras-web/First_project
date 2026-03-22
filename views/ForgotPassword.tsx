
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, ArrowLeft, Loader2, Mail } from 'lucide-react';
import { User } from '../types';
import { SupabaseService } from '../src/services/supabaseService';

interface ForgotPasswordProps {
  allUsers: User[];
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ allUsers }) => {
  const [step, setStep] = useState<'email' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: resetError } = await SupabaseService.resetPasswordForEmail(email);
      if (resetError) {
        setError(resetError.message);
      } else {
        setStep('success');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-brand-black py-12">
      <div className="max-w-md w-full bg-brand-card rounded-[3rem] shadow-2xl p-10 md:p-14 border border-brand-border">
        <Link to="/login" className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-proph font-black text-[10px] uppercase tracking-widest mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Vault
        </Link>

        <div className="text-center">
          <div className="w-20 h-20 bg-brand-proph/10 text-brand-proph rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-brand-proph/20">
             <ShieldCheck className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-black text-white tracking-tight mb-2 italic uppercase">Account Recovery</h2>
          <p className="text-brand-muted font-medium mb-8">Restore access to your secure academic repository.</p>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-bold text-left uppercase">{error}</p>
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleSendResetLink} className="space-y-6">
              <div className="text-left">
                <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 ml-2">Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="w-full pl-12 pr-6 py-4 bg-gray-900 border border-brand-border rounded-2xl focus:ring-1 focus:ring-brand-proph outline-none font-bold text-white"
                    placeholder="amina@student.edu.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-brand-proph text-black py-5 rounded-[2rem] font-black text-lg hover:brightness-110 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>Sending... <Loader2 className="w-5 h-5 animate-spin" /></>
                ) : (
                  'Send Recovery Link'
                )}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="space-y-8 animate-in zoom-in">
              <div className="w-20 h-20 bg-brand-proph/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-brand-proph" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase italic">Link Dispatched</h3>
                <p className="text-brand-muted font-medium">Check your official email for the recovery link to restore your node access.</p>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="w-full bg-white text-black py-5 rounded-[2rem] font-black text-lg hover:bg-gray-100 transition-all shadow-xl"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
