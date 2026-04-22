
import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, BookOpen, Clock, 
  MessageSquare, ChevronRight, GraduationCap,
  Shield, Zap, Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { SupabaseService } from '../src/services/supabaseService';
import { User, Group } from '../types';

const GroupWork: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await SupabaseService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setCurrentUser(user);
      const allGroups = await SupabaseService.getGroups();
      setGroups(allGroups);
    } catch (err) {
      console.error('Failed to load group work data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !currentUser) return;
    try {
      const isPremium = currentUser.premiumTier && currentUser.premiumTier !== 'none';
      await SupabaseService.createGroup({
        name: newGroupName,
        description: newGroupDesc,
        creatorId: currentUser.id,
        isMonetized: !!isPremium
      });
      setNewGroupName('');
      setNewGroupDesc('');
      setShowCreateModal(false);
      loadData();
    } catch (err) {
      console.error('Failed to create group:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-brand-black pb-20">
      {/* Header */}
      <div className="bg-brand-proph p-10 pt-20 text-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="bg-black/10 p-5 rounded-3xl backdrop-blur-xl border border-black/10">
              <Users className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">Group Matrix</h1>
              <p className="font-bold opacity-80 italic text-sm mt-2">Collaborative nodes syncing for maximum academic output.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-black text-brand-proph px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center gap-3 w-fit"
          >
            <Plus className="w-5 h-5" /> Initialize Squad
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-brand-card p-8 rounded-[3rem] border border-brand-border shadow-xl">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-3xl font-black italic dark:text-white">{groups.length}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted mt-1">Active Squads</p>
          </div>
          <div className="bg-white dark:bg-brand-card p-8 rounded-[3rem] border border-brand-border shadow-xl">
            <div className="w-12 h-12 bg-brand-proph/10 rounded-2xl flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-brand-proph" />
            </div>
            <h3 className="text-3xl font-black italic dark:text-white">{groups.filter(g => g.isMonetized).length}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted mt-1">Monetized Channels</p>
          </div>
          <div className="bg-white dark:bg-brand-card p-8 rounded-[3rem] border border-brand-border shadow-xl">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-3xl font-black italic dark:text-white">Encrypted</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted mt-1">Node Security</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted" />
          <input 
            type="text" 
            placeholder="Search Squads Matrix..." 
            className="w-full bg-white dark:bg-brand-card border border-brand-border rounded-full py-4 pl-16 pr-8 text-sm focus:ring-2 focus:ring-brand-proph transition-all dark:text-white"
          />
        </div>

        {/* Groups List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={group.id}
              onClick={() => navigate('/chat')}
              className="bg-white dark:bg-brand-card p-8 rounded-[3.5rem] border border-brand-border hover:border-brand-proph transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-brand-proph/10 rounded-3xl flex items-center justify-center font-black text-3xl text-brand-proph group-hover:scale-110 transition-transform border border-brand-proph/20">
                  {group.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-black dark:text-white uppercase italic tracking-tighter">{group.name}</h3>
                    {group.isMonetized && <Zap className="w-4 h-4 text-brand-proph" />}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{group.description}</p>
                </div>
                <ChevronRight className="w-6 h-6 text-brand-muted group-hover:text-brand-proph transition-colors" />
              </div>
              <div className="mt-6 pt-6 border-t border-brand-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-brand-black border-2 border-white dark:border-brand-card flex items-center justify-center text-[8px] font-black italic">
                        U
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-black uppercase text-brand-muted tracking-widest">+12 members</span>
                </div>
                <div className="flex items-center gap-2 text-brand-muted">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest italic">{new Date(group.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
          
          {groups.length === 0 && !isLoading && (
            <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-brand-card/50 rounded-[4rem] border border-dashed border-brand-border">
              <Users className="w-12 h-12 text-brand-muted mx-auto mb-4" />
              <p className="font-black text-xs text-brand-muted uppercase tracking-[0.2em]">No active squads found in the matrix</p>
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-black w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl border border-brand-border">
            <div className="p-8 border-b border-brand-border flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter dark:text-white">Initialize Squad</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all">
                <Plus className="w-6 h-6 text-brand-muted rotate-45" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">Squad Label</label>
                <input 
                  type="text" 
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="e.g. Physics Prophs" 
                  className="w-full bg-gray-50 dark:bg-brand-card border border-brand-border rounded-2xl p-4 focus:ring-2 focus:ring-brand-proph transition-all dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">Matrix Description</label>
                <textarea 
                  value={newGroupDesc}
                  onChange={e => setNewGroupDesc(e.target.value)}
                  placeholder="The mission of this academic node..." 
                  className="w-full bg-gray-50 dark:bg-brand-card border border-brand-border rounded-2xl p-4 focus:ring-2 focus:ring-brand-proph transition-all dark:text-white font-medium h-32"
                />
              </div>
              <button 
                onClick={handleCreateGroup}
                className="w-full bg-brand-proph text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-proph/20 hover:scale-105 transition-all"
              >
                Sync with Network
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupWork;
