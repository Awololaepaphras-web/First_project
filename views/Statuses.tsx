
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, X, Image as ImageIcon, Video, Send, 
  Clock, Trash2, ChevronLeft, ChevronRight,
  Play, Pause, Volume2, VolumeX
} from 'lucide-react';
import { User } from '../types';
import { SupabaseService } from '../src/services/supabaseService';
import { CloudinaryService } from '../src/services/cloudinaryService';
import CloudinaryUploader from '../components/CloudinaryUploader';

interface Status {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'gif';
  caption?: string;
  renewed: boolean;
  expiresAt: number;
  createdAt: number;
}

interface StatusesProps {
  user: User | null;
}

const Statuses: React.FC<StatusesProps> = ({ user }) => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [caption, setCaption] = useState('');
  const [activeStatusIndex, setActiveStatusIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    fetchStatuses();
    const interval = setInterval(fetchStatuses, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchStatuses = async () => {
    const data = await SupabaseService.getStatuses();
    setStatuses(data);
  };

  useEffect(() => {
    if (activeStatusIndex !== null && !isPaused) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 50); // 5 seconds per status (100 * 50ms)
      return () => clearInterval(timer);
    }
  }, [activeStatusIndex, isPaused]);

  const handleNext = () => {
    if (activeStatusIndex !== null) {
      if (activeStatusIndex < statuses.length - 1) {
        setActiveStatusIndex(activeStatusIndex + 1);
        setProgress(0);
      } else {
        setActiveStatusIndex(null);
        setProgress(0);
      }
    }
  };

  const handlePrev = () => {
    if (activeStatusIndex !== null) {
      if (activeStatusIndex > 0) {
        setActiveStatusIndex(activeStatusIndex - 1);
        setProgress(0);
      } else {
        setProgress(0);
      }
    }
  };

  const handleUploadComplete = (url: string, type: 'image' | 'video') => {
    setSelectedMedia({ url, type });
    setIsUploading(false);
  };

  const handleSubmitStatus = async () => {
    if (!user || !selectedMedia) return;

    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    const result = await SupabaseService.saveStatus({
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      mediaUrl: selectedMedia.url,
      mediaType: selectedMedia.type,
      caption,
      expiresAt
    });

    if (result.success) {
      setSelectedMedia(null);
      setCaption('');
      fetchStatuses();
    } else {
      alert('Failed to post status');
    }
  };

  const handleDeleteStatus = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this status?')) {
      await SupabaseService.deleteStatus(id);
      fetchStatuses();
    }
  };

  const handleRenewStatus = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpiresAt = Date.now() + (24 * 60 * 60 * 1000);
    const result = await SupabaseService.renewStatus(id, newExpiresAt);
    if (result.success) {
      fetchStatuses();
    } else {
      alert('Failed to renew status');
    }
  };

  // Group statuses by user
  const userStatuses = statuses.reduce((acc, status) => {
    if (!acc[status.userId]) {
      acc[status.userId] = [];
    }
    acc[status.userId].push(status);
    return acc;
  }, {} as Record<string, Status[]>);

  const activeStatus = activeStatusIndex !== null ? statuses[activeStatusIndex] : null;

  return (
    <div className="min-h-screen bg-white dark:bg-brand-black pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white">STATUSES</h1>
            <p className="text-gray-500 dark:text-brand-muted text-xs font-black uppercase tracking-widest mt-1">Ephemeral Intel • 24H Life</p>
          </div>
          <button 
            onClick={() => setIsUploading(true)}
            className="flex items-center gap-2 bg-brand-proph text-black px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all active:scale-95 shadow-xl"
          >
            <Plus className="w-4 h-4" /> Add Status
          </button>
        </div>

        {/* Status Bar */}
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
          {/* My Status Add */}
          <div 
            onClick={() => setIsUploading(true)}
            className="flex-shrink-0 w-20 flex flex-col items-center gap-2 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-brand-proph/30 flex items-center justify-center group-hover:border-brand-proph transition-colors">
                {user?.avatar ? (
                  <img src={CloudinaryService.getOptimizedUrl(user.avatar)} className="w-14 h-14 rounded-full object-cover" alt="Me" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-brand-card flex items-center justify-center">
                    <Plus className="w-6 h-6 text-brand-proph" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-brand-proph text-black rounded-full p-1 border-2 border-white dark:border-brand-black">
                <Plus className="w-3 h-3" />
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-brand-muted">My Status</span>
          </div>

          {/* Other Statuses */}
          {Object.entries(userStatuses).map(([userId, userStatusList]) => (
            <div 
              key={userId}
              onClick={() => {
                const globalIndex = statuses.findIndex(s => s.id === userStatusList[0].id);
                setActiveStatusIndex(globalIndex);
              }}
              className="flex-shrink-0 w-20 flex flex-col items-center gap-2 cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full p-0.5 border-2 border-brand-proph animate-pulse-slow">
                <img 
                  src={CloudinaryService.getOptimizedUrl(userStatusList[0].userAvatar || 'https://picsum.photos/seed/avatar/200')} 
                  className="w-full h-full rounded-full object-cover border-2 border-white dark:border-brand-black" 
                  alt={userStatusList[0].userName} 
                />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white truncate w-full text-center">
                {userStatusList[0].userName}
              </span>
            </div>
          ))}
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8">
          {statuses.map((status, idx) => (
            <div 
              key={status.id}
              onClick={() => setActiveStatusIndex(idx)}
              className="aspect-[9/16] rounded-3xl overflow-hidden relative group cursor-pointer border border-brand-border"
            >
              {status.mediaType === 'video' ? (
                <video src={status.mediaUrl} className="w-full h-full object-cover" muted loop playsInline />
              ) : (
                <img src={CloudinaryService.getOptimizedUrl(status.mediaUrl)} className="w-full h-full object-cover" alt="Status" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <img src={CloudinaryService.getOptimizedUrl(status.userAvatar)} className="w-6 h-6 rounded-full border border-white/20" alt="" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest truncate max-w-[80px]">
                  {status.userName}
                </span>
              </div>

              {status.userId === user?.id && (
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!status.renewed && (status.expiresAt - Date.now() <= 60 * 60 * 1000) && (
                    <button 
                      onClick={(e) => handleRenewStatus(status.id, e)}
                      className="p-2 bg-brand-proph text-black rounded-full hover:scale-110 transition-transform"
                      title="Renew for 24h"
                    >
                      <Clock className="w-3 h-3" />
                    </button>
                  )}
                  <button 
                    onClick={(e) => handleDeleteStatus(status.id, e)}
                    className="p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-[10px] font-medium line-clamp-2 italic">{status.caption}</p>
                <div className="flex items-center gap-1 mt-2 text-white/60 text-[8px] font-black uppercase tracking-widest">
                  <Clock className="w-2 h-2" />
                  {Math.round((status.expiresAt - Date.now()) / (60 * 60 * 1000))}H LEFT
                </div>
              </div>
            </div>
          ))}
        </div>

        {statuses.length === 0 && (
          <div className="text-center py-20 bg-gray-50 dark:bg-brand-card rounded-[3rem] border border-brand-border border-dashed">
            <Clock className="w-12 h-12 text-gray-300 dark:text-brand-muted mx-auto mb-4" />
            <p className="text-gray-500 dark:text-brand-muted font-black uppercase tracking-widest text-sm">No active statuses</p>
            <p className="text-gray-400 dark:text-brand-muted/50 text-xs mt-2 italic">Be the first to share an ephemeral update</p>
          </div>
        )}
      </div>

      {/* Status Viewer Modal */}
      <AnimatePresence>
        {activeStatusIndex !== null && activeStatus && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg aspect-[9/16] bg-brand-black overflow-hidden">
              {/* Progress Bars */}
              <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
                {statuses.map((_, i) => (
                  <div key={i} className="h-1 flex-grow bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-proph transition-all duration-50 ease-linear"
                      style={{ 
                        width: i === activeStatusIndex ? `${progress}%` : i < activeStatusIndex ? '100%' : '0%' 
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="absolute top-10 left-4 right-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                  <img src={CloudinaryService.getOptimizedUrl(activeStatus.userAvatar)} className="w-10 h-10 rounded-full border-2 border-brand-proph" alt="" />
                  <div>
                    <p className="text-white font-black italic uppercase tracking-tighter">{activeStatus.userName}</p>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                      {new Date(activeStatus.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeStatus.mediaType === 'video' && (
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  )}
                  <button 
                    onClick={() => setActiveStatusIndex(null)}
                    className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Media Content */}
              <div 
                className="w-full h-full flex items-center justify-center cursor-pointer"
                onMouseDown={() => setIsPaused(true)}
                onMouseUp={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
              >
                {activeStatus.mediaType === 'video' ? (
                  <video 
                    src={activeStatus.mediaUrl} 
                    className="w-full h-full object-contain" 
                    autoPlay 
                    muted={isMuted}
                    playsInline
                    onEnded={handleNext}
                  />
                ) : (
                  <img src={CloudinaryService.getOptimizedUrl(activeStatus.mediaUrl)} className="w-full h-full object-contain" alt="" />
                )}
              </div>

              {/* Caption */}
              {activeStatus.caption && (
                <div className="absolute bottom-10 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-lg font-medium italic text-center">{activeStatus.caption}</p>
                </div>
              )}

              {/* Navigation Controls */}
              <button 
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              <button 
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-brand-card w-full max-w-md rounded-[3rem] overflow-hidden border border-brand-border shadow-2xl"
            >
              <div className="p-8 border-b border-brand-border flex items-center justify-between">
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white">New Status</h2>
                <button onClick={() => setIsUploading(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {!selectedMedia ? (
                  <div className="space-y-4">
                    <CloudinaryUploader 
                      onUploadComplete={(url) => handleUploadComplete(url, 'image')}
                      onUploadStart={() => setUploadProgress(0)}
                      folder="statuses"
                    >
                      <button className="w-full p-8 border-2 border-dashed border-brand-border rounded-3xl flex flex-col items-center gap-3 hover:border-brand-proph transition-all group">
                        <div className="w-12 h-12 bg-brand-proph/10 text-brand-proph rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-500">Upload Image / GIF</span>
                      </button>
                    </CloudinaryUploader>

                    <CloudinaryUploader 
                      onUploadComplete={(url) => handleUploadComplete(url, 'video')}
                      onUploadStart={() => setUploadProgress(0)}
                      folder="statuses"
                    >
                      <button className="w-full p-8 border-2 border-dashed border-brand-border rounded-3xl flex flex-col items-center gap-3 hover:border-brand-primary transition-all group">
                        <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Video className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-500">Upload Video</span>
                      </button>
                    </CloudinaryUploader>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="aspect-[9/16] rounded-3xl overflow-hidden relative border border-brand-border">
                      {selectedMedia.type === 'video' ? (
                        <video src={selectedMedia.url} className="w-full h-full object-cover" autoPlay muted loop />
                      ) : (
                        <img src={CloudinaryService.getOptimizedUrl(selectedMedia.url)} className="w-full h-full object-cover" alt="Preview" />
                      )}
                      <button 
                        onClick={() => setSelectedMedia(null)}
                        className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <textarea 
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Add a caption..."
                        className="w-full bg-gray-50 dark:bg-brand-black border border-brand-border rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-brand-proph outline-none resize-none h-24"
                      />
                      <button 
                        onClick={handleSubmitStatus}
                        className="w-full bg-brand-proph text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-xl"
                      >
                        <Send className="w-4 h-4" /> Post Status
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Statuses;
