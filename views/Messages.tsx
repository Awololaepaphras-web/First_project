
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Edit3, MoreHorizontal, Send, 
  Smile, Paperclip, Phone, Video,
  Info, ShieldCheck, CheckCircle2, User as UserIcon
} from 'lucide-react';
import { User, Message, SystemConfig } from '../types';

interface MessagesProps {
  user: User;
  allUsers: User[];
  messages: Message[];
  config: SystemConfig;
  onSendMessage: (text: string, receiverId: string) => void;
}

const Messages: React.FC<MessagesProps> = ({ user, allUsers, messages, config, onSendMessage }) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!config.isMessagingEnabled && user.role !== 'admin') {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-white dark:bg-brand-black p-8 text-center">
        <div className="w-20 h-20 bg-brand-proph/10 rounded-3xl flex items-center justify-center mb-6 border border-brand-proph/20">
          <ShieldCheck className="w-10 h-10 text-brand-proph" />
        </div>
        <h2 className="text-3xl font-black uppercase italic text-gray-900 dark:text-white mb-4 tracking-tight">Portal Restricted</h2>
        <p className="text-brand-muted max-w-md font-medium leading-relaxed">
          The Global Academic Link is currently restricted by the administration. 
          Direct communication nodes are offline for maintenance or security protocols.
        </p>
        <div className="mt-8 p-4 bg-brand-proph/5 rounded-2xl border border-brand-proph/10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-proph">System Status: Locked</p>
        </div>
      </div>
    );
  }

  // Global messages are those with no receiverId (or a specific global ID)
  // For now, let's assume all messages in the 'messages' array that are not private are global
  // Or better, let's just show ALL messages if the user wants a global chat
  const globalMessages = messages.filter(m => !m.receiverId);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input, ''); // Empty string or null for global
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-64px)] flex bg-white dark:bg-brand-black overflow-hidden border-l border-brand-border">
      {/* Active Chat Area */}
      <main className="flex flex-grow flex-col relative bg-gray-50/50 dark:bg-brand-black">
         {/* Chat Header */}
         <header className="h-24 bg-white/80 dark:bg-brand-black/80 backdrop-blur-md border-b border-brand-border px-8 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-brand-proph/10 rounded-full font-black text-brand-proph flex items-center justify-center border border-brand-proph/20 overflow-hidden">
                  <UserIcon className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="font-black text-gray-900 dark:text-white tracking-tight uppercase italic">Global Academic Link</h3>
                  <div className="flex items-center gap-1.5">
                     <div className="w-2 h-2 bg-brand-proph rounded-full animate-pulse" />
                     <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">All Nodes Connected</span>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex -space-x-3 overflow-hidden">
                  {allUsers.slice(0, 5).map(u => (
                    <img 
                      key={u.id}
                      src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} 
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-brand-black"
                      alt=""
                    />
                  ))}
                  {allUsers.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-white dark:border-brand-black flex items-center justify-center text-[10px] font-bold text-white">
                      +{allUsers.length - 5}
                    </div>
                  )}
               </div>
            </div>
         </header>

         {/* Messages Flow */}
         <div className="flex-grow overflow-y-auto p-10 space-y-8 no-scrollbar custom-scrollbar">
            <div className="text-center">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest border border-brand-border">
                  <ShieldCheck className="w-4 h-4 text-brand-proph" /> Public Academic Stream
               </div>
            </div>

            {globalMessages.map((msg) => {
              const sender = allUsers.find(u => u.id === msg.senderId);
              const isOwn = msg.senderId === user.id;

              return (
                <div key={msg.id} className={`flex gap-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isOwn && (
                    <div className="w-10 h-10 bg-gray-100 dark:bg-brand-card rounded-xl flex-shrink-0 overflow-hidden border border-brand-border">
                       {sender?.avatar ? (
                         <img src={sender.avatar} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center font-black text-gray-400 text-xs">
                           {sender?.name.charAt(0)}
                         </div>
                       )}
                    </div>
                  )}
                  <div className={`max-w-md space-y-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                    {!isOwn && (
                      <p className="text-[10px] font-black text-brand-proph uppercase tracking-widest ml-1">
                        {sender?.nickname || sender?.name || 'Unknown Node'}
                      </p>
                    )}
                    <div className={`p-5 rounded-[2rem] shadow-xl border ${
                      isOwn 
                        ? 'bg-brand-proph text-black rounded-tr-none border-brand-proph' 
                        : 'bg-white dark:bg-brand-card text-gray-700 dark:text-gray-200 rounded-tl-none border-brand-border'
                    }`}>
                      <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                      <div className="flex justify-end items-center gap-1 mt-3">
                         <span className={`text-[9px] font-black uppercase tracking-tighter ${isOwn ? 'text-black/40' : 'text-brand-muted'}`}>
                           {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                         {isOwn && <CheckCircle2 className="w-3 h-3 text-black/40" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
         </div>

         {/* Input Component */}
         <div className="p-8 bg-white dark:bg-brand-black border-t border-brand-border">
            <div className="bg-gray-50 dark:bg-brand-card p-3 rounded-[2.5rem] flex items-center gap-3 border border-brand-border focus-within:ring-1 focus-within:ring-brand-proph transition-all">
               <button className="p-3 text-brand-muted hover:text-white transition-colors"><Smile className="w-6 h-6" /></button>
               <button className="p-3 text-brand-muted hover:text-white transition-colors"><Paperclip className="w-6 h-6" /></button>
               <input 
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSend()}
                 placeholder="Broadcast message to all nodes..."
                 className="flex-grow bg-transparent border-none outline-none text-sm font-medium text-gray-900 dark:text-white px-2"
               />
               <button 
                 onClick={handleSend}
                 className="p-4 bg-brand-proph text-black rounded-full shadow-xl shadow-brand-proph/20 hover:scale-105 active:scale-95 transition-all"
               >
                  <Send className="w-6 h-6" />
               </button>
            </div>
         </div>
      </main>
    </div>
  );
};

export default Messages;
