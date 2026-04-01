
import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Mic, Video, Image as ImageIcon, X, Phone, PhoneOff, Trash2, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SupabaseService } from '../src/services/supabaseService';
import { User, Message } from '../types';
import { CloudinaryService } from '../src/services/cloudinaryService';

interface ChatProps {
  currentUser: User;
}

const Chat: React.FC<ChatProps> = ({ currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isVideoCalling, setIsVideoCalling] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedUser) {
      loadMessages();
      const subscription = SupabaseService.subscribeToMessages(currentUser.id, (payload) => {
        if (payload.new && (payload.new.sender_id === selectedUser.id || payload.new.receiver_id === selectedUser.id)) {
          loadMessages();
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!selectedUser) return;
    const msgs = await SupabaseService.getMessages(currentUser.id);
    // Filter for conversation with selected user and handle expiry
    const now = Date.now();
    const filtered = msgs.filter(m => {
      const isRelevant = (m.senderId === currentUser.id && m.receiverId === selectedUser.id) ||
                         (m.senderId === selectedUser.id && m.receiverId === currentUser.id);
      if (!isRelevant) return false;
      
      // Check expiry for media
      if (m.mediaUrl && m.expiresAt && now > m.expiresAt) {
        return false;
      }
      return true;
    });
    setMessages(filtered);
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
    if (!inputText.trim() || !selectedUser) return;
    
    try {
      await SupabaseService.sendMessage({
        senderId: currentUser.id,
        receiverId: selectedUser.id,
        text: inputText
      });
      setInputText('');
      loadMessages();
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
      const timer = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      (recorder as any)._timer = timer;
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval((mediaRecorderRef.current as any)._timer);
      setIsRecording(false);
    }
  };

  const uploadMedia = async (blob: Blob, type: 'image' | 'video' | 'audio') => {
    if (!selectedUser) return;
    setIsUploading(true);
    try {
      const file = new File([blob], `media_${Date.now()}`, { type: blob.type });
      const url = await CloudinaryService.uploadFile(file);
      
      // Set expiry to 24 hours from now
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

      await SupabaseService.sendMessage({
        senderId: currentUser.id,
        receiverId: selectedUser.id,
        mediaUrl: url,
        mediaType: type,
        expiresAt
      });
      loadMessages();
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
    // In a real app, this would initiate WebRTC signaling
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
      {/* Sidebar: User Search */}
      <div className="w-80 border-r border-gray-100 dark:border-gray-800 flex flex-col">
        <div className="p-4 border-bottom border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by nickname..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {searchResults.length > 0 ? (
            searchResults.map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedUser?.id === user.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              >
                <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.nickname}`} className="w-10 h-10 rounded-full object-cover" alt="" />
                <div className="text-left">
                  <p className="font-semibold text-sm dark:text-white">@{user.nickname}</p>
                  <p className="text-xs text-gray-500 truncate">{user.name}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">Search for users to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <img src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.nickname}`} className="w-10 h-10 rounded-full object-cover" alt="" />
                <div>
                  <p className="font-semibold dark:text-white">@{selectedUser.nickname}</p>
                  <p className="text-xs text-green-500">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={startVideoCall} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${msg.senderId === currentUser.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 dark:text-white rounded-tl-none'}`}>
                    {msg.text && <p className="text-sm">{msg.text}</p>}
                    {msg.mediaUrl && (
                      <div className="mt-2">
                        {msg.mediaType === 'image' && <img src={msg.mediaUrl} className="rounded-lg max-h-60 w-full object-cover" alt="" />}
                        {msg.mediaType === 'video' && <video src={msg.mediaUrl} controls className="rounded-lg max-h-60 w-full" />}
                        {msg.mediaType === 'audio' && <audio src={msg.mediaUrl} controls className="w-full" />}
                        <p className="text-[10px] mt-1 opacity-70 italic">Expires in 24h</p>
                      </div>
                    )}
                    <p className={`text-[10px] mt-1 ${msg.senderId === currentUser.id ? 'text-blue-100' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <label className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 cursor-pointer transition-colors">
                  <ImageIcon className="w-5 h-5" />
                  <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                </label>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="w-full pl-4 pr-10 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button 
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-blue-500'}`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isUploading}
                  className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              {isRecording && (
                <div className="mt-2 flex items-center gap-2 text-xs text-red-500 font-medium">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  Recording: {recordingTime}s
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold dark:text-white mb-2">Your Messages</h3>
            <p className="text-sm text-center max-w-xs">Select a user from the sidebar to start a conversation. Messages are secure and media expires after 24 hours.</p>
          </div>
        )}

        {/* Video Call Overlay (Simulated) */}
        <AnimatePresence>
          {isVideoCalling && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-8"
            >
              <div className="relative w-full max-w-2xl aspect-video bg-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src={selectedUser?.avatar || `https://ui-avatars.com/api/?name=${selectedUser?.nickname}`} className="w-32 h-32 rounded-full blur-sm opacity-50" alt="" />
                  <div className="absolute text-center">
                    <p className="text-white text-xl font-bold mb-2">Calling @{selectedUser?.nickname}...</p>
                    <div className="flex gap-4 justify-center">
                      <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                      <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                    </div>
                  </div>
                </div>
                
                {/* Local Video Preview (Simulated) */}
                <div className="absolute bottom-4 right-4 w-40 aspect-video bg-gray-700 rounded-xl border-2 border-gray-600 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <UserIcon className="w-8 h-8 text-gray-500" />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-6">
                <button className="p-4 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors">
                  <Mic className="w-6 h-6" />
                </button>
                <button onClick={() => setIsVideoCalling(false)} className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-xl shadow-red-500/20">
                  <PhoneOff className="w-8 h-8" />
                </button>
                <button className="p-4 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors">
                  <Video className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Chat;
