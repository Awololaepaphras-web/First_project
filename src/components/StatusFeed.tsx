
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronLeft, ChevronRight, Clock, RefreshCw, Send, Loader2 } from 'lucide-react';
import { Status, User } from '../../types';
import { CloudinaryService } from '../services/cloudinaryService';
import { SupabaseService } from '../services/supabaseService';

interface StatusFeedProps {
  user: User;
  statuses: Status[];
  onStatusAdded: () => void;
}

const formatRelativeTime = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const StatusFeed: React.FC<StatusFeedProps> = ({ user, statuses, onStatusAdded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newStatusCaption, setNewStatusCaption] = useState('');
  const [newStatusFile, setNewStatusFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 30.5) {
            alert('Video must be 30 seconds or less');
            setNewStatusFile(null);
            setPreviewUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
          } else {
            setNewStatusFile(file);
            setPreviewUrl(URL.createObjectURL(file));
          }
        };
        video.src = URL.createObjectURL(file);
      } else {
        setNewStatusFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!newStatusFile || !user) return;
    setIsUploading(true);
    try {
      const mediaType = newStatusFile.type.startsWith('video') ? 'video' : 'image';
      const mediaUrl = await CloudinaryService.uploadFile(newStatusFile, mediaType);
      await SupabaseService.saveStatus({
        userId: user.id,
        userName: user.name,
        userNickname: user.nickname,
        university: user.university,
        userAvatar: user.profilePicture,
        mediaUrl: mediaUrl,
        mediaType: mediaType,
        caption: newStatusCaption
      });
      onStatusAdded();
      setShowUploadModal(false);
      setNewStatusFile(null);
      setPreviewUrl(null);
      setNewStatusCaption('');
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload status');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRenew = async (statusId: string) => {
    const result = await SupabaseService.renewStatus(statusId);
    if (result.success) {
      onStatusAdded();
      alert('Status renewed for another 24 hours!');
    } else {
      alert('Cannot renew status yet. You can only renew once and within 1 hour of expiry.');
    }
  };

  // Group statuses by user
  const groupedStatuses = statuses.reduce((acc, status) => {
    if (!acc[status.userId]) {
      acc[status.userId] = [];
    }
    acc[status.userId].push(status);
    return acc;
  }, {} as Record<string, Status[]>);

  const uniqueUsers = Array.from(new Set(statuses.map(s => s.userId)))
    .sort((a, b) => {
      if (a === user?.id) return -1;
      if (b === user?.id) return 1;
      return 0;
    });

  return (
    <div className="relative">
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-4 px-2">
        {/* Add Status Button */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="w-16 h-16 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center bg-gray-900 hover:bg-gray-800 transition-all group"
          >
            <Plus className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
          </button>
          <span className="text-[10px] font-black uppercase text-gray-500">Your Status</span>
        </div>

        {/* Status List */}
        {uniqueUsers.map((userId: string) => {
          const userStatuses = groupedStatuses[userId];
          const latestStatus = userStatuses[0];
          return (
            <div key={userId} className="flex flex-col items-center gap-1 flex-shrink-0">
              <button 
                onClick={() => setSelectedStatus(latestStatus)}
                className="w-16 h-16 rounded-full p-0.5 border-2 border-brand-proph flex items-center justify-center bg-gray-950 overflow-hidden active:scale-95 transition-transform"
              >
                <img 
                  src={CloudinaryService.getOptimizedUrl(latestStatus.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${latestStatus.userName}`)} 
                  className="w-full h-full rounded-full object-cover"
                  alt={latestStatus.userName}
                  referrerPolicy="no-referrer"
                />
              </button>
              <span className="text-[10px] font-black uppercase text-white truncate w-16 text-center italic">
                {userId === user?.id ? 'You' : latestStatus.userName.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status Viewer Modal */}
      <AnimatePresence>
        {selectedStatus && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10">
              <div className="flex items-center gap-3">
                <img 
                  src={CloudinaryService.getOptimizedUrl(selectedStatus.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStatus.userName}`)} 
                  className="w-10 h-10 rounded-full border border-white/20"
                  alt=""
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="text-sm font-black text-white italic uppercase tracking-tighter">{selectedStatus.userName}</p>
                  <p className="text-[9px] text-gray-400 font-mono uppercase">
                    {formatRelativeTime(selectedStatus.createdAt)} ago · {new Date(selectedStatus.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedStatus(null)} className="p-2 text-white/60 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 flex items-center justify-center relative">
              {selectedStatus.mediaType === 'video' ? (
                <video 
                  src={selectedStatus.mediaUrl} 
                  className="max-w-full max-h-full object-contain"
                  autoPlay
                  controls
                  playsInline
                />
              ) : (
                <img 
                  src={CloudinaryService.getStatusHDRestore(selectedStatus.mediaUrl, false)} 
                  className="max-w-full max-h-full object-contain"
                  alt=""
                  referrerPolicy="no-referrer"
                />
              )}
              
              {selectedStatus.caption && (
                <div className="absolute bottom-24 left-0 right-0 p-8 text-center bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-lg font-medium italic drop-shadow-lg">{selectedStatus.caption}</p>
                </div>
              )}
            </div>

            <div className="p-8 bg-black flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase">
                <Clock className="w-3 h-3" />
                Expires: {new Date(selectedStatus.expiresAt).toLocaleTimeString()}
              </div>
              {selectedStatus.userId === user?.id && !selectedStatus.renewed && (
                <button 
                  onClick={() => handleRenew(selectedStatus.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-black uppercase text-white transition-all"
                >
                  <RefreshCw className="w-3 h-3" /> Renew (24h)
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="bg-gray-900 w-full max-w-md rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Broadcast Status</h3>
                <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              
              <div className="p-8 space-y-6">
                {!previewUrl ? (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-square rounded-[2rem] border-2 border-dashed border-gray-800 flex flex-col items-center justify-center gap-4 hover:bg-gray-800/50 transition-all"
                  >
                    <Plus className="w-12 h-12 text-gray-600" />
                    <p className="text-xs font-black uppercase text-gray-500 tracking-widest">Select Media Node (30s Video/Image)</p>
                  </button>
                ) : (
                  <div className="relative aspect-square rounded-[2rem] overflow-hidden border border-gray-800 bg-black">
                    {newStatusFile?.type.startsWith('video') ? (
                      <video src={previewUrl} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    )}
                    <button onClick={() => { setNewStatusFile(null); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black"><X className="w-4 h-4" /></button>
                  </div>
                )}

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*,video/*" 
                  className="hidden" 
                />

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 ml-4">Caption</label>
                  <input 
                    type="text" 
                    value={newStatusCaption}
                    onChange={e => setNewStatusCaption(e.target.value)}
                    placeholder="What's happening in the matrix?"
                    className="w-full bg-gray-950 border border-gray-800 p-4 rounded-2xl text-sm text-white focus:border-brand-proph outline-none transition-all"
                  />
                </div>

                <button 
                  onClick={handleUpload}
                  disabled={isUploading || !newStatusFile}
                  className="w-full bg-brand-proph py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-black shadow-xl shadow-brand-proph/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Transmit Signal
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatusFeed;
