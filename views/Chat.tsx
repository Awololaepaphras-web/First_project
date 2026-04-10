import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, Mic, Video, Image as ImageIcon, X, 
  Phone, PhoneOff, Trash2, User as UserIcon, 
  MoreVertical, Check, CheckCheck, Plus, 
  ArrowLeft, Paperclip, Smile, Ghost, AlertCircle,
  UserPlus, Settings as SettingsIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatePresence } from 'framer-motion';
import { SupabaseService } from '../src/services/supabaseService';
import { User, Message, SystemConfig, ChatInvite, Group } from '../types';
import { CloudinaryService } from '../src/services/cloudinaryService';
import { SoundService } from '../src/services/soundService';
import { Shield, Clock } from 'lucide-react';
import VideoEmbed from '../src/components/VideoEmbed';
import { Lightbox } from '../src/components/Lightbox';

interface ChatProps {
  currentUser: User;
  config: SystemConfig;
}

interface Conversation {
  id: string;
  otherUser: User;
  lastMessage: string;
  lastMessageAt: string;
}

const Chat: React.FC<ChatProps> = ({ currentUser, config }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isVideoCalling, setIsVideoCalling] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phone || '');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [invites, setInvites] = useState<ChatInvite[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const isPremium = currentUser.premiumTier && currentUser.premiumTier !== 'none';
      await SupabaseService.createGroup({
        name: newGroupName,
        description: newGroupDesc,
        creatorId: currentUser.id,
        isMonetized: !!isPremium // Only earn if premium
      });
      setNewGroupName('');
      setNewGroupDesc('');
      setShowCreateGroup(false);
      loadGroups();
      alert(isPremium ? 'Monetized group created!' : 'Group created! (Earning disabled - Upgrade to Premium to earn from groups)');
    } catch (err) {
      console.error('Failed to create group:', err);
    }
  };
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<any>(null);

  useEffect(() => {
    loadRecentConversations();
    loadGroups();
    loadInvites();
    
    // Subscribe to conversation updates
    const sub = SupabaseService.subscribeToTable('conversations', (payload) => {
      if (payload.new && (payload.new.user1_id === currentUser.id || payload.new.user2_id === currentUser.id)) {
        loadRecentConversations();
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (selectedUser || selectedGroup) {
      const cacheKey = selectedGroup ? `messages_group_${selectedGroup.id}` : `messages_user_${selectedUser?.id}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setMessages(JSON.parse(cached));
      }
      
      loadMessages();
      const channel = selectedGroup ? `realtime:group_messages:${selectedGroup.id}` : `realtime:messages:${currentUser.id}`;
      const subscription = SupabaseService.subscribeToMessages(currentUser.id, (payload) => {
        if (selectedGroup) {
          if (payload.new && payload.new.group_id === selectedGroup.id) {
            loadMessages();
            SoundService.playNotification();
          }
        } else if (selectedUser) {
          if (payload.new && (payload.new.sender_id === selectedUser.id || payload.new.receiver_id === selectedUser.id)) {
            loadMessages();
            SoundService.playNotification();
            if (payload.new.receiver_id === currentUser.id) {
              SupabaseService.markMessageAsSeen(payload.new.id);
            }
          }
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedUser, selectedGroup]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!config.isMessagingEnabled && currentUser.role !== 'admin') {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-white dark:bg-brand-black p-8 text-center">
        <div className="w-20 h-20 bg-brand-proph/10 rounded-3xl flex items-center justify-center mb-6 border border-brand-proph/20">
          <Shield className="w-10 h-10 text-brand-proph" />
        </div>
        <h2 className="text-3xl font-black uppercase italic text-gray-900 dark:text-white mb-4 tracking-tight">Private Link Offline</h2>
        <p className="text-brand-muted max-w-md font-medium leading-relaxed">
          The Private Communication Channel is currently restricted. 
          Encrypted peer-to-peer links are disabled for all non-administrative personnel.
        </p>
        <div className="mt-8 p-4 bg-brand-proph/5 rounded-2xl border border-brand-proph/10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-proph">Security Protocol: Active</p>
        </div>
      </div>
    );
  }

  const loadRecentConversations = async () => {
    const data = await SupabaseService.getRecentConversations(currentUser.id);
    setRecentConversations(data);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadGroups = async () => {
    const data = await SupabaseService.getGroups();
    setGroups(data);
  };

  const loadInvites = async () => {
    const data = await SupabaseService.getChatInvites(currentUser.id);
    setInvites(data);
  };

  const loadMessages = async () => {
    if (!selectedUser && !selectedGroup) return;
    const msgs = await SupabaseService.getMessages(currentUser.id);
    const now = Date.now();
    const filtered = msgs.filter(m => {
      if (selectedGroup) {
        return m.groupId === selectedGroup.id;
      }
      const isRelevant = (m.senderId === currentUser.id && m.receiverId === selectedUser?.id) ||
                         (m.senderId === selectedUser?.id && m.receiverId === currentUser.id);
      if (!isRelevant) return false;
      if (m.mediaUrl && m.expiresAt && now > m.expiresAt) return false;
      return true;
    });

    setMessages(filtered);
    
    // Cache to local storage
    const cacheKey = selectedGroup ? `messages_group_${selectedGroup.id}` : `messages_user_${selectedUser?.id}`;
    localStorage.setItem(cacheKey, JSON.stringify(filtered));
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      const results = await SupabaseService.searchUsersByNickname(query);
      setSearchResults(results.filter(u => u.id !== currentUser.id));
    } else {
      setSearchResults([]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || (!selectedUser && !selectedGroup)) return;
    
    // Group coin deduction (2 coins required)
    if (selectedGroup) {
      const deduction = await SupabaseService.deductPoints(currentUser.id, 2);
      if (!deduction.success) {
        alert('Insufficient Prophy coins for group message (2 coins required).');
        return;
      }
      await SupabaseService.distributeGroupRevenue(2);
    }

    try {
      await SupabaseService.sendMessage({
        senderId: currentUser.id,
        receiverId: selectedUser?.id || null,
        groupId: selectedGroup?.id,
        text: inputText,
        replyTo: replyingTo?.id,
        replyToContent: replyingTo?.text || (replyingTo?.mediaType ? `Sent a ${replyingTo.mediaType}` : undefined)
      });
      setInputText('');
      setReplyingTo(null);
      SoundService.playNotification();
      loadMessages();
      loadRecentConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadMedia(audioBlob, 'audio');
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(recordingIntervalRef.current);
      setIsRecording(false);
    }
  };

  const uploadMedia = async (blob: Blob | File, type: 'image' | 'video' | 'audio') => {
    if (!selectedUser) return;
    setIsUploading(true);
    try {
      const file = blob instanceof File ? blob : new File([blob], `media_${Date.now()}`, { type: blob.type });
      const url = await CloudinaryService.uploadFile(file);
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

      await SupabaseService.sendMessage({
        senderId: currentUser.id,
        receiverId: selectedUser.id,
        mediaUrl: url,
        mediaType: type,
        expiresAt
      });
      loadMessages();
      loadRecentConversations();
    } catch (error) {
      console.error('Media upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUser) return;
    const type = file.type.startsWith('image/') ? 'image' : 
                 file.type.startsWith('video/') ? 'video' : 'audio';
    await uploadMedia(file, type as any);
  };

  const startVideoCall = () => {
    setIsVideoCalling(true);
  };

  const handleSaveSettings = async () => {
    const badges = [...(currentUser.badges || [])];
    if (phoneNumber && !badges.includes('Verified Node')) {
      badges.push('Verified Node');
    }
    const updatedUser = { ...currentUser, phone: phoneNumber, badges };
    await SupabaseService.updateUser(updatedUser);
    alert('Settings updated successfully!');
    setShowSettings(false);
  };

  const handleInviteThirdParty = async (targetUserId: string) => {
    if (!selectedUser) return;
    await SupabaseService.sendChatInvite({
      inviterId: currentUser.id,
      inviteeId: targetUserId,
      targetId: [currentUser.id, selectedUser.id].sort().join(':'),
      targetType: 'conversation'
    });
    alert('Invite sent! Both parties must agree.');
    setShowInviteModal(false);
  };

  const formatLastSeen = (timestamp?: number) => {
    if (!timestamp) return 'Offline';
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return `Last seen today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `Last seen on ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatTime = (timestamp: number | string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-brand-black rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-brand-border">
      {/* Sidebar: Recent Conversations */}
      <div className={`w-full lg:w-96 border-r border-gray-100 dark:border-brand-border flex flex-col ${selectedUser ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 bg-gray-50 dark:bg-brand-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={CloudinaryService.getOptimizedUrl(currentUser.profilePicture || `https://ui-avatars.com/api/?name=${currentUser.name}`)} 
              className="w-10 h-10 rounded-full object-cover border border-brand-border" 
              alt="" 
            />
            <h2 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">Chats</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowCreateGroup(true)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-brand-card rounded-full transition-all text-gray-600 dark:text-gray-400"
              title="New Group"
            >
              <UserPlus className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowNewChat(true)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-brand-card rounded-full transition-all text-gray-600 dark:text-gray-400"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-brand-card rounded-full transition-all text-gray-600 dark:text-gray-400">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 bg-100 dark:bg-brand-card rounded-xl text-sm focus:outline-none transition-all dark:text-white"
            />
          </div>
        </div>

        {/* Invites Section */}
        {invites.filter(i => i.status === 'pending' && !i.mutualAgreement.includes(currentUser.id)).length > 0 && (
          <div className="px-4 pb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-proph mb-3 px-2">Pending Invites</h3>
            <div className="space-y-2">
              {invites.filter(i => i.status === 'pending' && !i.mutualAgreement.includes(currentUser.id)).map(invite => (
                <div key={invite.id} className="p-3 bg-brand-proph/5 border border-brand-proph/20 rounded-2xl">
                  <p className="text-[11px] font-bold dark:text-white mb-2">
                    Invite to join conversation: {invite.targetId}
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => SupabaseService.respondToChatInvite(invite.id, currentUser.id, true).then(loadInvites)}
                      className="flex-1 py-1.5 bg-brand-proph text-black rounded-lg font-black text-[9px] uppercase tracking-widest hover:brightness-110 transition-all"
                    >
                      Agree
                    </button>
                    <button 
                      onClick={() => SupabaseService.respondToChatInvite(invite.id, currentUser.id, false).then(loadInvites)}
                      className="flex-1 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-500 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => { setSelectedGroup(group); setSelectedUser(null); }}
              className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-brand-card transition-colors border-b border-gray-50 dark:border-brand-border/30 ${selectedGroup?.id === group.id ? 'bg-gray-100 dark:bg-brand-card' : ''}`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-brand-proph/20 flex items-center justify-center font-black text-brand-proph">
                  {group.name.charAt(0)}
                </div>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-bold text-sm dark:text-white truncate">{group.name}</p>
                <p className="text-xs text-gray-500 truncate">{group.description}</p>
              </div>
            </button>
          ))}
          {recentConversations.length > 0 ? (
            recentConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedUser(conv.otherUser)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-brand-card transition-colors border-b border-gray-50 dark:border-brand-border/30 ${selectedUser?.id === conv.otherUser.id ? 'bg-gray-100 dark:bg-brand-card' : ''}`}
              >
                <div className="relative">
                  <img src={CloudinaryService.getOptimizedUrl(conv.otherUser.avatar || `https://ui-avatars.com/api/?name=${conv.otherUser.nickname}`)} className="w-12 h-12 rounded-full object-cover" alt="" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-brand-black" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-sm dark:text-white truncate">@{conv.otherUser.nickname}</p>
                    <p className="text-[10px] text-gray-500">{formatTime(conv.lastMessageAt)}</p>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">No recent conversations</p>
              <button 
                onClick={() => setShowNewChat(true)}
                className="mt-4 text-brand-proph font-black text-xs uppercase tracking-widest"
              >
                Start a new chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col relative ${(!selectedUser && !selectedGroup) ? 'hidden lg:flex' : 'flex'}`}>
        {(selectedUser || selectedGroup) ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-brand-border flex items-center justify-between bg-white dark:bg-brand-black sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => { setSelectedUser(null); setSelectedGroup(null); }} className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-400">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  {selectedGroup ? (
                    <div className="w-10 h-10 rounded-full bg-brand-proph/20 flex items-center justify-center font-black text-brand-proph">
                      {selectedGroup.name.charAt(0)}
                    </div>
                  ) : (
                    <>
                      <img src={CloudinaryService.getOptimizedUrl(selectedUser?.avatar || `https://ui-avatars.com/api/?name=${selectedUser?.nickname}`)} className="w-10 h-10 rounded-full object-cover" alt="" />
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-brand-black" />
                    </>
                  )}
                </div>
                <div>
                  <p className="font-bold dark:text-white text-sm">
                    {selectedGroup ? selectedGroup.name : `@${selectedUser?.nickname}`}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedUser?.isOnline ? 'text-green-500' : 'text-gray-500'}`}>
                    {selectedGroup ? 'Group Chat' : (selectedUser?.isOnline ? 'Online' : formatLastSeen(selectedUser?.lastSeen))}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {!selectedGroup && (
                  <button onClick={() => setShowInviteModal(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-brand-card rounded-full text-gray-600 dark:text-gray-400 transition-colors">
                    <UserPlus className="w-5 h-5" />
                  </button>
                )}
                <button onClick={startVideoCall} className="p-2 hover:bg-gray-100 dark:hover:bg-brand-card rounded-full text-gray-600 dark:text-gray-400 transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-brand-card rounded-full text-gray-600 dark:text-gray-400 transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-brand-card rounded-full text-gray-600 dark:text-gray-400 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#e5ddd5] dark:bg-brand-black/90 relative custom-scrollbar">
              {/* WhatsApp-like Background Pattern (Simulated) */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none dark:opacity-[0.05]" style={{ backgroundImage: 'url("https://picsum.photos/seed/pattern/100/100")', backgroundRepeat: 'repeat' }} />
              
              {messages.map((msg, index) => {
                const isOwn = msg.senderId === currentUser.id;
                const showDate = index === 0 || new Date(messages[index-1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

                return (
                  <React.Fragment key={msg.id}>
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="px-3 py-1 bg-white/80 dark:bg-brand-card/80 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 shadow-sm border border-brand-border/30">
                          {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} relative z-10 group`}>
                      <div className={`max-w-[85%] sm:max-w-[70%] rounded-xl p-2 px-3 shadow-sm relative ${isOwn ? 'bg-[#dcf8c6] dark:bg-brand-proph text-black rounded-tr-none' : 'bg-white dark:bg-brand-card dark:text-white rounded-tl-none'}`}>
                        {/* Bubble Tail (Simulated) */}
                        <div className={`absolute top-0 w-2 h-2 ${isOwn ? '-right-1 bg-[#dcf8c6] dark:bg-brand-proph' : '-left-1 bg-white dark:bg-brand-card'}`} style={{ clipPath: isOwn ? 'polygon(0 0, 0 100%, 100% 0)' : 'polygon(0 0, 100% 100%, 100% 0)' }} />
                        
                        {/* Reply Preview in Bubble */}
                        {msg.replyToContent && (
                          <div className={`mb-2 p-2 rounded-lg border-l-4 text-[11px] bg-black/5 dark:bg-white/5 ${isOwn ? 'border-brand-black/20' : 'border-brand-proph/50'}`}>
                            <p className="font-black opacity-50 uppercase tracking-widest text-[9px] mb-1">Replying to:</p>
                            <p className="italic line-clamp-2">{msg.replyToContent}</p>
                          </div>
                        )}

                        {msg.text && (
                          <div className="text-[13px] leading-relaxed break-words">
                            {msg.text}
                            <VideoEmbed content={msg.text} />
                          </div>
                        )}
                        {msg.mediaUrl && (
                          <div className="mt-1">
                            {msg.mediaType === 'image' && (
                              <img 
                                src={CloudinaryService.getOptimizedUrl(msg.mediaUrl)} 
                                className="rounded-lg max-h-80 w-full object-cover cursor-zoom-in hover:brightness-90 transition-all" 
                                alt="" 
                                onClick={() => setLightboxImage(msg.mediaUrl || null)}
                              />
                            )}
                            {msg.mediaType === 'video' && <video src={msg.mediaUrl} controls className="rounded-lg max-h-80 w-full" />}
                            {msg.mediaType === 'audio' && (
                              <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl flex items-center gap-3 min-w-[200px]">
                                <div className="w-10 h-10 bg-brand-proph rounded-full flex items-center justify-center text-black">
                                  <Mic className="w-5 h-5" />
                                </div>
                                <audio src={msg.mediaUrl} controls className="h-8 flex-1" />
                              </div>
                            )}
                            <div className="flex items-center gap-1 mt-1 opacity-50">
                              <Clock className="w-2.5 h-2.5" />
                              <p className="text-[9px] italic">Expires in 24h</p>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-end items-center gap-1 mt-1">
                          <p className={`text-[9px] font-bold ${isOwn ? 'text-black/50' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {isOwn && (
                            <div className="flex items-center">
                              {msg.isSeen ? (
                                <span className="text-[10px] font-black text-green-600 italic">p</span>
                              ) : (
                                <span className="text-[10px] font-black text-black/20 italic">p</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Reply Action Button (Visible on Hover) */}
                        <button 
                          onClick={() => setReplyingTo(msg)}
                          className={`absolute top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-brand-card/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-20 ${isOwn ? '-left-12' : '-right-12'}`}
                          title="Reply"
                        >
                          <Plus className="w-4 h-4 text-brand-proph rotate-45" />
                        </button>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <Lightbox 
              isOpen={!!lightboxImage} 
              imageUrl={lightboxImage || ''} 
              onClose={() => setLightboxImage(null)} 
            />

            {/* Input Area */}
            <div className="bg-[#f0f2f5] dark:bg-brand-black border-t border-gray-100 dark:border-brand-border flex flex-col">
              {/* Reply Preview */}
              <AnimatePresence>
                {replyingTo && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 py-2 bg-brand-proph/10 border-b border-brand-proph/20 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0 border-l-4 border-brand-proph pl-3 py-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-proph mb-1">Replying to</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 truncate italic">
                        {replyingTo.text || (replyingTo.mediaType ? `Sent a ${replyingTo.mediaType}` : 'Media message')}
                      </p>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-brand-proph/20 rounded-full transition-all">
                      <X className="w-4 h-4 text-brand-proph" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-3 flex items-center gap-2">
                <div className="flex items-center gap-1">
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                  <Smile className="w-6 h-6" />
                </button>
                <label className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-white cursor-pointer transition-colors">
                  <Paperclip className="w-6 h-6" />
                  <input type="file" className="hidden" accept="image/*,video/*,audio/*" onChange={handleFileUpload} />
                </label>
              </div>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="w-full pl-4 pr-4 py-2.5 bg-white dark:bg-brand-card rounded-xl text-sm focus:outline-none transition-all dark:text-white shadow-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendMessage}
                  disabled={isUploading || !inputText.trim()}
                  className="p-3 bg-brand-proph text-black rounded-full hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-brand-proph/20"
                >
                  <Send className="w-6 h-6" />
                </button>
                {!inputText.trim() && (
                  <button 
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    className={`p-3 rounded-full transition-all shadow-lg ${isRecording ? 'bg-red-500 text-white animate-pulse scale-125' : 'bg-brand-proph text-black hover:brightness-110 shadow-brand-proph/20'}`}
                  >
                    <Mic className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          </div>
          {isRecording && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500 text-white rounded-full flex items-center gap-3 shadow-2xl z-50 animate-bounce">
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              <span className="font-black text-xs uppercase tracking-widest">Recording: {recordingTime}s</span>
              <span className="text-[10px] opacity-70">Release to send</span>
            </div>
          )}
        </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 bg-[#f8f9fa] dark:bg-brand-black">
            <div className="w-24 h-24 bg-gray-200 dark:bg-brand-card rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Shield className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-black dark:text-white mb-3 uppercase italic tracking-tighter">Proph Secure Link</h3>
            <p className="text-sm text-center max-w-sm font-medium leading-relaxed">
              Select a node to establish an encrypted communication channel. 
              All transmissions are protected by the Proph Security Protocol.
            </p>
            <button 
              onClick={() => setShowNewChat(true)}
              className="mt-8 px-8 py-3 bg-brand-proph text-black font-black rounded-full text-xs uppercase tracking-widest shadow-xl shadow-brand-proph/20 hover:scale-105 transition-all"
            >
              Initialize New Link
            </button>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-brand-black w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-border"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between">
                <h3 className="text-xl font-black uppercase italic text-gray-900 dark:text-white">Chat Settings</h3>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-brand-card rounded-full transition-all">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="+234..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-brand-card rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-proph transition-all dark:text-white font-bold"
                  />
                </div>
                <button 
                  onClick={handleSaveSettings}
                  className="w-full py-4 bg-brand-proph text-black font-black rounded-xl text-xs uppercase tracking-widest shadow-xl shadow-brand-proph/20 hover:scale-105 transition-all"
                >
                  Save & Verify Node
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-brand-black w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-border"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between">
                <h3 className="text-xl font-black uppercase italic text-gray-900 dark:text-white">Invite Third Party</h3>
                <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-brand-card rounded-full transition-all">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs text-brand-muted font-medium">
                  Invite a third party to this conversation. Both you and @{selectedUser?.nickname} must agree.
                  The third party will only see new messages.
                </p>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search node to invite..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-brand-card rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-proph transition-all dark:text-white font-bold"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-2">
                  {searchResults.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleInviteThirdParty(u.id)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-brand-card rounded-xl transition-all border border-transparent hover:border-brand-border"
                    >
                      <img src={CloudinaryService.getOptimizedUrl(u.avatar || `https://ui-avatars.com/api/?name=${u.nickname}`)} className="w-8 h-8 rounded-full object-cover" alt="" />
                      <p className="font-black text-xs dark:text-white">@{u.nickname}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-brand-black w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-border"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between">
                <h3 className="text-xl font-black uppercase italic text-gray-900 dark:text-white">Create Group</h3>
                <button onClick={() => setShowCreateGroup(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-brand-card rounded-full transition-all">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 ml-4">Group Name</label>
                  <input 
                    type="text" 
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    placeholder="Enter group name..."
                    className="w-full bg-gray-50 dark:bg-brand-card border border-brand-border p-4 rounded-2xl text-sm text-gray-900 dark:text-white focus:border-brand-proph outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 ml-4">Description</label>
                  <textarea 
                    value={newGroupDesc}
                    onChange={e => setNewGroupDesc(e.target.value)}
                    placeholder="What is this group about?"
                    className="w-full bg-gray-50 dark:bg-brand-card border border-brand-border p-4 rounded-2xl text-sm text-gray-900 dark:text-white focus:border-brand-proph outline-none transition-all font-bold h-24 resize-none"
                  />
                </div>
                <button 
                  onClick={handleCreateGroup}
                  className="w-full bg-brand-proph py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-black shadow-xl shadow-brand-proph/20 hover:scale-[1.02] transition-all"
                >
                  Initialize Group Node
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-brand-black w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-border"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between">
                <h3 className="text-xl font-black uppercase italic text-gray-900 dark:text-white">New Link</h3>
                <button onClick={() => setShowNewChat(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-brand-card rounded-full transition-all">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by nickname..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-brand-card rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-proph transition-all dark:text-white font-bold"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
                  {searchResults.length > 0 ? (
                    searchResults.map(user => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setSelectedUser(user);
                          setShowNewChat(false);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-brand-card rounded-2xl transition-all border border-transparent hover:border-brand-border"
                      >
                        <img src={CloudinaryService.getOptimizedUrl(user.avatar || `https://ui-avatars.com/api/?name=${user.nickname}`)} className="w-12 h-12 rounded-full object-cover" alt="" />
                        <div className="text-left">
                          <p className="font-black text-sm dark:text-white">@{user.nickname}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-black">{user.name}</p>
                        </div>
                      </button>
                    ))
                  ) : searchQuery.length > 2 ? (
                    <div className="p-8 text-center text-gray-500">
                      <p className="text-sm">No nodes found matching "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <p className="text-sm font-bold italic">Enter at least 3 characters to search</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Call Overlay (Simulated) */}
      <AnimatePresence>
        {isVideoCalling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-8"
          >
            <div className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-[3rem] overflow-hidden shadow-2xl border border-gray-800">
              <div className="absolute inset-0 flex items-center justify-center">
                <img src={CloudinaryService.getOptimizedUrl(selectedUser?.avatar || `https://ui-avatars.com/api/?name=${selectedUser?.nickname}`)} className="w-48 h-48 rounded-full blur-2xl opacity-20 animate-pulse" alt="" />
                <div className="absolute text-center">
                  <div className="w-32 h-32 rounded-full border-4 border-brand-proph p-1 mx-auto mb-6">
                    <img src={CloudinaryService.getOptimizedUrl(selectedUser?.avatar || `https://ui-avatars.com/api/?name=${selectedUser?.nickname}`)} className="w-full h-full rounded-full object-cover" alt="" />
                  </div>
                  <p className="text-white text-2xl font-black uppercase italic tracking-tighter mb-2">Establishing Link...</p>
                  <p className="text-brand-proph text-sm font-black uppercase tracking-widest">@{selectedUser?.nickname}</p>
                </div>
              </div>
              
              {/* Local Video Preview */}
              <div className="absolute bottom-8 right-8 w-48 aspect-video bg-gray-800 rounded-2xl border-2 border-brand-proph/30 overflow-hidden shadow-2xl">
                <div className="w-full h-full flex items-center justify-center bg-gray-950">
                  <UserIcon className="w-10 h-10 text-gray-700" />
                </div>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-8">
              <button className="p-5 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-all shadow-xl">
                <Mic className="w-6 h-6" />
              </button>
              <button onClick={() => setIsVideoCalling(false)} className="p-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-2xl shadow-red-500/40 scale-110">
                <PhoneOff className="w-8 h-8" />
              </button>
              <button className="p-5 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-all shadow-xl">
                <Video className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;
