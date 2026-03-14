
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface ForgotPasswordProps {
  allUsers: User[];
  onResetPassword: (email: string, newPassword: string) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ allUsers, onResetPassword }) => {
  const [step, setStep] = useState<'email' | 'code' | 'new-password' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setStep('code');
    } else {
      setError('No student account found with that official email.');
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === '999999') {
      setStep('new-password');
      setError('');
    } else {
      setError('Invalid recovery code. (Demo: use 999999)');
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    onResetPassword(email, newPassword);
    setStep('success');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50 py-12">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 md:p-14 border border-gray-100">
        <Link to="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-green-600 font-black text-[10px] uppercase tracking-widest mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Vault
        </Link>

        <div className="text-center">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
             <ShieldCheck className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Account Recovery</h2>
          <p className="text-gray-500 font-medium mb-8">Restore access to your secure academic repository.</p>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-bold text-left uppercase">{error}</p>
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="text-left">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Official Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-700"
                  placeholder="amina@student.edu.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-green-700 transition-all shadow-xl">
                Send Recovery Code
              </button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="text-left">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">6-Digit Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  className="w-full px-6 py-6 bg-gray-50 border border-gray-200 rounded-[2rem] text-center text-3xl font-black tracking-[0.5em] text-gray-900 outline-none"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase">Demo: Use 999999</p>
              <button type="submit" className="w-full bg-green-600 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-green-700 transition-all shadow-xl">
                Verify Code
              </button>
            </form>
          )}

          {step === 'new-password' && (
            <form onSubmit={handleReset} className="space-y-6 text-left">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">New Secure Passphrase</label>
                <input
                  type="password"
                  required
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-700"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Confirm New Secret</label>
                <input
                  type="password"
                  required
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-700"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-green-700 transition-all shadow-xl">
                Reset Passphrase
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="space-y-8 animate-in zoom-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-gray-900 uppercase">Access Restored</h3>
                <p className="text-gray-500 font-medium">Your security credentials have been updated.</p>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-black transition-all shadow-xl"
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

export default ForgotPassword;
