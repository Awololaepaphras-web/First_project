
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import AdminBranding from './AdminBranding';
import { 
  Cpu, Database, Megaphone, Users, List, 
  Settings2, Activity, ToggleRight, ToggleLeft, Trash2, 
  Plus, CheckCircle2, XCircle, Send, Shield, DollarSign, 
  Zap, Building2, BookOpen, Layers, PlusCircle, X, 
  PlayCircle, Monitor, Upload, Clock, CreditCard,
  FileCheck, AlertCircle, ChevronRight, Menu, Image as ImageIcon,
  Star, BarChart3, Target, Wallet,
  Palette, Download, Tv, Award, ShieldCheck, MessageSquare, RefreshCw, Globe, Loader2
} from 'lucide-react';
import { CloudinaryService } from '../src/services/cloudinaryService';
import { User, PastQuestion, WithdrawalRequest, SystemConfig, EarnTask, Notification, University, Advertisement, AdTimeFrame, AdType, AdPlacement } from '../types';
import { SupabaseService } from '../src/services/supabaseService';

interface AdminDashboardProps {
  user: User;
  config: SystemConfig;
  allUsers: User[];
  questions: PastQuestion[];
  withdrawalRequests: WithdrawalRequest[];
  tasks: EarnTask[];
  onUpdateConfig: (config: SystemConfig) => void;
  onUpdateUsers: (users: User[]) => void;
  onAddTask: (task: EarnTask) => void;
  onDeleteTask: (id: string) => void;
  onDeleteQuestion: (id: string) => void;
  onDeleteUser: (id: string) => void;
  onBroadcast: (notif: Notification) => void;
  universities: University[];
  universityColleges: Record<string, string[]>;
  collegeDepartments: Record<string, string[]>;
  onAddUniversity: (uni: University) => void;
  onRemoveUniversity: (uniId: string) => void;
  onAddCollege: (uniId: string, college: string) => void;
  onRemoveCollege: (uniId: string, college: string) => void;
  onAddDept: (college: string, dept: string) => void;
  onRemoveDept: (college: string, dept: string) => void;
  onApproveQuestion: (id: string) => void;
  onRejectQuestion: (id: string) => void;
  onApproveWithdrawal: (id: string) => void;
  onRejectWithdrawal: (id: string) => void;
  globalAds: Advertisement[];
  onAddAd: (ad: Advertisement) => void;
  onDeleteAd: (id: string) => void;
  onUpdateUniversity: (uniId: string, updates: Partial<University>) => void;
  onUpdateAd: (ad: Advertisement) => void;
  onUpdateLogo: (logoUrl: string) => void;
  onUpdateIcon: (iconUrl: string) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, config, allUsers, questions, withdrawalRequests, 
  tasks, onUpdateConfig, onUpdateUsers, 
  onDeleteQuestion, onDeleteTask, onDeleteUser, onAddTask, onBroadcast,
  universities, universityColleges, collegeDepartments,
  onAddUniversity, onRemoveUniversity, onAddCollege, onRemoveCollege, onAddDept, onRemoveDept,
  onApproveQuestion, onRejectQuestion, onApproveWithdrawal, onRejectWithdrawal,
  globalAds, onAddAd, onDeleteAd, onUpdateAd, onUpdateUniversity, onUpdateLogo, onUpdateIcon, onLogout
}) => {
  const [activeTab, setActiveTab] = useState('command');
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  const [broadcast, setBroadcast] = useState({ title: '', content: '', type: 'info' as Notification['type'] });
  const [newTask, setNewTask] = useState({ title: '', link: '', points: 50, question: '' });
  const [newAd, setNewAd] = useState({ 
    title: '', 
    mediaUrl: '', 
    mediaType: 'image' as 'image' | 'video', 
    adType: 'popup' as AdType,
    placement: 'timeline' as AdPlacement,
    link: '', 
    duration: 15, 
    targetLocation: 'all',
    campaignDuration: 7,
    campaignUnit: 'days' as 'days' | 'weeks',
    timesPerDay: 5,
    targetReach: 'all' as number | 'all',
    timeFrames: [] as AdTimeFrame[]
  });
  const [newUni, setNewUni] = useState({ name: '', acronym: '', location: '', logo: '' });
  const [selectedUniForCollege, setSelectedUniForCollege] = useState('');
  const [newCollegeNames, setNewCollegeNames] = useState('');
  const [selectedCollegeForDept, setSelectedCollegeForDept] = useState('');
  const [newDeptNames, setNewDeptNames] = useState('');

  const adFileInputRef = useRef<HTMLInputElement>(null);
  const uniLogoInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (activeTab === 'chat-monitor') {
      const fetchConversations = async () => {
        const data = await SupabaseService.getAllConversations();
        setConversations(data);
      };
      fetchConversations();
    }
  }, [activeTab]);

  React.useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        setLoadingMessages(true);
        let data;
        if (selectedConversation.id === 'global') {
          data = await SupabaseService.getGlobalMessages();
        } else {
          data = await SupabaseService.getConversationMessages(selectedConversation.user1_id, selectedConversation.user2_id);
        }
        setMessages(data);
        setLoadingMessages(false);
      };
      fetchMessages();
    }
  }, [selectedConversation]);

  const handleUpdateConfig = async (updates: Partial<SystemConfig>) => {
    const newConfig = { ...config, ...updates };
    onUpdateConfig(newConfig);
    
    // Sync with backend if rates or weights changed
    if (updates.earnRates || updates.engagementWeights) {
      try {
        await fetch('/api/admin/update-rates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cpm: newConfig.earnRates.tvView, // Using tvView as a proxy for CPM
            multiplier: 5.0, // Base multiplier
            engagementWeights: newConfig.engagementWeights
          })
        });
      } catch (err) {
        console.error("Failed to sync rates with backend", err);
      }
    }
  };

  const transmitSignal = () => {
    if (!broadcast.title.trim() || !broadcast.content.trim()) return;
    onBroadcast({ id: Math.random().toString(), title: broadcast.title, message: broadcast.content, type: broadcast.type, createdAt: Date.now(), read: false });
    setBroadcast({ title: '', content: '', type: 'info' });
    alert("Global Transmission Success.");
  };

  const deployTask = () => {
    if (!newTask.title.trim() || !newTask.link.trim() || !newTask.question.trim()) return;
    onAddTask({ id: Math.random().toString(), title: newTask.title, points: newTask.points, link: newTask.link, question: newTask.question });
    setNewTask({ title: '', link: '', points: 50, question: '' });
    alert("Bounty Deployed.");
  };

  const [isUploadingAd, setIsUploadingAd] = useState(false);
  const [isUploadingUni, setIsUploadingUni] = useState(false);

  const handleAdFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingAd(true);
      try {
        const mediaUrl = await CloudinaryService.uploadFile(file, file.type.startsWith('video/') ? 'video' : 'image');
        setNewAd({ ...newAd, mediaUrl, mediaType: file.type.startsWith('video/') ? 'video' : 'image' });
      } catch (error) {
        console.error('Ad media upload failed:', error);
        alert('Failed to upload ad media.');
      } finally {
        setIsUploadingAd(false);
      }
    }
  };

  const handleAddAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAd.title || !newAd.mediaUrl) return;
    if (isUploadingAd) return alert('Asset still synchronizing...');
    onAddAd({ 
      id: Math.random().toString(), 
      title: newAd.title, 
      type: newAd.mediaType, 
      adType: newAd.adType,
      placement: newAd.placement,
      mediaUrl: newAd.mediaUrl, 
      duration: newAd.duration, 
      link: newAd.link, 
      targetLocation: newAd.targetLocation,
      campaignDuration: newAd.campaignDuration,
      campaignUnit: newAd.campaignUnit,
      timesPerDay: newAd.timesPerDay,
      targetReach: newAd.targetReach,
      timeFrames: newAd.timeFrames
    });
    setNewAd({ 
      title: '', 
      mediaUrl: '', 
      mediaType: 'image', 
      adType: 'native',
      placement: 'timeline',
      link: '', 
      duration: 15, 
      targetLocation: 'all',
      campaignDuration: 7,
      campaignUnit: 'days',
      timesPerDay: 5,
      targetReach: 'all',
      timeFrames: []
    });
    alert("Ad Synchronized.");
  };

  const handleUniLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>, uniId?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingUni(true);
      try {
        const logoUrl = await CloudinaryService.uploadFile(file, 'image');
        if (uniId) onUpdateUniversity(uniId, { logo: logoUrl });
        else setNewUni({ ...newUni, logo: logoUrl });
      } catch (error) {
        console.error('University logo upload failed:', error);
        alert('Failed to upload university logo.');
      } finally {
        setIsUploadingUni(false);
      }
    }
  };

  const tabs = [
    { id: 'command', label: 'Mainframe', icon: <Cpu className="w-5 h-5" /> },
    { id: 'financials', label: 'Financial Matrix', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'engagement', label: 'Engage Matrix', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'submissions', label: 'Asset Review', icon: <FileCheck className="w-5 h-5" /> },
    { id: 'payouts', label: 'Payout Flow', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'ad-engine', label: 'Advert Engine', icon: <Monitor className="w-5 h-5" /> },
    { id: 'ad-review', label: 'Ad Verification', icon: <Target className="w-5 h-5" /> },
    { id: 'academic', label: 'Inst. Map', icon: <Building2 className="w-5 h-5" /> },
    { id: 'users', label: 'Nodes', icon: <Users className="w-5 h-5" /> },
    { id: 'broadcast', label: 'Signals', icon: <Megaphone className="w-5 h-5" /> },
    { id: 'tasks', label: 'Bounty Forge', icon: <Zap className="w-5 h-5" /> },
    { id: 'algorithms', label: 'Logic Matrix', icon: <Activity className="w-5 h-5" /> },
    { id: 'branding', label: 'App Branding', icon: <Palette className="w-5 h-5" /> },
    { id: 'sug', label: 'SUG Verify', icon: <Award className="w-5 h-5" /> },
    { id: 'staff', label: 'Staff Matrix', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'chat-monitor', label: 'Chat Matrix', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'payments', label: 'Payment Verify', icon: <FileCheck className="w-5 h-5" />, isLink: true, path: '/Epaphrastheadminofprophandloveforx/payments' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col lg:flex-row overflow-hidden selection:bg-red-500/30">
      <aside className={`fixed lg:relative inset-y-0 left-0 w-72 bg-gray-900 border-r border-gray-800 flex flex-col p-6 z-50 transform transition-transform duration-300 ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-4 mb-10">
           <div className="p-3 bg-red-600 rounded-2xl shadow-xl shadow-red-900/30"><Shield className="w-8 h-8 text-white" /></div>
           <div><p className="text-[10px] font-black uppercase text-gray-500">Administrator</p><p className="font-black text-white italic tracking-tighter truncate uppercase">{user.name}</p></div>
        </div>
        <nav className="flex-grow space-y-1 overflow-y-auto no-scrollbar">
           {tabs.map(tab => (
             tab.isLink ? (
               <Link 
                 key={tab.id} 
                 to={tab.path || '#'} 
                 className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-800 transition-all"
               >
                 {tab.icon} {tab.label}
               </Link>
             ) : (
               <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsMobileNavOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-red-600 text-white shadow-2xl' : 'text-gray-500 hover:bg-gray-800'}`} title={tab.label}>
                 {tab.icon} {tab.label}
               </button>
             )
           ))}
        </nav>

        <div className="mt-6 pt-6 border-t border-gray-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all"
          >
            <XCircle className="w-5 h-5" /> Terminate Session
          </button>
        </div>
      </aside>

      <main className="flex-grow p-6 lg:p-12 bg-black/20 overflow-y-auto custom-scrollbar">
        {activeTab === 'command' && (
          <div className="space-y-12 animate-fade-in">
             <h1 className="text-4xl font-black tracking-tighter uppercase italic">Control Mainframe</h1>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 space-y-4">
                   <div className="flex justify-between items-start">
                      <div className="p-3 bg-red-600/10 rounded-2xl text-red-500"><Shield className="w-6 h-6" /></div>
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active</span>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Security Shield</p>
                      <p className="text-2xl font-black text-white italic">HARDENED</p>
                      <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase italic">Anti-Kali Protocol: Enabled</p>
                   </div>
                </div>
                <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 space-y-4">
                   <div className="flex justify-between items-start">
                      <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500"><Activity className="w-6 h-6" /></div>
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Stable</span>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Network Load</p>
                      <p className="text-2xl font-black text-white italic">14.2 GB/s</p>
                      <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase italic">Latency: 12ms</p>
                   </div>
                </div>
                <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 space-y-4">
                   <div className="flex justify-between items-start">
                      <div className="p-3 bg-yellow-600/10 rounded-2xl text-yellow-500"><Users className="w-6 h-6" /></div>
                      <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Syncing</span>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Nodes</p>
                      <p className="text-2xl font-black text-white italic">{allUsers.length}</p>
                      <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase italic">Real-time Presence</p>
                   </div>
                </div>
                <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 space-y-4">
                   <div className="flex justify-between items-start">
                      <div className="p-3 bg-green-600/10 rounded-2xl text-green-500"><DollarSign className="w-6 h-6" /></div>
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Live</span>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Daily Volume</p>
                      <p className="text-2xl font-black text-white italic">₦420.5K</p>
                      <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase italic">Payouts: ₦12.4K</p>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-900/50 p-8 rounded-[3rem] border border-gray-800 space-y-6">
                   <h3 className="text-xl font-black text-white flex items-center gap-3"><Settings2 className="w-5 h-5 text-red-500" /> Operational Gates</h3>
                   <div className="space-y-4">
                      {[{ label: 'AI Study Logic', key: 'isAiEnabled' }, { label: 'Archive Submissions', key: 'isUploadEnabled' }, { label: 'Purse Portal', key: 'isWithdrawalEnabled' }, { label: 'Community Feed', key: 'isCommunityEnabled' }, { label: 'Maintenance Mode', key: 'isMaintenanceMode' }].map(f => (
                        <div key={f.label} className="flex justify-between items-center p-5 bg-gray-950/80 rounded-2xl border border-gray-800">
                           <span className="text-[10px] font-black uppercase text-gray-300">{f.label}</span>
                           <button onClick={() => handleUpdateConfig({ [f.key]: !config[f.key as keyof SystemConfig] })} className={`p-2 rounded-xl transition-all ${config[f.key as keyof SystemConfig] ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-500'}`} title="Toggle Node Gate">
                             {config[f.key as keyof SystemConfig] ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="bg-gray-900/50 p-8 rounded-[3rem] border border-gray-800 space-y-6 flex flex-col justify-center">
                   <h3 className="text-xl font-black text-white flex items-center gap-3"><Activity className="w-5 h-5 text-green-500" /> Matrix Volume</h3>
                   <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-6 bg-gray-950/80 rounded-3xl border border-gray-800"><p className="text-[8px] font-black text-gray-500 uppercase mb-1">Nodes</p><p className="text-3xl font-black italic">{allUsers.length}</p></div>
                      <div className="p-6 bg-gray-950/80 rounded-3xl border border-gray-800"><p className="text-[8px] font-black text-gray-500 uppercase mb-1">Archives</p><p className="text-3xl font-black italic">{questions.length}</p></div>
                      <div className="p-6 bg-gray-950/80 rounded-3xl border border-gray-800"><p className="text-[8px] font-black text-gray-500 uppercase mb-1">Ads Active</p><p className="text-3xl font-black italic">{globalAds.length}</p></div>
                      <div className="p-6 bg-gray-950/80 rounded-3xl border border-gray-800"><p className="text-[8px] font-black text-gray-500 uppercase mb-1">Payouts Req</p><p className="text-3xl font-black italic">{withdrawalRequests.filter(r => r.status === 'pending').length}</p></div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Removed: Deploy System Protocol, Synchronize Matrix Configuration, Synchronize Engagement Matrix buttons */}

        {activeTab === 'financials' && (
          <div className="space-y-12 animate-fade-in">
             <h1 className="text-4xl font-black tracking-tighter uppercase italic">Financial Matrix</h1>
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Earn Rates Section */}
                <div className="bg-gray-900/50 p-8 rounded-[3rem] border border-gray-800 space-y-6">
                   <h3 className="text-xl font-black text-white flex items-center gap-3"><Zap className="w-5 h-5 text-yellow-500" /> Earn Handbook Rates (PT)</h3>
                   <div className="grid grid-cols-2 gap-4">
                      {Object.entries(config.earnRates).map(([key, val]) => (
                        <div key={key} className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-gray-500 ml-2">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                           <input 
                            type="number"
                            className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white" 
                            value={val} 
                            onChange={e => handleUpdateConfig({ earnRates: { ...config.earnRates, [key]: parseInt(e.target.value) || 0 } })} 
                           />
                        </div>
                      ))}
                      <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Naira Per Point</label>
                           <input 
                            type="number" step="0.1"
                            className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white" 
                            value={config.nairaPerPoint} 
                            onChange={e => handleUpdateConfig({ nairaPerPoint: parseFloat(e.target.value) || 0 })} 
                           />
                        </div>
                   </div>
                </div>

                {/* Premium Tiers Section */}
                <div className="bg-gray-900/50 p-8 rounded-[3rem] border border-gray-800 space-y-6">
                   <h3 className="text-xl font-black text-white flex items-center gap-3"><Star className="w-5 h-5 text-purple-500" /> Premium Pricing (₦)</h3>
                   <div className="grid grid-cols-3 gap-4">
                      {Object.entries(config.premiumTiers).map(([key, val]) => (
                        <div key={key} className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-gray-500 ml-2">{key}</label>
                           <input 
                            type="number"
                            className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white" 
                            value={val} 
                            onChange={e => handleUpdateConfig({ premiumTiers: { ...config.premiumTiers, [key]: parseInt(e.target.value) || 0 } })} 
                           />
                        </div>
                      ))}
                   </div>
                </div>

                {/* Advert Pricing Section */}
                <div className="bg-gray-900/50 p-8 rounded-[3rem] border border-gray-800 space-y-6">
                   <h3 className="text-xl font-black text-white flex items-center gap-3"><Tv className="w-5 h-5 text-green-500" /> Advert Pricing (₦)</h3>
                   <div className="grid grid-cols-3 gap-4">
                      {Object.entries(config.adPricing || { daily: 0, weekly: 0, monthly: 0 }).map(([key, val]) => (
                        <div key={key} className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-gray-500 ml-2">{key}</label>
                           <input 
                            type="number"
                            className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white" 
                            value={val} 
                            onChange={e => handleUpdateConfig({ adPricing: { ...config.adPricing, [key]: parseInt(e.target.value) || 0 } })} 
                           />
                        </div>
                      ))}
                   </div>
                </div>

                {/* Monetization Weights Section */}
                <div className="bg-gray-900/50 p-8 rounded-[3rem] border border-gray-800 space-y-6">
                   <h3 className="text-xl font-black text-white flex items-center gap-3"><BarChart3 className="w-5 h-5 text-blue-500" /> Engagement Weights (X-Style)</h3>
                   <div className="space-y-4">
                      <div className="space-y-2">
                         <div className="flex justify-between items-center px-2">
                           <label className="text-[9px] font-black uppercase text-gray-500">Replies Weight</label>
                           <span className="text-[10px] font-black text-blue-400">x{config.engagementWeights?.replies || 5.0}</span>
                         </div>
                         <input 
                           type="range" min="1" max="10" step="0.5"
                           className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                           value={config.engagementWeights?.replies || 5.0} 
                           onChange={e => handleUpdateConfig({ engagementWeights: { ...config.engagementWeights, replies: parseFloat(e.target.value) } })} 
                         />
                         <p className="text-[8px] text-gray-500 italic px-2">Replies are the primary driver for X-style monetization.</p>
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between items-center px-2">
                           <label className="text-[9px] font-black uppercase text-gray-500">Likes Weight</label>
                           <span className="text-[10px] font-black text-blue-400">x{config.engagementWeights?.likes || 1.0}</span>
                         </div>
                         <input 
                           type="range" min="0.1" max="5" step="0.1"
                           className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                           value={config.engagementWeights?.likes || 1.0} 
                           onChange={e => handleUpdateConfig({ engagementWeights: { ...config.engagementWeights, likes: parseFloat(e.target.value) } })} 
                         />
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between items-center px-2">
                           <label className="text-[9px] font-black uppercase text-gray-500">Reposts Weight</label>
                           <span className="text-[10px] font-black text-blue-400">x{config.engagementWeights?.reposts || 2.5}</span>
                         </div>
                         <input 
                           type="range" min="0.5" max="8" step="0.5"
                           className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                           value={config.engagementWeights?.reposts || 2.5} 
                           onChange={e => handleUpdateConfig({ engagementWeights: { ...config.engagementWeights, reposts: parseFloat(e.target.value) } })} 
                         />
                      </div>
                   </div>
                   <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
                      <p className="text-[9px] text-blue-400 font-bold leading-relaxed uppercase tracking-tighter">
                        Earnings Formula: (Replies * {config.engagementWeights?.replies || 5.0}) + (Reposts * {config.engagementWeights?.reposts || 2.5}) + (Likes * {config.engagementWeights?.likes || 1.0}) * Rate
                      </p>
                   </div>
                </div>

                {/* Admin Payment Details */}
                <div className="bg-gray-900/50 p-8 rounded-[3rem] border border-gray-800 space-y-6 xl:col-span-3">
                    <h3 className="text-xl font-black text-white flex items-center gap-3"><Wallet className="w-5 h-5 text-green-500" /> Institution Payment Node (For Premium Upgrades)</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Bank Name</label>
                        <input className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white" value={config.paymentAccount.bankName} onChange={e => handleUpdateConfig({ paymentAccount: {...config.paymentAccount, bankName: e.target.value}})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Account Number</label>
                        <input className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white" value={config.paymentAccount.accountNumber} onChange={e => handleUpdateConfig({ paymentAccount: {...config.paymentAccount, accountNumber: e.target.value}})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Account Name</label>
                        <input className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white" value={config.paymentAccount.accountName} onChange={e => handleUpdateConfig({ paymentAccount: {...config.paymentAccount, accountName: e.target.value}})} />
                      </div>
                   </div>
                </div>

                {/* Card Payment Configuration */}
                <div className="bg-gray-900/50 p-8 rounded-[3rem] border border-gray-800 space-y-6 xl:col-span-3">
                   <div className="flex justify-between items-center">
                      <h3 className="text-xl font-black text-white flex items-center gap-3"><CreditCard className="w-5 h-5 text-blue-500" /> Card Payment Gateway (Paystack)</h3>
                      <button 
                        onClick={() => handleUpdateConfig({ isCardPaymentEnabled: !config.isCardPaymentEnabled })}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${config.isCardPaymentEnabled ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-500'}`}
                      >
                         {config.isCardPaymentEnabled ? 'Gateway Active' : 'Gateway Offline'}
                      </button>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Paystack Public Key</label>
                      <input 
                        className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white font-mono" 
                        placeholder="pk_live_..." 
                        value={config.paystackPublicKey || ''} 
                        onChange={e => handleUpdateConfig({ paystackPublicKey: e.target.value })} 
                      />
                      <p className="text-[9px] text-gray-500 italic ml-2">Enabling this will allow students to pay directly via card/USSD/transfer through Paystack.</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Removed: Synchronize Matrix Configuration */}

        {/* ... Rest of the existing activeTab conditions (engagement, submissions, payouts, ad-engine, academic, users, broadcast, tasks) ... */}
        {activeTab === 'engagement' && (
          <div className="space-y-10 animate-fade-in">
             <h1 className="text-4xl font-black tracking-tighter uppercase italic">Engagement Matrix</h1>
             <div className="bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                   <thead className="bg-gray-800 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      <tr><th className="p-8">Scholar Identity</th><th className="p-8">Like/Rep/Rep</th><th className="p-8">Matrix Clicks</th><th className="p-8 text-right">Node Rating</th></tr>
                   </thead>
                   <tbody className="divide-y divide-gray-800">
                      {allUsers.filter(u => u.email !== 'awololaeo.22@student.funaab.edu.ng').map(u => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                           <td className="p-8"><p className="font-black italic text-white">{u.name}</p><p className="text-[9px] text-gray-500 uppercase">@{u.nickname}</p></td>
                           <td className="p-8 font-mono text-gray-300">{(u.engagementStats?.totalLikesGiven || 0)} / {(u.engagementStats?.totalRepliesGiven || 0)} / {(u.engagementStats?.totalRepostsGiven || 0)}</td>
                           <td className="p-8 font-mono text-green-500">{(u.engagementStats?.totalLinkClicks || 0) + (u.engagementStats?.totalProfileClicks || 0)}</td>
                           <td className="p-8 text-right"><span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full font-black text-[9px] uppercase">{(u.points || 0) > 1000 ? 'Tier-Alpha' : 'Node-Standard'}</span></td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
         </div>
        )}

        {/* Removed: Synchronize Engagement Matrix */}

        {activeTab === 'submissions' && (
          <div className="space-y-10 animate-fade-in">
             <h1 className="text-4xl font-black tracking-tighter uppercase italic">Asset Verification</h1>
             <div className="bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                   <thead className="bg-gray-800 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <tr><th className="p-8">Archive Intel</th><th className="p-8">Source Node</th><th className="p-8 text-right">Command</th></tr>
                   </thead>
                   <tbody className="divide-y divide-gray-800">
                      {questions.filter(q => q.status === 'pending').map(q => (
                        <tr key={q.id} className="hover:bg-white/5 transition-colors">
                           <td className="p-8"><p className="font-black italic text-sm">{q.courseCode}</p><p className="text-[10px] text-gray-500 uppercase">{q.courseTitle}</p></td>
                           <td className="p-8 font-black uppercase tracking-tighter text-gray-400">{allUsers.find(u => u.id === q.uploadedBy)?.name || 'Anon'}</td>
                           <td className="p-8 text-right flex justify-end gap-3">
                              <button onClick={() => {
                                const link = document.createElement('a');
                                link.href = q.fileUrl;
                                link.download = `${q.courseCode}_${q.year}.pdf`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }} className="p-3 bg-blue-600/10 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all" title="Download Asset"><Download className="w-4 h-4" /></button>
                              <button onClick={() => onApproveQuestion(q.id)} className="p-3 bg-green-600/10 text-green-500 rounded-xl hover:bg-green-600 hover:text-white transition-all" title="Approve"><CheckCircle2 className="w-4 h-4" /></button>
                              <button onClick={() => onRejectQuestion(q.id)} className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all" title="Reject"><XCircle className="w-4 h-4" /></button>
                              <button onClick={() => onDeleteQuestion(q.id)} className="p-3 bg-gray-600/10 text-gray-500 rounded-xl hover:bg-gray-600 hover:text-white transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
         </div>
        )}

        {activeTab === 'payouts' && (
          <div className="space-y-10 animate-fade-in">
             <h1 className="text-4xl font-black tracking-tighter uppercase italic">Purse Flow Control</h1>
             <div className="bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                   <thead className="bg-gray-800 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <tr><th className="p-8">Scholar</th><th className="p-8">Value</th><th className="p-8">Destination</th><th className="p-8 text-right">Authorize</th></tr>
                   </thead>
                   <tbody className="divide-y divide-gray-800">
                      {withdrawalRequests.filter(r => r.status === 'pending').map(r => (
                        <tr key={r.id} className="hover:bg-white/5 transition-colors">
                           <td className="p-8 font-black italic">{r.userName}</td>
                           <td className="p-8 text-green-500 font-black">₦{r.amount.toLocaleString()}</td>
                           <td className="p-8"><p className="text-xs font-bold">{r.bankDetails.bankName}</p><p className="text-[9px] text-gray-500 font-mono">{r.bankDetails.accountNumber}</p></td>
                           <td className="p-8 text-right flex justify-end gap-3">
                              <button onClick={() => onApproveWithdrawal(r.id)} className="p-3 bg-green-600/10 text-green-500 rounded-xl hover:bg-green-600" title="Approve"><CheckCircle2 className="w-4 h-4" /></button>
                              <button onClick={() => onRejectWithdrawal(r.id)} className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600" title="Reject"><XCircle className="w-4 h-4" /></button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
         </div>
        )}

        {activeTab === 'ad-engine' && (
          <div className="space-y-12 animate-fade-in">
             <h1 className="text-4xl font-black tracking-tighter uppercase italic">Advert Engine</h1>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-gray-900 rounded-[2rem] border border-gray-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Ads</p>
                    <p className={`text-xl font-black italic ${config.isAdsEnabled ? 'text-green-500' : 'text-red-500'}`}>{config.isAdsEnabled ? 'ONLINE' : 'OFFLINE'}</p>
                  </div>
                  <button onClick={() => handleUpdateConfig({ isAdsEnabled: !config.isAdsEnabled })} className={`p-4 rounded-2xl transition-all ${config.isAdsEnabled ? 'bg-green-600/10 text-green-500' : 'bg-red-600/10 text-red-500'}`}>
                    {config.isAdsEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>
                <div className="p-6 bg-gray-900 rounded-[2rem] border border-gray-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">User Ad Portal</p>
                    <p className={`text-xl font-black italic ${config.isUserAdsEnabled ? 'text-green-500' : 'text-red-500'}`}>{config.isUserAdsEnabled ? 'OPEN' : 'LOCKED'}</p>
                  </div>
                  <button onClick={() => handleUpdateConfig({ isUserAdsEnabled: !config.isUserAdsEnabled })} className={`p-4 rounded-2xl transition-all ${config.isUserAdsEnabled ? 'bg-green-600/10 text-green-500' : 'bg-red-600/10 text-red-500'}`}>
                    {config.isUserAdsEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>
                <div className="p-6 bg-gray-900 rounded-[2rem] border border-gray-800">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Ad Pricing (Daily)</p>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-black">₦</span>
                    <input 
                      type="number" 
                      className="bg-transparent border-none outline-none text-xl font-black italic w-full"
                      value={config.adPricing.daily}
                      onChange={(e) => handleUpdateConfig({ adPricing: { ...config.adPricing, daily: parseInt(e.target.value) || 0 } })}
                    />
                  </div>
                </div>
                <div className="p-6 bg-gray-900 rounded-[2rem] border border-gray-800 flex items-center justify-center">
                  <button 
                    onClick={() => { if(confirm("Purge all active campaigns?")) globalAds.forEach(ad => onDeleteAd(ad.id)); }}
                    className="flex items-center gap-3 text-red-500 font-black uppercase text-[10px] tracking-widest hover:bg-red-500/10 px-6 py-3 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Purge All Ads
                  </button>
                </div>
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="bg-gray-900 p-8 rounded-[3rem] border border-gray-800 space-y-6">
                   <h3 className="text-xl font-black flex items-center gap-2 text-white"><Plus className="w-5 h-5 text-green-500" /> Campaign Launch</h3>
                   <form onSubmit={handleAddAdSubmit} className="space-y-6">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Identifier</label>
                        <input className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white" placeholder="Campaign Name" value={newAd.title} onChange={e => setNewAd({...newAd, title: e.target.value})} />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Ad Format</label>
                        <select className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white font-bold uppercase" value={newAd.adType} onChange={e => setNewAd({...newAd, adType: e.target.value as AdType})}>
                           <option value="native">Native (X-Style)</option>
                           <option value="banner">Banner Ad</option>
                           <option value="popup">Pop-up Ad</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Placement (X-Style)</label>
                        <select className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white font-bold uppercase" value={newAd.placement} onChange={e => setNewAd({...newAd, placement: e.target.value as AdPlacement})}>
                           <option value="timeline">Timeline</option>
                           <option value="search">Search</option>
                           <option value="post">Post (Tweet)</option>
                           <option value="profile">Profile</option>
                           <option value="video">Video</option>
                           <option value="replies">Replies</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Modality</label>
                        <div className="grid grid-cols-2 gap-2">
                           <button type="button" onClick={() => setNewAd({...newAd, mediaType: 'image'})} className={`py-3 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${newAd.mediaType === 'image' ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>Picture</button>
                           <button type="button" onClick={() => setNewAd({...newAd, mediaType: 'video'})} className={`py-3 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${newAd.mediaType === 'video' ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>Video</button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Duration: {newAd.duration}s</label>
                        <input type="range" min="5" max="60" step="1" className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-green-600" value={newAd.duration} onChange={e => setNewAd({...newAd, duration: parseInt(e.target.value)})} />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Location Node</label>
                        <select className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white font-bold uppercase" value={newAd.targetLocation} onChange={e => setNewAd({...newAd, targetLocation: e.target.value})}>
                           <option value="all">Global (All Nodes)</option>
                           {universities.map(u => <option key={u.id} value={u.acronym}>{u.name}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Campaign Life</label>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            className="w-20 bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white" 
                            value={newAd.campaignDuration} 
                            onChange={e => setNewAd({...newAd, campaignDuration: parseInt(e.target.value) || 0})} 
                          />
                          <select 
                            className="flex-grow bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white font-bold uppercase" 
                            value={newAd.campaignUnit} 
                            onChange={e => setNewAd({...newAd, campaignUnit: e.target.value as 'days' | 'weeks'})}
                          >
                            <option value="days">Days</option>
                            <option value="weeks">Weeks</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Times Per Day</label>
                        <input type="number" className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white" value={newAd.timesPerDay} onChange={e => setNewAd({...newAd, timesPerDay: parseInt(e.target.value) || 0})} />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Target Reach (People)</label>
                        <div className="flex gap-2">
                           <input type="text" className="flex-grow bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white" placeholder="e.g. 500 or all" value={newAd.targetReach} onChange={e => setNewAd({...newAd, targetReach: e.target.value === 'all' ? 'all' : (parseInt(e.target.value) || 0)})} />
                           <button type="button" onClick={() => setNewAd({...newAd, targetReach: 'all'})} className={`px-4 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${newAd.targetReach === 'all' ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>All</button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Display Windows</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['12am-6am', '6am-12pm', '12pm-6pm', '6pm-12am'] as AdTimeFrame[]).map(tf => (
                            <button
                              key={tf}
                              type="button"
                              onClick={() => {
                                const current = newAd.timeFrames || [];
                                const next = current.includes(tf) ? current.filter(t => t !== tf) : [...current, tf];
                                setNewAd({ ...newAd, timeFrames: next });
                              }}
                              className={`py-2 rounded-lg font-black text-[9px] uppercase border transition-all ${newAd.timeFrames?.includes(tf) ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                            >
                              {tf}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button type="button" onClick={() => adFileInputRef.current?.click()} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-700 transition-all text-white">
                         <Upload className="w-4 h-4" /> {newAd.mediaUrl ? 'Asset Linked' : 'Upload Content'}
                      </button>
                      <input type="file" ref={adFileInputRef} hidden accept="image/*,video/*" onChange={handleAdFileSelect} />
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Target Link</label>
                        <input className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white" placeholder="https://..." value={newAd.link} onChange={e => setNewAd({...newAd, link: e.target.value})} />
                      </div>

                      <button className="w-full bg-green-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Deploy Campaign</button>
                   </form>
                </div>
                <div className="xl:col-span-2 bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden">
                   <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                         <thead className="bg-gray-800 text-[9px] font-black text-gray-400 uppercase">
                              <tr><th className="p-8">Asset</th><th className="p-8">Metrics</th><th className="p-8">Duration</th><th className="p-8">Frequency/Reach</th><th className="p-8">Target</th><th className="p-8 text-right">Logic</th></tr>
                         </thead>
                         <tbody className="divide-y divide-gray-800">
                             {globalAds.map(ad => (
                             <tr key={ad.id} className="hover:bg-gray-800/20">
                                 <td className="p-8"><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-xl bg-gray-800 overflow-hidden border border-gray-700">{ad.type === 'image' ? <img src={ad.mediaUrl} className="w-full h-full object-cover" /> : <PlayCircle className="w-full h-full p-3 text-green-500" />}</div><div><p className="font-black italic text-sm text-white">{ad.title}</p><p className="text-[9px] font-black text-blue-400 uppercase">{ad.adType} • {ad.placement}</p></div></div></td>
                                 <td className="p-8"><p className="font-black text-xs text-white">{ad.duration}s <span className="text-gray-500 font-normal uppercase text-[9px]">Limit</span></p><p className="uppercase text-[10px] font-black text-green-500">{ad.type}</p></td>
                                 <td className="p-8"><p className="font-black text-xs text-white">{ad.campaignDuration} {ad.campaignUnit}</p></td>
                                 <td className="p-8"><p className="font-black text-xs text-white">{ad.timesPerDay || 'N/A'} / day</p><p className="text-[9px] font-black text-blue-400 uppercase">{ad.targetReach === 'all' ? 'Unlimited Reach' : `${ad.targetReach || 0} People`}</p><div className="flex flex-wrap gap-1 mt-1">{ad.timeFrames?.map(tf => <span key={tf} className="text-[8px] bg-gray-800 px-1 rounded text-gray-400">{tf}</span>)}</div></td>
                                 <td className="p-8"><div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400"><Target className="w-3 h-3" /> {ad.targetLocation}</div></td>
                                 <td className="p-8 text-right"><button onClick={() => onDeleteAd(ad.id)} className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button></td>
                             </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'ad-review' && (
          <div className="space-y-10 animate-fade-in">
             <h1 className="text-4xl font-black tracking-tighter uppercase italic">Ad Verification & Placement</h1>
             <div className="bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                   <thead className="bg-gray-800 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <tr><th className="p-8">Ad Asset</th><th className="p-8">Details</th><th className="p-8">Placement Logic</th><th className="p-8 text-right">Command</th></tr>
                   </thead>
                   <tbody className="divide-y divide-gray-800">
                      {globalAds.filter(ad => ad.status === 'pending_review').map(ad => (
                        <tr key={ad.id} className="hover:bg-white/5 transition-colors">
                           <td className="p-8">
                             <div className="flex items-center gap-4">
                               <div className="w-20 h-20 rounded-2xl bg-gray-800 overflow-hidden border border-gray-700">
                                 {ad.type === 'image' ? <img src={ad.mediaUrl} className="w-full h-full object-cover" /> : <PlayCircle className="w-full h-full p-4 text-green-500" />}
                               </div>
                               <div>
                                 <p className="font-black italic text-base text-white break-words max-w-[200px]">{ad.title}</p>
                                 <p className="text-[10px] text-blue-400 font-black uppercase">{ad.adType}</p>
                               </div>
                             </div>
                           </td>
                           <td className="p-8">
                             <div className="space-y-1">
                               <p className="text-xs font-bold text-gray-300">Duration: {ad.campaignDuration} {ad.campaignUnit}</p>
                               <p className="text-[10px] text-gray-500 uppercase">Target: {ad.targetLocation}</p>
                               <p className="text-[10px] text-gray-500 uppercase">Reach: {ad.targetReach === 'all' ? 'Global' : ad.targetReach}</p>
                             </div>
                           </td>
                           <td className="p-8">
                             <div className="space-y-4">
                               <div>
                                 <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Set Placement</label>
                                 <select 
                                   value={ad.placement} 
                                   onChange={(e) => onUpdateAd({ ...ad, placement: e.target.value as AdPlacement })}
                                   className="bg-gray-950 border border-gray-800 text-[10px] font-black uppercase px-3 py-2 rounded-xl outline-none text-white w-full focus:border-brand-proph transition-colors"
                                 >
                                   <option value="timeline">Timeline (Main Feed)</option>
                                   <option value="search">Search Results</option>
                                   <option value="post">Inside Posts</option>
                                   <option value="profile">User Profiles</option>
                                   <option value="video">Video Stream</option>
                                   <option value="replies">Post Replies</option>
                                 </select>
                               </div>
                               <div>
                                 <label className="text-[9px] font-black uppercase text-gray-500 block mb-1">Set Ad Type</label>
                                 <select 
                                   value={ad.adType} 
                                   onChange={(e) => onUpdateAd({ ...ad, adType: e.target.value as AdType })}
                                   className="bg-gray-950 border border-gray-800 text-[10px] font-black uppercase px-3 py-2 rounded-xl outline-none text-white w-full focus:border-brand-proph transition-colors"
                                 >
                                   <option value="native">Native (X-Style)</option>
                                   <option value="banner">Banner</option>
                                   <option value="popup">Pop-up</option>
                                 </select>
                               </div>
                             </div>
                           </td>
                           <td className="p-8 text-right">
                             <div className="flex justify-end gap-3">
                               <button 
                                 onClick={() => onUpdateAd({ ...ad, status: 'active' })}
                                 className="p-4 bg-green-600/10 text-green-500 rounded-2xl hover:bg-green-600 hover:text-white transition-all group relative overflow-hidden shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]"
                                 title="Approve & Deploy"
                               >
                                 <CheckCircle2 className="w-6 h-6 relative z-10" />
                                 <div className="absolute inset-0 bg-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                               </button>
                               <button 
                                 onClick={() => onUpdateAd({ ...ad, status: 'rejected' })}
                                 className="p-4 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all"
                                 title="Reject Campaign"
                               >
                                 <XCircle className="w-6 h-6" />
                               </button>
                             </div>
                           </td>
                        </tr>
                      ))}
                      {globalAds.filter(ad => ad.status === 'pending_review').length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-20 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-20">
                              <Target className="w-16 h-16" />
                              <p className="text-sm font-black uppercase tracking-widest">No Campaigns Pending Verification</p>
                            </div>
                          </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
         </div>
        )}

        {activeTab === 'academic' && (
          <div className="space-y-12 animate-fade-in">
             <h1 className="text-4xl font-black tracking-tighter uppercase italic">Institutional Matrix Map</h1>
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="bg-gray-900 p-8 rounded-[3rem] border border-gray-800 space-y-6">
                   <h3 className="text-xl font-black flex items-center gap-2 text-purple-500"><Building2 className="w-5 h-5" /> University Node</h3>
                   <div className="space-y-4">
                      <input className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white" placeholder="Institutional Name" value={newUni.name} onChange={e => setNewUni({...newUni, name: e.target.value})} />
                      <input className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm uppercase text-white" placeholder="Acronym" value={newUni.acronym} onChange={e => setNewUni({...newUni, acronym: e.target.value.toUpperCase()})} />
                      <button type="button" onClick={() => uniLogoInputRef.current?.click()} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-700 transition-all text-white">
                         {isUploadingUni ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} 
                         {isUploadingUni ? 'Syncing...' : (newUni.logo ? 'Branding Loaded' : 'Upload Signature Logo')}
                      </button>
                      <input type="file" ref={uniLogoInputRef} hidden accept="image/*" onChange={(e) => handleUniLogoSelect(e)} />
                      <button onClick={() => { onAddUniversity({ id: newUni.acronym.toLowerCase(), name: newUni.name, acronym: newUni.acronym, location: 'Nigeria', logo: newUni.logo || 'https://picsum.photos/seed/node/200' }); setNewUni({name: '', acronym: '', location: '', logo: ''}); }} className="w-full bg-purple-600 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl text-white">Deploy Node</button>
                   </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
                      {universities.map(u => (
                        <div key={u.id} className="flex items-center justify-between p-3 bg-gray-950 rounded-xl group border border-transparent hover:border-gray-800 transition-all">
                           <div className="flex items-center gap-3">
                             <div className="relative group/logo">
                               <img src={u.logo} className="w-8 h-8 rounded-lg object-contain bg-white/5" />
                               <button 
                                 disabled={isUploadingUni}
                                 onClick={() => {
                                   const input = document.createElement('input');
                                   input.type = 'file';
                                   input.accept = 'image/*';
                                   input.onchange = (e: any) => handleUniLogoSelect(e, u.id);
                                   input.click();
                                 }}
                                 className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center rounded-lg disabled:opacity-50"
                               >
                                 {isUploadingUni ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <ImageIcon className="w-4 h-4 text-white" />}
                               </button>
                             </div>
                             <span className="font-black text-xs italic text-gray-300">{u.acronym}</span>
                           </div>
                           <button onClick={() => onRemoveUniversity(u.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Remove"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-gray-900 p-8 rounded-[3rem] border border-gray-800 space-y-6">
                   <h3 className="text-xl font-black flex items-center gap-2 text-blue-500"><Layers className="w-5 h-5" /> Academic Faculty</h3>
                   <div className="space-y-4">
                      <select className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-xs uppercase font-black text-white" value={selectedUniForCollege} onChange={e => setSelectedUniForCollege(e.target.value)}>
                         <option value="">Select Target University</option>
                         {universities.map(u => <option key={u.id} value={u.id}>{u.acronym}</option>)}
                      </select>
                      <textarea className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white min-h-[100px] resize-none" placeholder="Enter faculties (comma separated)..." value={newCollegeNames} onChange={e => setNewCollegeNames(e.target.value)} />
                      <button onClick={() => { 
                        newCollegeNames.split(',').forEach(n => onAddCollege(selectedUniForCollege, n.trim())); 
                        setNewCollegeNames(''); 
                      }} className="w-full bg-blue-600 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl text-white">Bulk Sync Units</button>
                   </div>
                </div>

                <div className="bg-gray-900 p-8 rounded-[3rem] border border-gray-800 space-y-6">
                   <h3 className="text-xl font-black flex items-center gap-2 text-green-500"><BookOpen className="w-5 h-5" /> Sub-Department</h3>
                   <div className="space-y-4">
                      <select className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-xs font-black text-white" value={selectedCollegeForDept} onChange={e => setSelectedCollegeForDept(e.target.value)}>
                         <option value="">Select Faculty</option>
                         {Object.values(universityColleges).flat().map((c, i) => <option key={i} value={c}>{c}</option>)}
                      </select>
                      <textarea className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white min-h-[100px] resize-none" placeholder="Enter depts (comma separated)..." value={newDeptNames} onChange={e => setNewDeptNames(e.target.value)} />
                      <button onClick={() => {
                        newDeptNames.split(',').forEach(n => onAddDept(selectedCollegeForDept, n.trim()));
                        setNewDeptNames('');
                      }} className="w-full bg-green-600 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl text-white">Bulk Append Links</button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-12 animate-fade-in">
             <h1 className="text-4xl font-black tracking-tighter uppercase italic">Identity Matrix</h1>
             <div className="bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                   <thead className="bg-gray-800 text-[10px] font-black text-gray-400 uppercase">
                      <tr><th className="p-8">Scholar Identity</th><th className="p-8">Email Node</th><th className="p-8">Role Assignment</th><th className="p-8 text-right">Command</th></tr>
                   </thead>
                   <tbody className="divide-y divide-gray-800">
                      {allUsers.filter(u => u.email !== 'awololaeo.22@student.funaab.edu.ng').map(u => (
                        <tr key={u.id} className="hover:bg-gray-800/30 transition-all">
                           <td className="p-8"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-gray-800 rounded-full border border-gray-700 flex items-center justify-center font-black italic text-white">{u.name.charAt(0)}</div><div><p className="font-black italic text-base text-white">{u.name}</p><p className="text-[10px] text-green-500 font-black">@{u.nickname}</p></div></div></td>
                           <td className="p-8 font-mono text-[10px] text-gray-400">{u.email || 'N/A'}</td>
                           <td className="p-8"><select value={u.role} onChange={(e) => onUpdateUsers(allUsers.map(usr => usr.id === u.id ? { ...usr, role: e.target.value as any } : usr))} className="bg-gray-950 border border-gray-800 text-[10px] font-black uppercase px-4 py-2 rounded-xl outline-none text-white">{['student', 'moderator', 'sub-admin', 'admin', 'staff'].map(r => <option key={r} value={r}>{r}</option>)}</select></td>
                           <td className="p-8 text-right">
                             {u.role === 'staff' && (
                               <button 
                                 onClick={() => {
                                   const currentPerms = u.staffPermissions || [];
                                   const hasAccess = currentPerms.includes('all');
                                   const newPerms = hasAccess ? [] : ['all'];
                                   onUpdateUsers(allUsers.map(usr => usr.id === u.id ? { ...usr, staffPermissions: newPerms } : usr));
                                 }}
                                 className={`p-3 mr-2 rounded-xl transition-all ${u.staffPermissions?.includes('all') ? 'bg-green-600/10 text-green-500' : 'bg-yellow-600/10 text-yellow-500'}`}
                                 title={u.staffPermissions?.includes('all') ? 'Restrict Access' : 'Grant Access'}
                               >
                                 <Shield className="w-5 h-5" />
                               </button>
                             )}
                             <button onClick={() => {
                               if (u.email === 'awololaeo.22@student.funaab.edu.ng') {
                                 alert("Security Protocol: Main Admin account cannot be terminated.");
                                 return;
                               }
                               onDeleteUser(u.id);
                             }} className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
         </div>
        )}

        {activeTab === 'broadcast' && (
          <div className="space-y-12 animate-fade-in max-w-4xl">
             <div className="flex items-center justify-between">
               <h1 className="text-4xl font-black tracking-tighter uppercase italic">Global Signals</h1>
               <div className="flex items-center gap-4">
                 <button 
                   onClick={() => handleUpdateConfig({ 
                     globalAnnouncement: { 
                       ...(config.globalAnnouncement || { text: '', type: 'info', isEnabled: false }), 
                       isEnabled: !config.globalAnnouncement?.isEnabled 
                     } 
                   })}
                   className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${config.globalAnnouncement?.isEnabled ? 'bg-brand-proph text-black' : 'bg-gray-800 text-gray-500'}`}
                 >
                   {config.globalAnnouncement?.isEnabled ? 'Announcement Active' : 'Announcement Offline'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
               <div className="bg-gray-900 p-10 rounded-[3rem] border border-gray-800 space-y-6 shadow-2xl">
                  <h3 className="text-xl font-black text-white flex items-center gap-3"><Megaphone className="w-5 h-5 text-brand-proph" /> Global Banner</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Banner Text</label>
                      <input 
                        className="w-full bg-gray-950 border border-gray-800 p-5 rounded-2xl outline-none text-white font-bold" 
                        placeholder="Global announcement text..." 
                        value={config.globalAnnouncement?.text || ''} 
                        onChange={e => handleUpdateConfig({ 
                          globalAnnouncement: { 
                            ...(config.globalAnnouncement || { isEnabled: false, type: 'info' }), 
                            text: e.target.value 
                          } 
                        })} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Banner Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['info', 'warning', 'success', 'error'] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => handleUpdateConfig({ 
                              globalAnnouncement: { 
                                ...(config.globalAnnouncement || { text: '', isEnabled: false }), 
                                type 
                              } 
                            })}
                            className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                              config.globalAnnouncement?.type === type 
                                ? 'border-brand-proph bg-brand-proph/10 text-brand-proph' 
                                : 'border-gray-800 bg-gray-950 text-gray-500 hover:border-gray-700'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
               </div>

               <div className="bg-gray-900 p-10 rounded-[3rem] border border-gray-800 space-y-6 shadow-2xl">
                  <h3 className="text-xl font-black text-white flex items-center gap-3"><Send className="w-5 h-5 text-red-500" /> Pulse Broadcast</h3>
                  <div className="space-y-4">
                    <input className="w-full bg-gray-950 border border-gray-800 p-5 rounded-2xl outline-none text-white font-bold" placeholder="Signal Header" value={broadcast.title} onChange={e => setBroadcast({...broadcast, title: e.target.value})} />
                    <textarea rows={4} className="w-full bg-gray-950 border border-gray-800 p-5 rounded-[2rem] outline-none text-white font-medium resize-none" placeholder="Compose signal message..." value={broadcast.content} onChange={e => setBroadcast({...broadcast, content: e.target.value})} />
                    <button onClick={transmitSignal} className="w-full bg-red-600 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3"><Send className="w-4 h-4" /> Broadcast Pulse</button>
                  </div>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-12 animate-fade-in">
             <h1 className="text-4xl font-black tracking-tighter uppercase italic">Bounty Forge</h1>
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-gray-900 p-10 rounded-[3rem] border border-gray-800 space-y-6 shadow-2xl">
                   <input className="w-full bg-gray-950 border border-gray-800 p-5 rounded-2xl text-white" placeholder="Bounty Identity" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                   <input type="number" className="w-full bg-gray-950 border border-gray-800 p-5 rounded-2xl text-white" placeholder="Points" value={newTask.points} onChange={e => setNewTask({...newTask, points: parseInt(e.target.value) || 0})} />
                   <input className="w-full bg-gray-950 border border-gray-800 p-5 rounded-2xl text-white" placeholder="Bounty Link" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} />
                   <input className="w-full bg-gray-950 border border-gray-800 p-5 rounded-2xl text-white" placeholder="Verification Task" value={newTask.question} onChange={e => setNewTask({...newTask, question: e.target.value})} />
                   <button onClick={deployTask} className="w-full bg-yellow-600 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3"><Zap className="w-4 h-4" /> Deploy Bounty</button>
                </div>
                <div className="bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl overflow-y-auto no-scrollbar">
                   <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-gray-800 text-[10px] font-black text-gray-400 uppercase">
                          <tr><th className="p-8">Active Bounty</th><th className="p-8 text-right">Logic</th></tr>
                       </thead>
                      <tbody className="divide-y divide-gray-800">
                         {tasks.map(t => (
                           <tr key={t.id} className="hover:bg-gray-800/20"><td className="p-8"><p className="font-black italic text-sm text-white">{t.title}</p><p className="text-[9px] text-gray-500 font-mono">{t.points} PT</p></td><td className="p-8 text-right"><button onClick={() => onDeleteTask(t.id)} className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button></td></tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
         </div>
        )}

        {activeTab === 'algorithms' && (
          <div className="space-y-12 animate-fade-in">
             <h1 className="text-4xl font-black tracking-tighter uppercase italic">Algorithm Logic Matrix</h1>
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Proph Feed Algorithms */}
                <div className="bg-gray-900/50 p-8 rounded-[3rem] border border-gray-800 space-y-6">
                   <h3 className="text-xl font-black text-white flex items-center gap-3"><Tv className="w-5 h-5 text-blue-500" /> Feed Weights</h3>
                   <div className="space-y-4">
                      {Object.entries(config.feedWeights).map(([key, val]) => (
                        <div key={key} className="space-y-2">
                           <div className="flex justify-between items-center px-2">
                             <label className="text-[9px] font-black uppercase text-gray-500">{key}</label>
                             <span className="text-[10px] font-black text-blue-400">{((val as number) * 100).toFixed(0)}%</span>
                           </div>
                           <input 
                            type="range" min="0" max="1" step="0.05"
                            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                            value={val as number} 
                            onChange={e => handleUpdateConfig({ feedWeights: { ...config.feedWeights, [key]: parseFloat(e.target.value) } })} 
                           />
                        </div>
                      ))}
                   </div>
                </div>

                {/* Advert Algorithms */}
                <div className="bg-gray-900/50 p-8 rounded-[3rem] border border-gray-800 space-y-6">
                   <h3 className="text-xl font-black text-white flex items-center gap-3"><Megaphone className="w-5 h-5 text-red-500" /> Ad Weights</h3>
                   <div className="space-y-4">
                      {Object.entries(config.adWeights).map(([key, val]) => (
                        <div key={key} className="space-y-2">
                           <div className="flex justify-between items-center px-2">
                             <label className="text-[9px] font-black uppercase text-gray-500">{key}</label>
                             <span className="text-[10px] font-black text-red-400">{((val as number) * 100).toFixed(0)}%</span>
                           </div>
                           <input 
                            type="range" min="0" max="1" step="0.05"
                            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600" 
                            value={val as number} 
                            onChange={e => handleUpdateConfig({ adWeights: { ...config.adWeights, [key]: parseFloat(e.target.value) } })} 
                           />
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="bg-gray-900/50 p-8 rounded-[3rem] border border-gray-800 space-y-6">
                <h3 className="text-xl font-black text-white flex items-center gap-3"><DollarSign className="w-5 h-5 text-green-500" /> Earning Rates (₦)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {Object.entries(config.earnRates).map(([key, val]) => (
                     <div key={key} className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</label>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 font-black">₦</span>
                          <input 
                            type="number" step="0.01"
                            className="bg-transparent border-none outline-none text-xl font-black italic w-full text-white"
                            value={val}
                            onChange={(e) => handleUpdateConfig({ earnRates: { ...config.earnRates, [key]: parseFloat(e.target.value) || 0 } })}
                          />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             
             <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                   <p className="text-sm font-black uppercase tracking-widest text-blue-400 mb-2">Algorithm Calibration</p>
                   <p className="text-xs text-gray-400 leading-relaxed">Adjusting these weights directly impacts the content distribution matrix. High engagement weights prioritize viral content, while high recency weights prioritize real-time updates. Ensure total weights for each section approximate 1.0 for balanced distribution.</p>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'sug' && (
          <div className="space-y-12 animate-fade-in">
             <h1 className="text-4xl font-black tracking-tighter uppercase italic">SUG Premium Verification</h1>
             <div className="bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                   <thead className="bg-gray-800 text-[10px] font-black text-gray-400 uppercase">
                      <tr><th className="p-8">SUG Account</th><th className="p-8">University</th><th className="p-8">Status</th><th className="p-8 text-right">Command</th></tr>
                   </thead>
                   <tbody className="divide-y divide-gray-800">
                      {allUsers.filter(u => u.nickname.toLowerCase().includes('sug')).map(u => (
                        <tr key={u.id} className="hover:bg-gray-800/30 transition-all">
                           <td className="p-8"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-gray-800 rounded-full border border-gray-700 flex items-center justify-center font-black italic text-white">{u.name.charAt(0)}</div><div><p className="font-black italic text-base text-white">{u.name}</p><p className="text-[10px] text-green-500 font-black">@{u.nickname}</p></div></div></td>
                           <td className="p-8 font-black uppercase text-gray-400">{u.university}</td>
                           <td className="p-8">
                             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${u.isSugVerified ? 'bg-green-600/10 text-green-500' : 'bg-yellow-600/10 text-yellow-500'}`}>
                               {u.isSugVerified ? 'Verified' : 'Pending'}
                             </span>
                           </td>
                           <td className="p-8 text-right">
                             <button 
                               onClick={() => onUpdateUsers(allUsers.map(usr => usr.id === u.id ? { ...usr, isSugVerified: !u.isSugVerified, isPremium: !u.isSugVerified } : usr))}
                               className={`p-3 rounded-xl transition-all ${u.isSugVerified ? 'bg-red-600/10 text-red-500' : 'bg-green-600/10 text-green-500'}`}
                             >
                               {u.isSugVerified ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                             </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
         </div>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-12 animate-fade-in">
             <h1 className="text-4xl font-black tracking-tighter uppercase italic">Staff Matrix</h1>
             <div className="bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                   <thead className="bg-gray-800 text-[10px] font-black text-gray-400 uppercase">
                      <tr><th className="p-8">Staff Node</th><th className="p-8">Role</th><th className="p-8">Permissions</th><th className="p-8 text-right">Command</th></tr>
                   </thead>
                   <tbody className="divide-y divide-gray-800">
                      {allUsers.filter(u => u.role === 'staff' || u.role === 'admin' || u.role === 'sub-admin').map(u => (
                        <tr key={u.id} className="hover:bg-gray-800/30 transition-all">
                           <td className="p-8">
                             <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-gray-800 rounded-full border border-gray-700 flex items-center justify-center font-black italic text-white">
                                 {u.name.charAt(0)}
                               </div>
                               <div>
                                 <p className="font-black italic text-base text-white">{u.name}</p>
                                 <p className="text-[10px] text-blue-500 font-black">@{u.nickname}</p>
                               </div>
                             </div>
                           </td>
                           <td className="p-8">
                             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${u.role === 'admin' ? 'bg-red-600/10 text-red-500' : 'bg-blue-600/10 text-blue-500'}`}>
                               {u.role}
                             </span>
                           </td>
                           <td className="p-8">
                             <div className="flex flex-wrap gap-2">
                               {['command', 'financials', 'engagement', 'submissions', 'payouts', 'ad-engine', 'academic', 'users', 'broadcast', 'tasks', 'algorithms', 'branding', 'sug'].map(page => (
                                 <button
                                   key={page}
                                   onClick={() => {
                                     if (u.role === 'admin' && u.email === 'awololaeo.22@student.funaab.edu.ng') return;
                                     const currentPerms = u.staffPermissions || [];
                                     const newPerms = currentPerms.includes(page)
                                       ? currentPerms.filter(p => p !== page)
                                       : [...currentPerms, page];
                                     onUpdateUsers(allUsers.map(usr => usr.id === u.id ? { ...usr, staffPermissions: newPerms } : usr));
                                   }}
                                   className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${
                                     (u.staffPermissions || []).includes(page)
                                       ? 'bg-brand-proph text-black'
                                       : 'bg-gray-800 text-gray-400 hover:text-white'
                                   }`}
                                 >
                                   {page}
                                 </button>
                               ))}
                             </div>
                           </td>
                           <td className="p-8 text-right">
                             <button 
                               onClick={() => {
                                 const newRole = u.role === 'admin' ? 'staff' : 'admin';
                                 onUpdateUsers(allUsers.map(usr => usr.id === u.id ? { ...usr, role: newRole } : usr));
                               }}
                               className="p-3 bg-gray-800 text-gray-400 rounded-xl hover:bg-white/10 transition-all"
                               title="Toggle Admin Status"
                             >
                               <Shield className="w-5 h-5" />
                             </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
         </div>
        )}

        {activeTab === 'chat-monitor' && (
          <div className="space-y-12 animate-fade-in">
             <h1 className="text-4xl font-black tracking-tighter uppercase italic">Chat Matrix Monitor</h1>
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-[700px]">
                {/* Conversations List */}
                <div className="bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl flex flex-col">
                   <div className="p-8 border-b border-gray-800 bg-gray-800/50">
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Active Nodes</h3>
                   </div>
                   <div className="flex-1 overflow-y-auto no-scrollbar">
                      <button 
                        onClick={() => setSelectedConversation({ id: 'global', title: 'Global Matrix' })}
                        className={`w-full p-8 text-left border-b border-gray-800/50 transition-all hover:bg-gray-800/30 ${selectedConversation?.id === 'global' ? 'bg-gray-800/50 border-l-4 border-red-600' : ''}`}
                      >
                         <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 bg-red-600/10 rounded-xl flex items-center justify-center border border-red-600/20">
                               <Globe className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                               <p className="text-xs font-black text-white italic uppercase tracking-tighter">Global Academic Stream</p>
                               <p className="text-[9px] text-gray-500 font-mono uppercase">All Nodes Connected</p>
                            </div>
                         </div>
                         <p className="text-[11px] text-gray-400 line-clamp-1 font-medium italic">Monitoring public broadcast signals...</p>
                      </button>
                      {conversations.length === 0 ? (
                        <div className="p-12 text-center text-gray-600 font-black italic uppercase text-xs">No active nodes detected</div>
                      ) : (
                        conversations.map(conv => (
                          <button 
                            key={conv.id} 
                            onClick={() => setSelectedConversation(conv)}
                            className={`w-full p-8 text-left border-b border-gray-800/50 transition-all hover:bg-gray-800/30 ${selectedConversation?.id === conv.id ? 'bg-gray-800/50 border-l-4 border-red-600' : ''}`}
                          >
                             <div className="flex items-center gap-4 mb-3">
                                <div className="flex -space-x-3">
                                   <img src={conv.user1?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.user1?.username}`} className="w-10 h-10 rounded-xl border-2 border-gray-900" alt="" />
                                   <img src={conv.user2?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.user2?.username}`} className="w-10 h-10 rounded-xl border-2 border-gray-900" alt="" />
                                </div>
                                <div>
                                   <p className="text-xs font-black text-white italic">@{conv.user1?.username} + @{conv.user2?.username}</p>
                                   <p className="text-[9px] text-gray-500 font-mono">{new Date(conv.last_message_time).toLocaleString()}</p>
                                </div>
                             </div>
                             <p className="text-[11px] text-gray-400 line-clamp-1 font-medium">{conv.last_message}</p>
                          </button>
                        ))
                      )}
                   </div>
                </div>

                {/* Messages View */}
                <div className="xl:col-span-2 bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl flex flex-col">
                   {selectedConversation ? (
                     <>
                        <div className="p-8 border-b border-gray-800 bg-gray-800/50 flex justify-between items-center">
                           <div>
                              <h3 className="text-xs font-black uppercase tracking-widest text-white">
                                {selectedConversation.id === 'global' ? 'Global Stream Log' : `Signal Log: ${selectedConversation.user1?.username} / ${selectedConversation.user2?.username}`}
                              </h3>
                              <p className="text-[9px] text-gray-500 font-mono uppercase mt-1">Encrypted Stream Monitoring Active</p>
                           </div>
                           <button onClick={() => setSelectedConversation(null)} className="p-2 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                           {loadingMessages ? (
                             <div className="h-full flex items-center justify-center">
                                <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
                             </div>
                           ) : messages.length === 0 ? (
                             <div className="h-full flex items-center justify-center text-gray-600 font-black italic uppercase text-xs">No signals captured in this node</div>
                           ) : (
                             messages.map(msg => {
                               const sender = selectedConversation.id === 'global' 
                                 ? msg.sender 
                                 : (msg.sender_id === selectedConversation.user1_id ? selectedConversation.user1 : selectedConversation.user2);
                               const isUser1 = selectedConversation.id === 'global' ? true : msg.sender_id === selectedConversation.user1_id;
                               return (
                                 <div key={msg.id} className={`flex gap-4 ${isUser1 ? '' : 'flex-row-reverse'}`}>
                                    <img src={sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sender?.username}`} className="w-10 h-10 rounded-xl flex-shrink-0" alt="" />
                                    <div className={`max-w-[80%] space-y-1 ${isUser1 ? '' : 'items-end flex flex-col'}`}>
                                       {selectedConversation.id === 'global' && (
                                         <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1">@{sender?.username || 'Unknown Node'}</p>
                                       )}
                                       <div className={`p-4 rounded-2xl text-xs font-medium ${isUser1 ? 'bg-gray-800 text-white rounded-tl-none' : 'bg-red-600 text-white rounded-tr-none'}`}>
                                          {msg.content}
                                       </div>
                                       <p className="text-[9px] text-gray-500 font-mono">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                                    </div>
                                 </div>
                               );
                             })
                           )}
                        </div>
                     </>
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                        <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
                           <MessageSquare className="w-10 h-10 text-gray-600" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Select a Node</h3>
                           <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto mt-2">Select an active conversation node from the matrix to monitor real-time signal logs.</p>
                        </div>
                     </div>
                   )}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <AdminBranding 
            onUpdateLogo={onUpdateLogo} 
            onUpdateIcon={onUpdateIcon} 
          />
        )}
      </main>
      <button onClick={() => setIsMobileNavOpen(!isMobileNavOpen)} className="lg:hidden fixed bottom-6 right-6 p-4 bg-red-600 text-white rounded-full shadow-2xl z-[100] active:scale-95">
        {isMobileNavOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
      </button>
    </div>
  );
};

export default AdminDashboard;
