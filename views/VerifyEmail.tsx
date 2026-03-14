
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { User } from '../types';

interface VerifyEmailProps {
  user: User;
  onVerify: (userId: string) => void;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ user, onVerify }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simulated verification logic
    if (code === (user.verificationCode || '123456')) {
      onVerify(user.id);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } else {
      setError('Invalid verification code. Please check your simulated inbox.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50 py-12">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 md:p-14 border border-gray-100 text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-100">
           <Mail className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Verify Official Email</h2>
        <p className="text-gray-500 font-medium mb-8">We've sent a 6-digit secure code to <span className="text-blue-600 font-bold">{user.email}</span>.</p>

        {success ? (
          <div className="space-y-6 animate-in zoom-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-green-600 font-black uppercase tracking-widest">Account Verified Successfully!</p>
            <p className="text-gray-400 text-sm">Redirecting to your dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs font-bold uppercase text-left">{error}</p>
              </div>
            )}

            <div className="relative">
              <input
                type="text"
                maxLength={6}
                required
                className="w-full px-6 py-6 bg-gray-50 border border-gray-200 rounded-[2rem] text-center text-3xl font-black tracking-[0.5em] text-gray-900 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-200"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
            >
              Verify Identity
            </button>

            <div className="pt-8 border-t border-gray-50">
               <div className="p-4 bg-gray-50 rounded-2xl flex items-start gap-3 text-left">
                  <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Demo Tip</p>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      In this demo environment, use the code <span className="font-black text-gray-900">123456</span> to complete verification.
                    </p>
                  </div>
               </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
