
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Clock, Search, Filter, 
  CreditCard, User, Calendar, ExternalLink, ArrowLeft,
  ShieldCheck, AlertCircle, RefreshCw, Building2
} from 'lucide-react';
import { PaymentVerification, User as UserType } from '../types';
import { Database } from '../src/services/database';
import { useNavigate } from 'react-router-dom';

interface AdminPaymentVerificationProps {
  user: UserType;
}

const AdminPaymentVerification: React.FC<AdminPaymentVerificationProps> = ({ user }) => {
  const [verifications, setVerifications] = useState<PaymentVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchVerifications();

    // Subscribe to real-time updates for payment verifications
    const sub = Database.subscribeToTable('payment_verifications', (payload) => {
      if (payload.eventType === 'INSERT') {
        setVerifications(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setVerifications(prev => prev.map(v => v.id === payload.new.id ? payload.new : v));
      } else if (payload.eventType === 'DELETE') {
        setVerifications(prev => prev.filter(v => v.id === payload.old.id));
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const data = await Database.getPaymentVerifications();
      setVerifications(data);
    } catch (error) {
      console.error("Failed to fetch verifications", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    if (!window.confirm(`Are you sure you want to ${status} this payment?`)) return;
    
    try {
      await Database.updatePaymentVerificationStatus(id, status);
      
      // If approved, we might need to update the user's premium status or ad status
      const verification = verifications.find(v => v.id === id);
      if (status === 'approved' && verification) {
        const allUsers = await Database.getUsers();
        const targetUser = allUsers.find(u => u.id === verification.userId);
        if (targetUser) {
          if (verification.type === 'premium') {
            const updatedUser = { ...targetUser, isPremium: true, premiumExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000) }; // 30 days
            await Database.saveUser(updatedUser);
          } else if (verification.type === 'ad' && verification.details?.adId) {
            const allAds = await Database.getAds();
            const targetAd = allAds.find(a => a.id === verification.details.adId);
            if (targetAd) {
              const updatedAd = { ...targetAd, status: 'active' };
              await Database.saveAd(updatedAd);
            }
          }
        }
      }

      setVerifications(prev => prev.map(v => v.id === id ? { ...v, status } : v));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status");
    }
  };

  const filteredVerifications = verifications.filter(v => {
    const matchesFilter = filter === 'all' || v.status === filter;
    const matchesSearch = v.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.reference.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-brand-black text-white p-4 md:p-8 space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/Epaphrastheadminofprophandloveforx')} className="p-3 bg-brand-card border border-brand-border rounded-2xl hover:bg-brand-proph/10 transition-all">
            <ArrowLeft className="w-5 h-5 text-brand-proph" />
          </button>
          <div>
            <h1 className="text-4xl font-black tracking-tighter italic uppercase text-white">Payment Verification</h1>
            <p className="text-brand-muted font-medium italic mt-1">Validate premium upgrades and advertisement campaigns</p>
          </div>
        </div>
        <button onClick={fetchVerifications} className="bg-brand-card border border-brand-border p-4 rounded-2xl hover:bg-brand-proph/10 transition-all flex items-center gap-2">
          <RefreshCw className={`w-5 h-5 text-brand-proph ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">Refresh Nodes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Pending Approval', count: verifications.filter(v => v.status === 'pending').length, icon: <Clock className="w-6 h-6 text-yellow-500" /> },
          { label: 'Total Verified', count: verifications.filter(v => v.status === 'approved').length, icon: <CheckCircle2 className="w-6 h-6 text-green-600" /> },
          { label: 'Rejected Claims', count: verifications.filter(v => v.status === 'rejected').length, icon: <XCircle className="w-6 h-6 text-red-600" /> },
          { label: 'Active Campaigns', count: 0, icon: <ShieldCheck className="w-6 h-6 text-brand-proph" /> },
        ].map(s => (
          <div key={s.label} className="bg-brand-card border border-brand-border p-8 rounded-[2.5rem] flex items-center gap-6 shadow-xl">
            <div className="bg-brand-black p-4 rounded-2xl">{s.icon}</div>
            <div>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">{s.label}</p>
              <p className="text-3xl font-black italic tracking-tighter text-white">{s.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-brand-card border border-brand-border rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-brand-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-2 bg-brand-black p-1.5 rounded-2xl border border-brand-border">
            {['pending', 'approved', 'rejected', 'all'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-brand-proph text-black' : 'text-brand-muted hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input 
              placeholder="Search reference or user..." 
              className="w-full bg-brand-black border border-brand-border rounded-full py-4 pl-12 pr-6 text-xs font-bold focus:ring-1 focus:ring-brand-proph outline-none shadow-inner text-white"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-black/50">
                <th className="p-6 text-[10px] font-black text-brand-muted uppercase tracking-widest">User Node</th>
                <th className="p-6 text-[10px] font-black text-brand-muted uppercase tracking-widest">Intel Type</th>
                <th className="p-6 text-[10px] font-black text-brand-muted uppercase tracking-widest">Method</th>
                <th className="p-6 text-[10px] font-black text-brand-muted uppercase tracking-widest">Amount</th>
                <th className="p-6 text-[10px] font-black text-brand-muted uppercase tracking-widest">Reference</th>
                <th className="p-6 text-[10px] font-black text-brand-muted uppercase tracking-widest">Timestamp</th>
                <th className="p-6 text-[10px] font-black text-brand-muted uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredVerifications.length > 0 ? filteredVerifications.map(v => (
                <tr key={v.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-black rounded-xl flex items-center justify-center border border-brand-border">
                        <User className="w-5 h-5 text-brand-muted" />
                      </div>
                      <div>
                        <p className="text-sm font-black italic text-white uppercase">{v.userName}</p>
                        <p className="text-[10px] font-bold text-brand-muted tracking-tighter">{v.userEmail || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      v.type === 'premium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                      v.type === 'ad' ? 'bg-brand-proph/10 text-brand-proph border-brand-proph/20' : 
                      'bg-purple-500/10 text-purple-500 border-purple-500/20'
                    }`}>
                      {v.type}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      {v.details?.paymentMethod === 'card' ? (
                        <CreditCard className="w-4 h-4 text-brand-proph" />
                      ) : (
                        <Building2 className="w-4 h-4 text-blue-400" />
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">
                        {v.details?.paymentMethod || 'Transfer'}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-black text-white">₦{v.amount.toLocaleString()}</p>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-brand-muted" />
                      <p className="text-xs font-mono font-bold text-brand-muted">{v.reference}</p>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-brand-muted">
                      <Calendar className="w-4 h-4" />
                      <p className="text-[10px] font-bold uppercase">{new Date(v.createdAt).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-end gap-2">
                      {v.status === 'pending' ? (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(v.id, 'approved')}
                            className="bg-green-600 text-white p-3 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-green-600/20"
                            title="Approve Payment"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(v.id, 'rejected')}
                            className="bg-red-600 text-white p-3 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-red-600/20"
                            title="Reject Payment"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                          v.status === 'approved' ? 'bg-green-600/10 text-green-600 border-green-600/20' : 'bg-red-600/10 text-red-600 border-red-600/20'
                        }`}>
                          {v.status === 'approved' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          <span className="text-[10px] font-black uppercase tracking-widest">{v.status}</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <AlertCircle className="w-16 h-16" />
                      <p className="text-xs font-black uppercase tracking-widest">No payment records found in this sector</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentVerification;
