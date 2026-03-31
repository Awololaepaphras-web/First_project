
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Phone, ShieldCheck, BookOpen, Loader2 } from 'lucide-react';
import { User } from '../types';
import { SupabaseService } from '../src/services/supabaseService';

interface LoginProps {
  onLogin: (user: User) => void;
  allUsers: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, allUsers }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let emailToUse = identifier;
      
      // If it's not an email, try to find the email associated with this nickname
      if (!identifier.includes('@')) {
        const foundUserByNickname = allUsers.find(u => u.nickname?.toLowerCase() === identifier.toLowerCase());
        if (foundUserByNickname && foundUserByNickname.email) {
          emailToUse = foundUserByNickname.email;
        }
      }

      // First try Supabase Auth if it's an email (or we found one)
      if (emailToUse.includes('@')) {
        const { data, error: authError } = await SupabaseService.signIn(emailToUse, password);
        
        if (authError) {
          // If it's a specific auth error, show it
          if (authError.message.toLowerCase().includes('email not confirmed')) {
            setError('Email verification required. Please check your inbox.');
            return;
          }
          if (authError.message.toLowerCase().includes('invalid login credentials')) {
            setError('Invalid identity or account does not exist.');
            return;
          }
          // For other errors, we might want to fall back to local check (for mock users)
          console.warn('Supabase Auth error:', authError.message);
        } else if (data.user) {
          // Find the user in our users table
          const profile = await SupabaseService.getUserProfile(data.user.id);
          if (profile) {
            onLogin(profile);
            navigate('/');
            return;
          } else {
            setError('Profile not found. Please contact support.');
            return;
          }
        }
      }

      // Fallback to local check (for existing mock users or phone login)
      // Note: This only works for users that have a password field in the local DB
      const foundUser = allUsers.find(u => 
        u.email?.toLowerCase() === identifier.toLowerCase() || 
        u.phone === identifier
      );
      
      if (foundUser && (foundUser as any).password === password) {
        onLogin(foundUser);
        navigate('/');
      } else {
        setError('Invalid identity or account does not exist.');
      }
    } catch (err) {
      console.error(err);
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-brand-black py-12">
      <div className="max-w-md w-full bg-brand-card rounded-[3rem] shadow-2xl p-10 md:p-14 border border-brand-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-proph/5 rounded-bl-full -z-0"></div>

        <div className="relative z-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-brand-proph rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-proph/10">
               <BookOpen className="w-10 h-10 text-black" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">Archive Portal</h2>
            <p className="text-brand-muted mt-2 font-medium italic">Verify your credentials to enter the vault.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 ml-2">Email Identity</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-brand-black border border-brand-border rounded-2xl focus:ring-1 focus:ring-brand-proph outline-none transition-all font-bold text-white"
                  placeholder="name@student.edu.ng"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3 ml-2">
                <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest">Secret Passphrase</label>
                <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-brand-proph uppercase hover:underline pr-2">Forgot Key?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-brand-black border border-brand-border rounded-2xl focus:ring-1 focus:ring-brand-proph outline-none transition-all font-bold text-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-proph text-black py-5 rounded-2xl font-black text-lg hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-brand-proph/20 active:scale-95 uppercase tracking-widest italic disabled:opacity-50"
            >
              {loading ? (
                <>Verifying... <Loader2 className="w-5 h-5 animate-spin" /></>
              ) : (
                <>Verify & Enter <LogIn className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-4">
            <div className="relative">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-border"></div></div>
               <div className="relative flex justify-center text-[10px] uppercase font-black text-brand-muted tracking-widest"><span className="bg-brand-card px-4">System Access</span></div>
            </div>

            <div className="pt-4 text-center space-y-4">
              <p className="text-brand-muted font-medium italic">
                Not yet archived?{' '}
                <Link to="/signup" className="text-brand-proph font-black hover:underline">
                  Create Secure Identity
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
