
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { SupabaseService } from '../src/services/supabaseService';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await SupabaseService.updatePassword(password);
      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-brand-black py-12">
      <div className="max-w-md w-full bg-brand-card rounded-[3rem] shadow-2xl p-10 md:p-14 border border-brand-border">
        <div className="text-center">
          <div className="w-20 h-20 bg-brand-proph/10 text-brand-proph rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-brand-proph/20">
             <ShieldCheck className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-black text-white tracking-tight mb-2 italic uppercase">New Credentials</h2>
          <p className="text-brand-muted font-medium mb-8">Establish your new security parameters.</p>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-bold text-left uppercase">{error}</p>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleReset} className="space-y-6 text-left">
              <div>
                <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 ml-2">New Secure Passphrase</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    className="w-full pl-12 pr-6 py-4 bg-gray-900 border border-brand-border rounded-2xl focus:ring-1 focus:ring-brand-proph outline-none font-bold text-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 ml-2">Confirm New Secret</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    className="w-full pl-12 pr-6 py-4 bg-gray-900 border border-brand-border rounded-2xl focus:ring-1 focus:ring-brand-proph outline-none font-bold text-white"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-brand-proph text-black py-5 rounded-[2rem] font-black text-lg hover:brightness-110 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>Updating... <Loader2 className="w-5 h-5 animate-spin" /></>
                ) : (
                  'Update Passphrase'
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-8 animate-in zoom-in">
              <div className="w-20 h-20 bg-brand-proph/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-brand-proph" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase italic">Access Restored</h3>
                <p className="text-brand-muted font-medium">Your security credentials have been successfully updated.</p>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="w-full bg-white text-black py-5 rounded-[2rem] font-black text-lg hover:bg-gray-100 transition-all shadow-xl"
              >
                Go to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
