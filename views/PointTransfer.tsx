
import React, { useState, useEffect } from 'react';
import { 
  Send, Search, User, ArrowRight, ShieldCheck, 
  AlertCircle, CheckCircle2, Wallet, History,
  TrendingUp, Users, Zap, Coins
} from 'lucide-react';
import { User as UserType } from '../types';
import { Database } from '../src/services/database';
import { useNavigate } from 'react-router-dom';

interface PointTransferProps {
  user: UserType;
}

const PointTransfer: React.FC<PointTransferProps> = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await Database.getUsers();
      setAllUsers(users.filter(u => u.id !== user.id));
    };
    fetchUsers();
  }, [user.id]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers([]);
    } else {
      const filtered = allUsers.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.referralCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, allUsers]);

  const handleTransfer = async () => {
    if (!selectedUser || amount < 5000) {
      if (amount < 5000) {
        setMessage({ type: 'error', text: 'Minimum transfer amount is 5,000 Prophy Coins.' });
      }
      return;
    }
    if (amount > (user.points || 0)) {
      setMessage({ type: 'error', text: 'Insufficient Prophy Coins in your vault.' });
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const result = await Database.transferPoints(user.id, selectedUser.id, amount);
      if (result.success) {
        setMessage({ type: 'success', text: `Successfully transferred ${amount} Prophy Coins to ${selectedUser.name}.` });
        setAmount(0);
        setSelectedUser(null);
        setSearchQuery('');
        // Update local user points (this would ideally be handled by a global state or real-time listener)
        user.points = (user.points || 0) - amount;
      } else {
        setMessage({ type: 'error', text: 'Transfer failed. Please try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-black py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-brand-proph/10 text-brand-proph text-[10px] font-black uppercase tracking-[0.3em] border border-brand-proph/20">
            <Send className="w-4 h-4" />
            <span>Prophy Coin Distribution Protocol</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter leading-none italic uppercase">
            Transfer <span className="text-brand-proph">Intel</span>
          </h1>
          <p className="max-w-xl mx-auto text-gray-500 dark:text-brand-muted font-medium text-lg italic">
            Securely distribute your earned Prophy Coins to other nodes within the federal network.
          </p>
          <div className="bg-brand-proph/5 border border-brand-proph/20 p-4 rounded-2xl max-w-md mx-auto">
             <p className="text-[10px] font-black uppercase tracking-widest text-brand-proph flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Check your Settings to find your 17-character Proph ID
             </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Wallet Info */}
          <div className="space-y-6">
            <div className="bg-gray-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-proph/10 rounded-full blur-3xl"></div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <Zap className="w-6 h-6 text-brand-proph" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Daily Allowance</span>
                </div>
                <div>
                  <p className="text-3xl font-black italic tracking-tighter text-white">{(user.dailyPoints || 0).toLocaleString()}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-proph mt-1">Renewable Daily</p>
                </div>
                
                <div className="pt-6 border-t border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                      <Coins className="w-6 h-6 text-yellow-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Purse Balance</span>
                  </div>
                  <div>
                    <p className="text-5xl font-black italic tracking-tighter text-white">{(user.points || 0).toLocaleString()}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500 mt-1">Transferable Earnings</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-brand-card p-8 rounded-[3rem] border border-gray-100 dark:border-brand-border shadow-sm space-y-6">
               <h3 className="text-sm font-black italic uppercase flex items-center gap-2 text-gray-900 dark:text-white">
                  <ShieldCheck className="w-5 h-5 text-brand-proph" />
                  Security Protocol
               </h3>
               <ul className="space-y-4">
                  {[
                    'Transfers are irreversible once confirmed',
                    'Minimum transfer amount is 5,000 Prophy Coins',
                    'Only Purse Balance (Earnings) can be transferred',
                    'Daily Allowance is for in-app actions only',
                    'Recipient must be a verified node'
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-gray-500 dark:text-brand-muted font-medium italic">
                       <div className="w-1.5 h-1.5 rounded-full bg-brand-proph mt-1.5 flex-shrink-0" />
                       {text}
                    </li>
                  ))}
               </ul>
            </div>
          </div>

          {/* Right Column: Transfer Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-brand-card p-8 md:p-12 rounded-[4rem] border border-gray-100 dark:border-brand-border shadow-xl space-y-10">
              
              {/* Step 1: Find User */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-proph text-black flex items-center justify-center font-black text-xs">1</div>
                  <h3 className="text-xl font-black italic uppercase tracking-tight text-gray-900 dark:text-white">Identify Recipient</h3>
                </div>

                {selectedUser ? (
                  <div className="flex items-center justify-between p-6 bg-brand-proph/5 border border-brand-proph/20 rounded-3xl animate-in zoom-in-95">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-brand-proph/20 rounded-2xl flex items-center justify-center font-black text-xl text-brand-proph">
                        {selectedUser.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-lg italic uppercase text-gray-900 dark:text-white">{selectedUser.name}</p>
                        <p className="text-xs text-brand-proph font-black uppercase tracking-widest">Proph ID: {selectedUser.referralCode}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedUser(null)}
                      className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline"
                    >
                      Change Node
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-brand-muted" />
                    <input 
                      type="text"
                      placeholder="Search by name, @nickname or Proph ID..."
                      className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-brand-border rounded-3xl py-6 pl-14 pr-6 text-lg font-bold text-gray-900 dark:text-white focus:border-brand-proph focus:ring-0 outline-none transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    
                    {filteredUsers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-brand-card border border-gray-100 dark:border-brand-border rounded-3xl shadow-2xl z-50 max-h-64 overflow-y-auto no-scrollbar p-2">
                        {filteredUsers.map(u => (
                          <button 
                            key={u.id}
                            onClick={() => setSelectedUser(u)}
                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all text-left group"
                          >
                            <div className="w-10 h-10 bg-gray-100 dark:bg-brand-border rounded-xl flex items-center justify-center font-black text-gray-400 dark:text-brand-muted group-hover:bg-brand-proph group-hover:text-black transition-colors">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-sm uppercase italic text-gray-900 dark:text-white">{u.name}</p>
                              <p className="text-[10px] text-gray-400 dark:text-brand-muted font-black uppercase tracking-widest">Proph ID: {u.referralCode}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2: Amount */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-proph text-black flex items-center justify-center font-black text-xs">2</div>
                  <h3 className="text-xl font-black italic uppercase tracking-tight text-gray-900 dark:text-white">Allocation Amount</h3>
                </div>

                <div className="relative">
                  <input 
                    type="number"
                    placeholder="5000"
                    className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-brand-border rounded-3xl py-8 px-8 text-5xl font-black italic tracking-tighter text-gray-900 dark:text-white focus:border-brand-proph focus:ring-0 outline-none transition-all"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-brand-muted font-black uppercase tracking-widest text-xs">
                    Prophy Coins
                  </div>
                </div>
                
                <div className="flex gap-2">
                   {[5000, 10000, 25000, 50000].map(val => (
                     <button 
                       key={val}
                       onClick={() => setAmount(val)}
                       className="px-6 py-2 bg-gray-100 dark:bg-brand-border text-gray-900 dark:text-white hover:bg-brand-proph hover:text-black dark:hover:bg-brand-proph dark:hover:text-black rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                     >
                       +{val.toLocaleString()}
                     </button>
                   ))}
                   <button 
                     onClick={() => setAmount(user.points || 0)}
                     className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full text-[10px] font-black uppercase tracking-widest transition-all ml-auto"
                   >
                     Max
                   </button>
                </div>
              </div>

              {/* Message Display */}
              {message && (
                <div className={`p-6 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-2 ${
                  message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  <p className="text-sm font-black italic uppercase">{message.text}</p>
                </div>
              )}

              {/* Action Button */}
              <button 
                disabled={!selectedUser || amount <= 0 || isProcessing}
                onClick={handleTransfer}
                className={`w-full py-8 rounded-[2.5rem] font-black text-xl uppercase tracking-[0.2em] italic transition-all flex items-center justify-center gap-4 shadow-2xl ${
                  !selectedUser || amount <= 0 || isProcessing 
                    ? 'bg-gray-100 dark:bg-brand-border text-gray-400 dark:text-brand-muted cursor-not-allowed' 
                    : 'bg-brand-proph text-black hover:scale-[1.02] active:scale-95 shadow-brand-proph/20'
                }`}
              >
                {isProcessing ? (
                  <>Processing Transfer...</>
                ) : (
                  <>Initiate Transfer <ArrowRight className="w-6 h-6" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointTransfer;
