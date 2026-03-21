
import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, ArrowRight, Terminal, Shield, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface AdminLoginProps {
  onLogin: (user: User) => void;
  allUsers: User[];
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, allUsers }) => {
  const [mode, setMode] = useState<'main' | 'staff'>('main');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'main') {
      // Super Admin check
      if (password === '197005') {
        // Fix: Added missing required property 'nickname' to User object
        const adminUser: User = {
          id: 'admin-1',
          name: 'Super Admin',
          nickname: 'admin',
          email: email || 'admin@proph.edu.ng',
          university: 'Federal Control',
          level: 'N/A',
          role: 'admin',
          isVerified: true,
          referralCode: 'SYSTEM_ADMIN',
          // Added loginStreaks to satisfy referralStats type requirement
          referralStats: { clicks: 0, signups: 0, withdrawals: 0, loginStreaks: 0 },
          status: 'active'
        };
        onLogin(adminUser);
        navigate('/Epaphrastheadminofprophandloveforx');
      } else {
        setError('Master security key invalid. Access denied.');
      }
    } else {
      // Staff (Sub-Admin) check
      const staffUser = allUsers.find(u => 
        u.role === 'sub-admin' && 
        u.email?.toLowerCase() === email.toLowerCase() && 
        u.password === password
      );

      if (staffUser) {
        onLogin(staffUser);
        navigate('/Epaphrastheadminofprophandloveforx');
      } else {
        setError('Identity not recognized or access key incorrect.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950 overflow-hidden relative">
      {/* Dynamic Background */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] transition-colors duration-700 ${mode === 'main' ? 'bg-green-600/10' : 'bg-blue-600/10'}`}></div>
      <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] transition-colors duration-700 ${mode === 'main' ? 'bg-emerald-600/10' : 'bg-indigo-600/10'}`}></div>

      <div className="max-w-md w-full relative z-10 py-12">
        {/* Portal Switcher */}
        <div className="flex bg-gray-900/50 p-1.5 rounded-2xl border border-gray-800 mb-8 backdrop-blur-md">
           <button 
            onClick={() => { setMode('main'); setError(''); setPassword(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'main' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <Shield className="w-3.5 h-3.5" /> Super Admin
           </button>
           <button 
            onClick={() => { setMode('staff'); setError(''); setPassword(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'staff' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <Terminal className="w-3.5 h-3.5" /> Staff Portal
           </button>
        </div>

        <div className="bg-gray-900 rounded-[3rem] shadow-2xl p-10 md:p-14 border border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          
          <div className="text-center mb-10">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-800 shadow-inner transition-colors duration-500 ${mode === 'main' ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
              {mode === 'main' ? (
                <ShieldCheck className="w-10 h-10 text-green-500" />
              ) : (
                <Terminal className="w-10 h-10 text-blue-500" />
              )}
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              {mode === 'main' ? 'Admin Gateway' : 'Staff Terminal'}
            </h2>
            <p className="text-gray-500 mt-2 font-medium">
              {mode === 'main' ? 'Main Resource Management' : 'Sub-Admin Operations Node'}
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-[10px] font-black uppercase">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Identifying Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-950 border border-gray-800 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none text-white transition-all font-bold placeholder:text-gray-700"
                  placeholder={mode === 'main' ? 'admin@proph.edu.ng' : 'staff_id@proph.edu.ng'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                {mode === 'main' ? 'Master Security Key' : 'Staff Access Key'}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-950 border border-gray-800 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none text-white transition-all font-bold"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-5 rounded-2xl font-black text-lg text-white transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] ${mode === 'main' ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'}`}
            >
              Access Protocol <ArrowRight className="w-5 h-5" />
            </button>
          </form>
          
          <div className="mt-10 pt-8 border-t border-gray-800 text-center">
             <button onClick={() => navigate('/')} className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] hover:text-white transition-colors">Return to Home Deck</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
