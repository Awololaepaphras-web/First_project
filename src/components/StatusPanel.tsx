
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Flame, 
  Eye, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  X,
  RefreshCw,
  Lock
} from 'lucide-react';
import { SupabaseService } from '../services/supabaseService';
import { CloudinaryService } from '../services/cloudinaryService';
import { User } from '../../types';

interface StatusItem {
  id: string;
  userId: string;
  userName: string;
  userNickname: string;
  userAvatar?: string;
  url: string;
  renewalCount: number;
  viewCount: number;
  expiresAt: number;
  createdAt: number;
}

interface StatusPanelProps {
  currentUser: User;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ currentUser }) => {
  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<StatusItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    setLoading(true);
    const data = await SupabaseService.getStatusPanelData();
    setStatuses(data);
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await CloudinaryService.uploadStatus(file);
      await SupabaseService.saveStatusPanelItem(currentUser.id, url);
      await loadStatuses();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRenew = async (status: StatusItem) => {
    if (status.renewalCount >= 1) return;
    
    const success = await SupabaseService.renewStatusPanelItem(status.id, status.expiresAt);
    if (success) {
      await loadStatuses();
      if (activeStatus?.id === status.id) {
        setActiveStatus({
          ...status,
          renewalCount: 1,
          expiresAt: status.expiresAt + 24 * 60 * 60 * 1000
        });
      }
    }
  };

  const handleViewStatus = async (status: StatusItem) => {
    const now = Date.now();
    if (now > status.expiresAt) return; // Don't open if expired (unless it's the hook)

    setActiveStatus(status);
    await SupabaseService.incrementStatusViewCount(status.id);
    // Update local count
    setStatuses(prev => prev.map(s => s.id === status.id ? { ...s, viewCount: s.viewCount + 1 } : s));
  };

  // Group statuses by user
  const userStatuses = statuses.reduce((acc, status) => {
    if (!acc[status.userId]) {
      acc[status.userId] = [];
    }
    acc[status.userId].push(status);
    return acc;
  }, {} as Record<string, StatusItem[]>);

  const sortedUserIds = Object.keys(userStatuses).sort((a, b) => {
    if (a === currentUser.id) return -1;
    if (b === currentUser.id) return 1;
    return 0;
  });

  return (
    <div className="w-full bg-white dark:bg-brand-black p-4 rounded-3xl border border-gray-100 dark:border-brand-border shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
        {/* Add Status Button */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 rounded-full border-2 border-dashed border-brand-proph flex items-center justify-center cursor-pointer hover:bg-brand-proph/5 transition-all relative group"
          >
            {isUploading ? (
              <RefreshCw className="w-6 h-6 text-brand-proph animate-spin" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-brand-card">
                  {currentUser.profilePicture ? (
                    <img src={currentUser.profilePicture} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-brand-muted">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-brand-proph rounded-full flex items-center justify-center border-2 border-white dark:border-brand-black group-hover:scale-110 transition-transform">
                  <Plus className="w-4 h-4 text-black" />
                </div>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,video/*" 
              onChange={handleFileUpload}
            />
          </div>
          <span className="text-[10px] font-black uppercase italic tracking-tighter text-brand-muted">Post</span>
        </div>

        {/* Status List */}
        {sortedUserIds.map(userId => {
          const userStatusList = userStatuses[userId];
          const latestStatus = userStatusList[0];
          const isExpired = Date.now() > latestStatus.expiresAt;
          const isRecentlyExpired = !isExpired && Date.now() < latestStatus.expiresAt + 24 * 60 * 60 * 1000;
          
          // Timer Logic
          const timeLeft = latestStatus.expiresAt - Date.now();
          const totalDuration = 24 * 60 * 60 * 1000 * (latestStatus.renewalCount + 1);
          const progress = Math.max(0, (timeLeft / totalDuration) * 100);
          const isUrgent = timeLeft < 2 * 60 * 60 * 1000;

          return (
            <div key={userId} className="flex flex-col items-center gap-2 flex-shrink-0">
              <div 
                onClick={() => handleViewStatus(latestStatus)}
                className="relative w-16 h-16 cursor-pointer group"
              >
                {/* Circular Progress Bar */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-100 dark:text-brand-card"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="188.5"
                    initial={{ strokeDashoffset: 188.5 }}
                    animate={{ strokeDashoffset: 188.5 - (188.5 * progress) / 100 }}
                    className={isUrgent ? 'text-red-500' : 'text-brand-proph'}
                  />
                </svg>

                <div className={`absolute inset-1 rounded-full overflow-hidden border-2 border-white dark:border-brand-black ${isExpired ? 'grayscale blur-[2px]' : ''}`}>
                  {latestStatus.userAvatar ? (
                    <img src={CloudinaryService.getStatusThumbnail(latestStatus.userAvatar)} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-brand-card flex items-center justify-center font-black text-brand-muted">
                      {latestStatus.userName.charAt(0)}
                    </div>
                  )}
                </div>

                {latestStatus.renewalCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center border border-white dark:border-brand-black animate-bounce">
                    <Flame className="w-3 h-3 text-white" />
                  </div>
                )}

                {isExpired && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-black uppercase italic tracking-tighter text-gray-900 dark:text-white truncate w-16 text-center">
                {latestStatus.userName}
                {latestStatus.renewalCount > 0 && ' 🔥'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status Viewer Modal */}
      <AnimatePresence>
        {activeStatus && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg h-full md:h-[90vh] md:rounded-[3rem] overflow-hidden bg-gray-900 shadow-2xl">
              {/* Progress Bars */}
              <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
                <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                    onAnimationComplete={() => setActiveStatus(null)}
                    className="h-full bg-white"
                  />
                </div>
              </div>

              {/* Header */}
              <div className="absolute top-8 left-6 right-6 z-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                    <img src={activeStatus.userAvatar} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase italic tracking-tighter">
                      {activeStatus.userName} {activeStatus.renewalCount > 0 && '🔥'}
                    </h4>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">
                      {new Date(activeStatus.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <button onClick={() => setActiveStatus(null)} className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Media */}
              <div className="w-full h-full flex items-center justify-center">
                {activeStatus.url.includes('/video/') ? (
                  <video 
                    src={CloudinaryService.getStatusHDRestore(activeStatus.url, true)} 
                    autoPlay 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img 
                    src={CloudinaryService.getStatusHDRestore(activeStatus.url, false)} 
                    className="w-full h-full object-contain" 
                    alt="" 
                  />
                )}
              </div>

              {/* Footer / Actions */}
              <div className="absolute bottom-10 left-6 right-6 z-20 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                    <Eye className="w-4 h-4 text-brand-proph" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Seen by {activeStatus.viewCount} people</span>
                  </div>

                  {activeStatus.userId === currentUser.id && (
                    <button 
                      disabled={activeStatus.renewalCount >= 1}
                      onClick={() => handleRenew(activeStatus)}
                      className={`flex items-center gap-2 px-6 py-2 rounded-full font-black uppercase italic text-xs transition-all ${
                        activeStatus.renewalCount >= 1 
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                          : 'bg-brand-proph text-black hover:scale-105 active:scale-95'
                      }`}
                    >
                      {activeStatus.renewalCount >= 1 ? 'Final Extension Used' : (
                        <>
                          <Clock className="w-4 h-4" />
                          Renew for 24h
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Hook: Expired Status Preview */}
      {statuses.some(s => s.userId === currentUser.id && Date.now() > s.expiresAt && Date.now() < s.expiresAt + 24 * 60 * 60 * 1000) && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-4 p-4 bg-brand-proph/10 rounded-2xl border border-brand-proph/20 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-brand-card overflow-hidden blur-[4px] relative flex-shrink-0">
            <Lock className="absolute inset-0 m-auto w-4 h-4 text-black/40 z-10" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Your status expired!</p>
            <p className="text-[10px] text-brand-muted font-medium">Post a new one to see who viewed your last post.</p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-brand-proph text-black rounded-xl font-black uppercase italic text-[10px] hover:scale-105 transition-all"
          >
            Post Now
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default StatusPanel;
