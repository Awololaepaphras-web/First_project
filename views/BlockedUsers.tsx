
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserX, UserCheck, Loader2 } from 'lucide-react';
import { User } from '../types';
import { SupabaseService } from '../src/services/supabaseService';

interface BlockedUsersProps {
  user: User;
  allUsers: User[];
  onUnblock: (targetId: string) => void;
}

const BlockedUsers: React.FC<BlockedUsersProps> = ({ user, allUsers, onUnblock }) => {
  const navigate = useNavigate();
  const [blockedList, setBlockedList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBlockedUsers = async () => {
      setIsLoading(true);
      // Filter allUsers to find those whose IDs are in user.blockedUsers
      const blocked = allUsers.filter(u => user.blockedUsers?.includes(u.id));
      setBlockedList(blocked);
      setIsLoading(false);
    };

    loadBlockedUsers();
  }, [user.blockedUsers, allUsers]);

  const handleUnblock = async (targetId: string) => {
    if (!window.confirm('Are you sure you want to unblock this user?')) return;
    onUnblock(targetId);
  };

  return (
    <div className="w-full max-w-full mx-auto border-x border-brand-border min-h-screen bg-white dark:bg-brand-black pb-32">
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-brand-black/80 backdrop-blur-md border-b border-brand-border p-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-black italic tracking-tighter uppercase">Blocked Users</h2>
      </div>

      <div className="p-4">
        <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-6">
          Users you have blocked will not be able to see your posts, and their content will be hidden from your feed.
        </p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-proph animate-spin mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-brand-muted">Loading blocked users...</p>
          </div>
        ) : blockedList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-brand-border/30 rounded-full flex items-center justify-center mb-4">
              <UserCheck className="w-8 h-8 text-brand-muted" />
            </div>
            <h3 className="text-lg font-black uppercase italic mb-2">No Blocked Users</h3>
            <p className="text-sm text-brand-muted max-w-xs">You haven't blocked anyone yet. Your community experience is clear!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {blockedList.map(u => (
              <div key={u.id} className="flex items-center justify-between p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-brand-border rounded-2xl hover:border-brand-proph/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-border overflow-hidden flex-shrink-0">
                    {u.profilePicture ? (
                      <img src={u.profilePicture} className="w-full h-full object-cover" alt={u.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-gray-400">
                        {u.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-gray-900 dark:text-white">{u.name}</h4>
                    <p className="text-xs text-brand-muted">@{u.nickname}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleUnblock(u.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-proph/10 text-brand-proph hover:bg-brand-proph hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <UserCheck className="w-3 h-3" /> Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockedUsers;
