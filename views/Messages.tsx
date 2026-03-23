
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Edit3, MoreHorizontal, Send, 
  Smile, Paperclip, Phone, Video,
  Info, ShieldCheck, CheckCircle2, User as UserIcon
} from 'lucide-react';
import { User, Message } from '../types';

interface MessagesProps {
  user: User;
  allUsers: User[];
  messages: Message[];
  onSendMessage: (text: string, receiverId: string) => void;
}

const Messages: React.FC<MessagesProps> = ({ user, allUsers, messages, onSendMessage }) => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, messages]);

  // Filter users to show in sidebar (excluding current user)
  const chatUsers = allUsers
    .filter(u => u.id !== user.id)
    .filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Set first user as active if none selected
  useEffect(() => {
    if (!activeChatId && chatUsers.length > 0) {
      setActiveChatId(chatUsers[0].id);
    }
  }, [chatUsers, activeChatId]);

  const activeChatMessages = messages.filter(m => 
    (m.senderId === user.id && m.receiverId === activeChatId) ||
    (m.senderId === activeChatId && m.receiverId === user.id)
  );

  const handleSend = () => {
    if (!input.trim() || !activeChatId) return;
    onSendMessage(input, activeChatId);
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-64px)] flex bg-white dark:bg-brand-black overflow-hidden border-l border-brand-border">
      {/* Chats Sidebar */}
      <aside className="hidden lg:flex w-96 border-r border-brand-border flex-col bg-white dark:bg-brand-black z-20">
         <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Messages</h2>
               <div className="flex gap-2">
                 <button className="p-2.5 bg-gray-50 dark:bg-brand-card rounded-2xl text-gray-400 hover:bg-gray-100 transition-all"><MoreHorizontal className="w-5 h-5" /></button>
                 <button className="p-2.5 bg-brand-proph rounded-2xl text-black shadow-xl shadow-brand-proph/20"><Edit3 className="w-5 h-5" /></button>
               </div>
            </div>
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted w-4 h-4" />
                <input 
                  placeholder="Search encrypted links" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-brand-card border-none rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold focus:ring-1 focus:ring-brand-proph outline-none dark:text-white" 
                />
             </div>
          </div>

          <div className="flex-grow overflow-y-auto px-4 space-y-2 no-scrollbar">
             {chatUsers.map(item => {
                const lastMsg = messages.filter(m => 
                  (m.senderId === user.id && m.receiverId === item.id) ||
                  (m.senderId === item.id && m.receiverId === user.id)
                ).pop();

                return (
                   <div 
                     key={item.id}
                     onClick={() => setActiveChatId(item.id)}
                     className={`p-5 rounded-[2rem] cursor-pointer transition-all flex gap-4 group ${activeChatId === item.id ? 'bg-brand-proph/10' : 'hover:bg-gray-50 dark:hover:bg-brand-card'}`}
                   >
                      <div className="relative flex-shrink-0">
                         <div className="w-14 h-14 bg-gray-100 dark:bg-brand-border rounded-full border-2 border-white dark:border-brand-border shadow-sm flex items-center justify-center font-black text-gray-400 overflow-hidden">
                            {item.avatar ? (
                              <img src={item.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              item.name.charAt(0)
                            )}
                         </div>
                         <div className="absolute bottom-0 right-0 w-4 h-4 bg-brand-proph rounded-full border-2 border-white dark:border-brand-black shadow-sm" />
                      </div>
                      <div className="flex-grow min-w-0">
                         <div className="flex justify-between items-start mb-1">
                            <p className={`text-sm font-black truncate ${activeChatId === item.id ? 'text-brand-proph' : 'text-gray-900 dark:text-white'}`}>{item.name}</p>
                            <span className="text-[9px] font-bold text-brand-muted uppercase tracking-tighter whitespace-nowrap ml-2">
                              {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                         </div>
                         <p className={`text-xs truncate ${lastMsg ? 'text-gray-900 dark:text-gray-200 font-bold' : 'text-brand-muted'}`}>
                            {lastMsg ? lastMsg.text : 'Start a new academic link...'}
                         </p>
                      </div>
                   </div>
                );
             })}
          </div>
      </aside>

      {/* Active Chat Area */}
      <main className="flex flex-grow flex-col relative bg-gray-50/50 dark:bg-brand-black">
         {activeChatId ? (
           <>
             {/* Chat Header */}
             <header className="h-24 bg-white/80 dark:bg-brand-black/80 backdrop-blur-md border-b border-brand-border px-8 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-gray-100 dark:bg-brand-card rounded-full font-black text-gray-400 flex items-center justify-center border border-brand-border overflow-hidden">
                      {allUsers.find(i => i.id === activeChatId)?.avatar ? (
                        <img src={allUsers.find(i => i.id === activeChatId)?.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        allUsers.find(i => i.id === activeChatId)?.name.charAt(0)
                      )}
                   </div>
                   <div>
                      <h3 className="font-black text-gray-900 dark:text-white tracking-tight">{allUsers.find(i => i.id === activeChatId)?.name}</h3>
                      <div className="flex items-center gap-1.5">
                         <div className="w-2 h-2 bg-brand-proph rounded-full animate-pulse" />
                         <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">Real-time Node Sync Active</span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <button className="p-3 text-brand-muted hover:text-brand-pro transition-colors"><Phone className="w-5 h-5" /></button>
                   <button className="p-3 text-brand-muted hover:text-brand-pro transition-colors"><Video className="w-5 h-5" /></button>
                   <div className="w-px h-6 bg-brand-border mx-2" />
                   <button className="p-3 text-brand-muted hover:text-brand-primary transition-colors"><Info className="w-5 h-5" /></button>
                </div>
             </header>

             {/* Messages Flow */}
             <div className="flex-grow overflow-y-auto p-10 space-y-8 no-scrollbar custom-scrollbar">
                <div className="text-center">
                   <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest border border-brand-border">
                      <ShieldCheck className="w-4 h-4 text-brand-proph" /> Institutional-Alpha Encryption
                   </div>
                </div>

                {activeChatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-6 rounded-[2.5rem] shadow-xl border ${
                      msg.senderId === user.id 
                        ? 'bg-brand-proph text-black rounded-tr-none border-brand-proph' 
                        : 'bg-white dark:bg-brand-card text-gray-700 dark:text-gray-200 rounded-tl-none border-brand-border'
                    }`}>
                      <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                      <div className="flex justify-end items-center gap-1 mt-3">
                         <span className={`text-[9px] font-black uppercase tracking-tighter ${msg.senderId === user.id ? 'text-black/40' : 'text-brand-muted'}`}>
                           {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                         {msg.senderId === user.id && <CheckCircle2 className="w-3 h-3 text-black/40" />}
                      </div>
                    </div>
                  </div>
                ))}
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
                     placeholder="Sync message with node..."
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
           </>
         ) : (
           <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-40">
              <div className="w-32 h-32 bg-gray-100 dark:bg-brand-card rounded-[3rem] flex items-center justify-center border border-brand-border">
                 <UserIcon className="w-16 h-16 text-gray-300" />
              </div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-brand-muted">Select a Link to Sync</p>
           </div>
         )}
      </main>
    </div>
  );
};

export default Messages;
