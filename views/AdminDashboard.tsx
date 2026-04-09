
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminBranding from './AdminBranding';
import AdminAdVerification from './AdminAdVerification';
import AdminLiveMonitor from '../src/components/AdminLiveMonitor';
import { 
  Cpu, Database, Megaphone, Users, List, 
  Settings2, Activity, ToggleRight, ToggleLeft, Trash2, 
  Plus, CheckCircle2, XCircle, Send, Shield, DollarSign, 
  Zap, Building2, BookOpen, Layers, PlusCircle, X, 
  PlayCircle, Monitor, Upload, Clock, CreditCard,
  FileCheck, AlertCircle, ChevronRight, Menu, Image as ImageIcon,
  Star, BarChart3, Target, Wallet, Coins,
  Palette, Download, Tv, Award, ShieldCheck, MessageSquare, RefreshCw, Globe, Loader2
} from 'lucide-react';
import { CloudinaryService } from '../src/services/cloudinaryService';
import { User, PastQuestion, WithdrawalRequest, SystemConfig, EarnTask, Notification, University, Advertisement, AdTimeFrame, AdType, AdPlacement, PaymentVerification } from '../types';
import { SupabaseService } from '../src/services/supabaseService';

import { useAlgorithmSettings, useRealtimeLeaderboard } from '../src/hooks/useRealtimeRanking';
import { supabase } from '../src/lib/supabase';

import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
  PieChart, Pie
} from 'recharts';

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
  onArchiveQuestion: (id: string, reason: string) => void;
  onApproveWithdrawal: (id: string) => void;
  onRejectWithdrawal: (id: string) => void;
  globalAds: Advertisement[];
  onAddAd: (ad: Advertisement) => void;
  onDeleteAd: (id: string) => void;
  onUpdateUniversity: (uniId: string, updates: Partial<University>) => void;
  onUpdateAd: (ad: Advertisement) => void;
  onUpdateLogo: (logoUrl: string) => void;
  onUpdateIcon: (iconUrl: string) => void;
  onUpdateSplashScreen: (url: string) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, config, allUsers, questions, withdrawalRequests, 
  tasks, onUpdateConfig, onUpdateUsers, 
  onDeleteQuestion, onDeleteTask, onDeleteUser, onAddTask, onBroadcast,
  universities, universityColleges, collegeDepartments,
  onAddUniversity, onRemoveUniversity, onAddCollege, onRemoveCollege, onAddDept, onRemoveDept,
  onApproveQuestion, onRejectQuestion, onArchiveQuestion, onApproveWithdrawal, onRejectWithdrawal,
  globalAds, onAddAd, onDeleteAd, onUpdateAd, onUpdateUniversity, onUpdateLogo, onUpdateIcon, onUpdateSplashScreen, onLogout
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('command');
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [archiveIntel, setArchiveIntel] = useState<any[]>([]);
  const [loadingArchive, setLoadingArchive] = useState(false);
  
  const [broadcast, setBroadcast] = useState({ title: '', content: '', type: 'info' as Notification['type'] });
  const [newTask, setNewTask] = useState({ title: '', link: '', points: 50, question: '' });
  const [newAd, setNewAd] = useState({ 
    title: '', 
    mediaUrl: '', 
    mediaType: 'image' as 'image' | 'video', 
    adTypes: ['popup'] as AdType[],
    placements: ['timeline'] as AdPlacement[],
    link: '', 
    duration: 15, 
    targetLocation: 'all',
    campaignDuration: 7,
    campaignUnit: 'days' as 'days' | 'weeks',
    timesPerDay: 5,
    targetReach: 'all' as number | 'all',
    timeFrames: [] as AdTimeFrame[],
    isSponsored: true
  });
  const [newUni, setNewUni] = useState({ name: '', acronym: '', location: '', logo: '' });
  const [selectedUniForCollege, setSelectedUniForCollege] = useState('');
  const [newCollegeNames, setNewCollegeNames] = useState('');
  const [selectedCollegeForDept, setSelectedCollegeForDept] = useState('');
  const [newDeptNames, setNewDeptNames] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const adFileInputRef = useRef<HTMLInputElement>(null);
  const uniLogoInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (activeTab === 'chat-monitor') {
      const fetchConversations = async () => {
        const data = await SupabaseService.getAllConversations();
        setConversations(data);
      };
      fetchConversations();

      // Subscribe to real-time updates for conversations
      const sub = SupabaseService.subscribeToTable('conversations', (payload) => {
        if (payload.eventType === 'INSERT') {
          setConversations(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setConversations(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
        } else if (payload.eventType === 'DELETE') {
          setConversations(prev => prev.filter(c => c.id === payload.old.id));
        }
      });

      return () => {
        sub.unsubscribe();
      };
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

      // Subscribe to real-time updates for messages in this conversation
      const sub = SupabaseService.subscribeToTable('messages', (payload) => {
        if (payload.eventType === 'INSERT') {
          const msg = payload.new;
          if (selectedConversation.id === 'global') {
            if (!msg.receiver_id) {
              setMessages(prev => [...prev, msg]);
            }
          } else {
            const isPart = (msg.sender_id === selectedConversation.user1_id && msg.receiver_id === selectedConversation.user2_id) ||
                           (msg.sender_id === selectedConversation.user2_id && msg.receiver_id === selectedConversation.user1_id);
            if (isPart) {
              setMessages(prev => [...prev, msg]);
            }
          }
        }
      });

      return () => {
        sub.unsubscribe();
      };
    }
  }, [selectedConversation]);

  React.useEffect(() => {
    if (activeTab === 'reports') {
      const fetchReports = async () => {
        setLoadingReports(true);
        const data = await SupabaseService.getReports();
        setReports(data);
        setLoadingReports(false);
      };
      fetchReports();

      const sub = SupabaseService.subscribeToTable('reports', (payload) => {
        if (payload.eventType === 'INSERT') {
          setReports(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setReports(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
        }
      });

      return () => {
        sub.unsubscribe();
      };
    }
  }, [activeTab]);

  React.useEffect(() => {
    if (activeTab === 'archive-intel') {
      const fetchArchive = async () => {
        setLoadingArchive(true);
        const data = await SupabaseService.getArchiveIntel();
        setArchiveIntel(data);
        setLoadingArchive(false);
      };
      fetchArchive();

      const sub = SupabaseService.subscribeToTable('archive_intel', (payload) => {
        if (payload.eventType === 'INSERT') {
          setArchiveIntel(prev => [payload.new, ...prev]);
        }
      });

      return () => {
        sub.unsubscribe();
      };
    }
  }, [activeTab]);

  const handleUpdateConfig = async (updates: Partial<SystemConfig>) => {
    const newConfig = { ...config, ...updates };
    onUpdateConfig(newConfig);
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
      adTypes: newAd.adTypes,
      placements: newAd.placements,
      mediaUrl: newAd.mediaUrl, 
      duration: newAd.duration, 
      link: newAd.link, 
      targetLocation: newAd.targetLocation,
      campaignDuration: newAd.campaignDuration,
      campaignUnit: newAd.campaignUnit,
      timesPerDay: newAd.timesPerDay,
      targetReach: newAd.targetReach,
      timeFrames: newAd.timeFrames,
      isSponsored: newAd.isSponsored
    });
    setNewAd({ 
      title: '', 
      mediaUrl: '', 
      mediaType: 'image', 
      adTypes: ['native'],
      placements: ['timeline'],
      link: '', 
      duration: 15, 
      targetLocation: 'all',
      campaignDuration: 7,
      campaignUnit: 'days',
      timesPerDay: 5,
      targetReach: 'all',
      timeFrames: [],
      isSponsored: true
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

  const { settings: postSettings, loading: loadingPostSettings } = useAlgorithmSettings('post_ranking');
  const { settings: adSettings, loading: loadingAdSettings } = useAlgorithmSettings('ad_delivery');
  const { leaderboard, loading: loadingLeaderboard } = useRealtimeLeaderboard();

  const updateAlgorithmWeights = async (id: string, weights: any) => {
    try {
      await SupabaseService.updateAlgorithmWeights(weights);
      alert(`${id.replace('_', ' ')} weights updated successfully.`);
    } catch (err: any) {
      console.error('Error updating weights:', err);
      alert(`Failed to update weights: ${err.message}`);
    }
  };

  const [paymentVerifications, setPaymentVerifications] = useState<PaymentVerification[]>([]);
  const [loadingFinancials, setLoadingFinancials] = useState(false);

  React.useEffect(() => {
    if (activeTab === 'revenue' || activeTab === 'financials') {
      const fetchFinancials = async () => {
        setLoadingFinancials(true);
        const data = await SupabaseService.getPaymentVerifications();
        setPaymentVerifications(data);
        setLoadingFinancials(false);
      };
      fetchFinancials();
    }
  }, [activeTab]);

  const tabs = [
    { id: 'command', label: 'Dashboard', icon: <Cpu className="w-5 h-5" /> },
    { id: 'financials', label: 'Finances', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'engagement-rating', label: 'User Ratings', icon: <Award className="w-5 h-5" /> },
    { id: 'revenue', label: 'Revenue Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'engagement', label: 'Engagement', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'submissions', label: 'Question Review', icon: <FileCheck className="w-5 h-5" /> },
    { id: 'archive-intel', label: 'Archive Intel', icon: <Database className="w-5 h-5" /> },
    { id: 'payouts', label: 'Withdrawals', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'ad-engine', label: 'Ad Management', icon: <Monitor className="w-5 h-5" /> },
    { id: 'ad-review', label: 'Ad Verification', icon: <Target className="w-5 h-5" /> },
    { id: 'academic', label: 'Universities', icon: <Building2 className="w-5 h-5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { id: 'broadcast', label: 'Announcements', icon: <Megaphone className="w-5 h-5" /> },
    { id: 'tasks', label: 'Tasks', icon: <Zap className="w-5 h-5" /> },
    { id: 'algorithms', label: 'Algorithms', icon: <Activity className="w-5 h-5" /> },
    { id: 'branding', label: 'Branding', icon: <Palette className="w-5 h-5" /> },
    { id: 'sug', label: 'SUG Verification', icon: <Award className="w-5 h-5" /> },
    { id: 'staff', label: 'Staff Management', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'chat-monitor', label: 'Chat Monitor', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'reports', label: 'Security Reports', icon: <AlertCircle className="w-5 h-5" /> },
    { id: 'vercel-sql', label: 'Database SQL', icon: <Globe className="w-5 h-5" />, isLink: true, path: '/vercel-sql' },
    { id: 'payments', label: 'Payment Verification', icon: <FileCheck className="w-5 h-5" />, isLink: true, path: '/Epaphrastheadminofprophandloveforx/payments' },
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
             <h1 className="text-4xl font-black tracking-tighter uppercase italic">Admin Dashboard</h1>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 space-y-4">
                   <div className="flex justify-between items-start">
                      <div className="p-3 bg-red-600/10 rounded-2xl text-red-500"><Shield className="w-6 h-6" /></div>
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active</span>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">System Security</p>
                      <p className="text-2xl font-black text-white italic">SECURE</p>
                      <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase italic">Protection: Enabled</p>
                   </div>
                </div>
                <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 space-y-4">
                   <div className="flex justify-between items-start">
                      <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500"><Activity className="w-6 h-6" /></div>
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Stable</span>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Network Speed</p>
                      <p className="text-2xl font-black text-white italic">14.2 GB/s</p>
                      <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase italic">Latency: 12ms</p>
                   </div>
                </div>
                <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 space-y-4">
                   <div className="flex justify-between items-start">
                      <div className="p-3 bg-yellow-600/10 rounded-2xl text-yellow-500"><Users className="w-6 h-6" /></div>
                      <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Online</span>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Users</p>
                      <p className="text-2xl font-black text-white italic">{allUsers.length}</p>
                      <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase italic">Real-time Users</p>
                   </div>
                </div>
                <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 space-y-4">
                   <div className="flex justify-between items-start">
                      <div className="p-3 bg-green-600/10 rounded-2xl text-green-500"><DollarSign className="w-6 h-6" /></div>
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Live</span>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Daily Revenue</p>
                      <p className="text-2xl font-black text-white italic">₦420.5K</p>
                      <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase italic">Payouts: ₦12.4K</p>
                   </div>
                </div>
             </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-900/50 p-8 rounded-[3rem] border border-gray-800 space-y-6">
                      <h3 className="text-xl font-black text-white flex items-center gap-3"><Settings2 className="w-5 h-5 text-red-500" /> System Features</h3>
                      <div className="space-y-4">
                        {[{ label: 'AI Study Help', key: 'isAiEnabled' }, { label: 'Question Uploads', key: 'isUploadEnabled' }, { label: 'Past Question Contribution', key: 'isPastQuestionContributionEnabled' }, { label: 'Withdrawal Portal', key: 'isWithdrawalEnabled' }, { label: 'Community Feed', key: 'isCommunityEnabled' }, { label: 'Maintenance Mode', key: 'isMaintenanceMode' }, { label: 'Splash Screen', key: 'isSplashScreenEnabled' }, { label: 'Messaging System', key: 'isMessagingEnabled' }].map(f => (
                          <div key={f.label} className="flex justify-between items-center p-5 bg-gray-950/80 rounded-2xl border border-gray-800">
                            <span className="text-[10px] font-black uppercase text-gray-300">{f.label}</span>
                            <button onClick={() => handleUpdateConfig({ [f.key]: !config[f.key as keyof SystemConfig] })} className={`p-2 rounded-xl transition-all ${config[f.key as keyof SystemConfig] ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-500'}`} title="Toggle Feature">
                              {config[f.key as keyof SystemConfig] ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-900/50 p-8 rounded-[3rem] border border-gray-800 space-y-6 flex flex-col justify-center">
                      <h3 className="text-xl font-black text-white flex items-center gap-3"><Activity className="w-5 h-5 text-green-500" /> Platform Stats</h3>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-6 bg-gray-950/80 rounded-3xl border border-gray-800"><p className="text-[8px] font-black text-gray-500 uppercase mb-1">Users</p><p className="text-3xl font-black italic">{allUsers.length}</p></div>
                        <div className="p-6 bg-gray-950/80 rounded-3xl border border-gray-800"><p className="text-[8px] font-black text-gray-500 uppercase mb-1">Questions</p><p className="text-3xl font-black italic">{questions.length}</p></div>
                        <div className="p-6 bg-gray-950/80 rounded-3xl border border-gray-800"><p className="text-[8px] font-black text-gray-500 uppercase mb-1">Ads Active</p><p className="text-3xl font-black italic">{globalAds.length}</p></div>
                        <div className="p-6 bg-gray-950/80 rounded-3xl border border-gray-800"><p className="text-[8px] font-black text-gray-500 uppercase mb-1">Pending Payouts</p><p className="text-3xl font-black italic">{withdrawalRequests.filter(r => r.status === 'pending').length}</p></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <AdminLiveMonitor />
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
                   <h3 className="text-xl font-black text-white flex items-center gap-3"><Zap className="w-5 h-5 text-yellow-500" /> Earn Handbook Rates (P-PT)</h3>
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
                           <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Naira Per Prophy Coin</label>
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
                      <h3 className="text-xl font-black text-white flex items-center gap-3"><CreditCard className="w-5 h-5 text-blue-500" /> Card Payment Gateway</h3>
                      <button 
                        onClick={() => handleUpdateConfig({ isCardPaymentEnabled: !config.isCardPaymentEnabled })}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${config.isCardPaymentEnabled ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-500'}`}
                      >
                         {config.isCardPaymentEnabled ? 'Gateway Active' : 'Gateway Offline'}
                      </button>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[9px] text-gray-500 italic ml-2">Card payments are currently handled manually. Students will see instructions to contact support or use simulation mode.</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Removed: Synchronize Matrix Configuration */}

        {activeTab === 'engagement-rating' && (
          <div className="space-y-12 animate-fade-in">
             <div className="flex justify-between items-end">
               <div>
                 <h1 className="text-4xl font-black tracking-tighter uppercase italic">Engagement Rating</h1>
                 <p className="text-brand-muted font-medium italic">Ranking nodes by their contribution to the academic matrix.</p>
               </div>
               <div className="bg-brand-proph/10 border border-brand-proph/20 p-4 rounded-2xl">
                 <p className="text-[10px] font-black uppercase text-brand-proph">Algorithm</p>
                 <p className="text-xs font-bold text-white italic">Weighted Engagement Score</p>
               </div>
             </div>

             <div className="bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-800 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      <tr>
                        <th className="p-8">Rank</th>
                        <th className="p-8">Scholar Identity</th>
                        <th className="p-8">Engagement Stats</th>
                        <th className="p-8">Rating Score</th>
                        <th className="p-8 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {allUsers
                        .filter(u => u.role !== 'admin')
                        .map(u => {
                          const stats = u.engagementStats || { totalLikesGiven: 0, totalRepliesGiven: 0, totalRepostsGiven: 0 };
                          const score = (stats.totalLikesGiven * (config.engagementWeights?.likes || 1)) + 
                                        (stats.totalRepliesGiven * (config.engagementWeights?.replies || 5)) + 
                                        (stats.totalRepostsGiven * (config.engagementWeights?.reposts || 2.5));
                          return { ...u, engagementScore: score };
                        })
                        .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))
                        .map((u, index) => (
                          <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-8">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic ${
                                index === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' :
                                index === 1 ? 'bg-gray-300 text-black' :
                                index === 2 ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'
                              }`}>
                                #{index + 1}
                              </div>
                            </td>
                            <td className="p-8">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center font-black text-brand-proph border border-gray-700">
                                  {u.name[0]}
                                </div>
                                <div>
                                  <p className="font-black italic text-white group-hover:text-brand-proph transition-colors">{u.name}</p>
                                  <p className="text-[9px] text-gray-500 uppercase">@{u.nickname} • {u.university}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-8">
                              <div className="flex gap-4 text-[10px] font-black uppercase tracking-tighter">
                                <span className="text-gray-400">Likes: <span className="text-white">{u.engagementStats?.totalLikesGiven || 0}</span></span>
                                <span className="text-gray-400">Replies: <span className="text-white">{u.engagementStats?.totalRepliesGiven || 0}</span></span>
                                <span className="text-gray-400">Reposts: <span className="text-white">{u.engagementStats?.totalRepostsGiven || 0}</span></span>
                              </div>
                            </td>
                            <td className="p-8">
                              <p className="text-2xl font-black italic text-brand-proph">{(u.engagementScore || 0).toLocaleString()}</p>
                              <p className="text-[8px] text-gray-500 uppercase font-black">Points Generated</p>
                            </td>
                            <td className="p-8 text-right">
                              <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                (u.engagementScore || 0) > 5000 ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                (u.engagementScore || 0) > 1000 ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                'bg-gray-800 text-gray-500'
                              }`}>
                                {(u.engagementScore || 0) > 5000 ? 'Elite Node' : (u.engagementScore || 0) > 1000 ? 'Active Node' : 'Standard Node'}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-12 animate-fade-in">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tighter uppercase italic">Revenue Dashboard</h1>
                <p className="text-gray-500 font-medium italic">Analyzing algorithm efficiency and financial performance.</p>
              </div>
              <div className="bg-green-600/10 border border-green-500/20 p-6 rounded-[2rem] text-right">
                <p className="text-[10px] font-black uppercase text-green-500 tracking-widest">Total Verified Revenue</p>
                <p className="text-3xl font-black text-white italic">
                  ₦{paymentVerifications.filter(p => p.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Weight Contribution Analysis */}
              <div className="bg-gray-900 p-8 rounded-[3rem] border border-gray-800 space-y-6 shadow-2xl">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-500" /> Weight Contribution Analysis
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { 
                        name: 'Likes', 
                        volume: allUsers.reduce((acc, u) => acc + (u.engagementStats?.totalLikesGiven || 0), 0),
                        weighted: allUsers.reduce((acc, u) => acc + (u.engagementStats?.totalLikesGiven || 0), 0) * (config.engagementWeights?.likes || 1)
                      },
                      { 
                        name: 'Replies', 
                        volume: allUsers.reduce((acc, u) => acc + (u.engagementStats?.totalRepliesGiven || 0), 0),
                        weighted: allUsers.reduce((acc, u) => acc + (u.engagementStats?.totalRepliesGiven || 0), 0) * (config.engagementWeights?.replies || 5)
                      },
                      { 
                        name: 'Reposts', 
                        volume: allUsers.reduce((acc, u) => acc + (u.engagementStats?.totalRepostsGiven || 0), 0),
                        weighted: allUsers.reduce((acc, u) => acc + (u.engagementStats?.totalRepostsGiven || 0), 0) * (config.engagementWeights?.reposts || 2.5)
                      }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                      <YAxis stroke="#9CA3AF" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '20px' }} />
                      <Bar dataKey="volume" name="Engagement Volume" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="weighted" name="Weighted Score" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-gray-500 italic text-center">
                  This chart compares raw engagement volume against the weighted score that drives revenue distribution.
                </p>
              </div>

              {/* Revenue Stream Distribution */}
              <div className="bg-gray-900 p-8 rounded-[3rem] border border-gray-800 space-y-6 shadow-2xl">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                  <Coins className="w-5 h-5 text-yellow-500" /> Revenue Stream Distribution
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Advertisements', value: paymentVerifications.filter(p => p.type === 'ad' && p.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0) },
                          { name: 'Subscriptions', value: paymentVerifications.filter(p => p.type === 'premium' && p.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0) },
                          { name: 'Other', value: paymentVerifications.filter(p => p.type === 'other' && p.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0) }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[0, 1, 2].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#10B981', '#8B5CF6', '#F59E0B'][index % 3]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                      />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800">
                    <p className="text-[8px] font-black text-gray-500 uppercase">Ad Revenue</p>
                    <p className="text-lg font-black text-green-500 italic">
                      ₦{paymentVerifications.filter(p => p.type === 'ad' && p.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800">
                    <p className="text-[8px] font-black text-gray-500 uppercase">Premium Revenue</p>
                    <p className="text-lg font-black text-purple-500 italic">
                      ₦{paymentVerifications.filter(p => p.type === 'premium' && p.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Algorithm Weight Efficiency */}
            <div className="bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                  <Activity className="w-5 h-5 text-brand-proph" /> Algorithm Weight Efficiency
                </h3>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Real-time Analysis</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-800 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <tr>
                      <th className="p-8">Engagement Type</th>
                      <th className="p-8">Current Weight</th>
                      <th className="p-8">Total Volume</th>
                      <th className="p-8">Revenue Contribution %</th>
                      <th className="p-8 text-right">Efficiency Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {[
                      { name: 'Replies', weight: config.engagementWeights?.replies || 5, icon: <MessageSquare className="w-4 h-4 text-blue-500" />, color: 'text-blue-500' },
                      { name: 'Reposts', weight: config.engagementWeights?.reposts || 2.5, icon: <RefreshCw className="w-4 h-4 text-green-500" />, color: 'text-green-500' },
                      { name: 'Likes', weight: config.engagementWeights?.likes || 1, icon: <Star className="w-4 h-4 text-yellow-500" />, color: 'text-yellow-500' }
                    ].map((item) => {
                      const totalWeighted = (allUsers.reduce((acc, u) => acc + (u.engagementStats?.totalLikesGiven || 0), 0) * (config.engagementWeights?.likes || 1)) +
                                           (allUsers.reduce((acc, u) => acc + (u.engagementStats?.totalRepliesGiven || 0), 0) * (config.engagementWeights?.replies || 5)) +
                                           (allUsers.reduce((acc, u) => acc + (u.engagementStats?.totalRepostsGiven || 0), 0) * (config.engagementWeights?.reposts || 2.5));
                      
                      const volume = allUsers.reduce((acc, u) => acc + (u.engagementStats?.[`total${item.name}Given` as keyof typeof u.engagementStats] as number || 0), 0);
                      const weighted = volume * item.weight;
                      const percentage = totalWeighted > 0 ? (weighted / totalWeighted) * 100 : 0;

                      return (
                        <tr key={item.name} className="hover:bg-white/5 transition-colors">
                          <td className="p-8">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-800 rounded-lg">{item.icon}</div>
                              <span className="font-black italic text-white">{item.name}</span>
                            </div>
                          </td>
                          <td className="p-8 font-black text-brand-proph italic">x{item.weight.toFixed(1)}</td>
                          <td className="p-8 font-mono text-gray-400">{volume.toLocaleString()}</td>
                          <td className="p-8">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className={`h-full bg-brand-proph`} style={{ width: `${percentage}%` }} />
                              </div>
                              <span className="text-[10px] font-black text-white">{percentage.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="p-8 text-right">
                            <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              percentage > 50 ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                              percentage > 20 ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                              'bg-gray-800 text-gray-500'
                            }`}>
                              {percentage > 50 ? 'High Impact' : percentage > 20 ? 'Moderate Impact' : 'Low Impact'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
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
             <div className="flex justify-between items-center">
               <h1 className="text-4xl font-black tracking-tighter uppercase italic">Asset Verification</h1>
               <button onClick={() => navigate('/upload')} className="bg-green-600 text-white font-black px-8 py-3 rounded-full text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-green-900/20">
                 <PlusCircle className="w-4 h-4" /> Archive Intel
               </button>
             </div>
             <div className="bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                   <thead className="bg-gray-800 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <tr><th className="p-8">Archive Intel</th><th className="p-8">Source Node</th><th className="p-8">Status</th><th className="p-8 text-right">Command</th></tr>
                   </thead>
                   <tbody className="divide-y divide-gray-800">
                      {[...questions].sort((a, b) => b.createdAt - a.createdAt).map(q => (
                        <tr key={q.id} className="hover:bg-white/5 transition-colors">
                           <td className="p-8"><p className="font-black italic text-sm">{q.courseCode}</p><p className="text-[10px] text-gray-500 uppercase">{q.courseTitle}</p></td>
                           <td className="p-8 font-black uppercase tracking-tighter text-gray-400">{allUsers.find(u => u.id === q.uploadedBy)?.name || 'Anon'}</td>
                           <td className="p-8">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${q.status === 'approved' ? 'bg-green-500/10 text-green-500' : q.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                {q.status}
                              </span>
                           </td>
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
                              <button onClick={() => {
                                const reason = window.prompt('Enter archive reason:');
                                if (reason) onArchiveQuestion(q.id, reason);
                              }} className="p-3 bg-yellow-600/10 text-yellow-500 rounded-xl hover:bg-yellow-600 hover:text-white transition-all" title="Archive"><Database className="w-4 h-4" /></button>
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

        {activeTab === 'archive-intel' && (
          <div className="space-y-12 animate-fade-in">
             <div className="flex items-center justify-between">
                <h1 className="text-4xl font-black tracking-tighter uppercase italic">Archive Intelligence</h1>
                <button 
                  onClick={async () => {
                    setLoadingArchive(true);
                    const data = await SupabaseService.getArchiveIntel();
                    setArchiveIntel(data);
                    setLoadingArchive(false);
                  }}
                  className="p-3 bg-gray-800 text-gray-400 rounded-xl hover:bg-white/10 transition-all"
                >
                  <RefreshCw className={`w-5 h-5 ${loadingArchive ? 'animate-spin' : ''}`} />
                </button>
             </div>

             <div className="bg-gray-900 rounded-[3.5rem] border border-gray-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto no-scrollbar">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="border-b border-gray-800 bg-gray-800/50">
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Question ID</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Action</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Performed By</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Metadata</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Timestamp</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                         {archiveIntel.length === 0 ? (
                           <tr>
                             <td colSpan={5} className="p-20 text-center text-gray-600 font-black italic uppercase text-xs">No archive intel captured</td>
                           </tr>
                         ) : (
                           archiveIntel.map(intel => (
                             <tr key={intel.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-8 font-mono text-[10px] text-gray-400">{intel.questionId}</td>
                                <td className="p-8">
                                   <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                     intel.action === 'archived' ? 'bg-yellow-600/10 text-yellow-500' :
                                     intel.action === 'restored' ? 'bg-green-600/10 text-green-500' :
                                     'bg-blue-600/10 text-blue-500'
                                   }`}>
                                      {intel.action}
                                   </span>
                                </td>
                                <td className="p-8 text-xs font-black text-white italic">{intel.performedBy}</td>
                                <td className="p-8">
                                   <pre className="text-[9px] text-gray-500 font-mono bg-black/30 p-2 rounded-lg max-w-[200px] overflow-hidden truncate">
                                      {JSON.stringify(intel.metadata)}
                                   </pre>
                                </td>
                                <td className="p-8 text-[10px] font-mono text-gray-500">
                                   {new Date(intel.createdAt).toLocaleString()}
                                </td>
                             </tr>
                           ))
                         )}
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
                                       <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Ad Formats</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['native', 'banner', 'popup', 'fullscreen'] as AdType[]).map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                const current = newAd.adTypes || [];
                                const next = current.includes(t) ? current.filter(x => x !== t) : [...current, t];
                                setNewAd({ ...newAd, adTypes: next });
                              }}
                              className={`py-2 rounded-lg font-black text-[9px] uppercase border transition-all ${newAd.adTypes?.includes(t) ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Placements (X-Style)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['timeline', 'search', 'post', 'profile', 'replies', 'university', 'study-hub', 'startup'] as AdPlacement[]).map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => {
                                const current = newAd.placements || [];
                                const next = current.includes(p) ? current.filter(x => x !== p) : [...current, p];
                                setNewAd({ ...newAd, placements: next });
                              }}
                              className={`py-2 rounded-lg font-black text-[9px] uppercase border transition-all ${newAd.placements?.includes(p) ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                            >
                              {p.replace('-', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
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
                                       <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Display Windows</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['12am-6am', '6am-12pm', '12pm-6pm', '6pm-12am', 'all-day'] as AdTimeFrame[]).map(tf => (
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
       </div>

                      <button type="button" onClick={() => adFileInputRef.current?.click()} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-700 transition-all text-white">
                         <Upload className="w-4 h-4" /> {newAd.mediaUrl ? 'Asset Linked' : 'Upload Content'}
                      </button>
                      <input type="file" ref={adFileInputRef} hidden accept="image/*,video/*" onChange={handleAdFileSelect} />
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Target Link</label>
                        <input className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-sm text-white" placeholder="https://..." value={newAd.link} onChange={e => setNewAd({...newAd, link: e.target.value})} />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Sponsorship Label</label>
                        <div className="grid grid-cols-2 gap-2">
                           <button type="button" onClick={() => setNewAd({...newAd, isSponsored: true})} className={`py-3 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${newAd.isSponsored ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>Sponsored</button>
                           <button type="button" onClick={() => setNewAd({...newAd, isSponsored: false})} className={`py-3 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${!newAd.isSponsored ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>Not Sponsored</button>
                        </div>
                      </div>

                      <button className="w-full bg-green-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Deploy Ad</button>
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
                                 <td className="p-8"><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-xl bg-gray-800 overflow-hidden border border-gray-700">{ad.type === 'image' ? <img src={ad.mediaUrl} className="w-full h-full object-cover" /> : <PlayCircle className="w-full h-full p-3 text-green-500" />}</div><div><p className="font-black italic text-sm text-white">{ad.title}</p><p className="text-[9px] font-black text-blue-400 uppercase">{(ad.adTypes || [ad.adType]).join(' • ')} • {(ad.placements || [ad.placement]).join(' • ')}</p><p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mt-1">{ad.isSponsored ? 'Sponsored' : 'Not Sponsored'}</p></div></div></td>
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
          <AdminAdVerification ads={globalAds} onUpdateAd={onUpdateAd} />
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
                               <img src={CloudinaryService.getOptimizedUrl(u.logo)} className="w-8 h-8 rounded-lg object-contain bg-white/5" />
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
                           <td className="p-8"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-gray-800 rounded-full border border-gray-700 flex items-center justify-center font-black italic text-white overflow-hidden">{u.profilePicture ? <img src={CloudinaryService.getOptimizedUrl(u.profilePicture)} className="w-full h-full object-cover" /> : u.name.charAt(0)}</div><div><p className="font-black italic text-base text-white">{u.name}</p><p className="text-[10px] text-green-500 font-black">@{u.nickname}</p></div></div></td>
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
                   <input type="number" className="w-full bg-gray-950 border border-gray-800 p-5 rounded-2xl text-white" placeholder="Prophy Coins" value={newTask.points} onChange={e => setNewTask({...newTask, points: parseInt(e.target.value) || 0})} />
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
                           <tr key={t.id} className="hover:bg-gray-800/20"><td className="p-8"><p className="font-black italic text-sm text-white">{t.title}</p><p className="text-[9px] text-gray-500 font-mono">{t.points} P-COIN</p></td><td className="p-8 text-right"><button onClick={() => onDeleteTask(t.id)} className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button></td></tr>
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
             <h1 className="text-4xl font-black tracking-tighter uppercase italic">Logic Matrix Control</h1>
             
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Post Ranking Algorithm */}
                <div className="bg-gray-900/50 p-8 rounded-[3rem] border border-gray-800 space-y-6">
                   <div className="flex justify-between items-center">
                      <h3 className="text-xl font-black text-white flex items-center gap-3"><Activity className="w-5 h-5 text-blue-500" /> Post Ranking (X-Style)</h3>
                      {loadingPostSettings && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                   </div>
                   
                   {postSettings && (
                     <div className="space-y-6">
                        {Object.entries(postSettings).map(([key, val]) => (
                          <div key={key} className="space-y-2">
                             <div className="flex justify-between items-center px-2">
                               <label className="text-[9px] font-black uppercase text-gray-500">{key.replace('_', ' ')}</label>
                               <span className="text-[10px] font-black text-blue-400">x{(val as number).toFixed(1)}</span>
                             </div>
                             <input 
                               type="range" 
                               min={key === 'gravity' ? "0.5" : "0"} 
                               max={key === 'author_reply' ? "200" : "50"} 
                               step="0.5"
                               className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                               value={val as number} 
                               onChange={e => {
                                 const newWeights = { ...postSettings, [key]: parseFloat(e.target.value) };
                                 updateAlgorithmWeights('post_ranking', newWeights);
                               }} 
                             />
                          </div>
                        ))}
                        <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
                           <p className="text-[9px] text-blue-400 font-bold leading-relaxed uppercase tracking-tighter">
                             Formula: ((AuthorReplies * {postSettings.author_reply}) + (Replies * {postSettings.reply}) + (Bookmarks * {postSettings.bookmark}) + (Shares * {postSettings.share}) + (Likes * {postSettings.like})) / (Age + {postSettings.time_offset})^{postSettings.gravity}
                           </p>
                        </div>
                     </div>
                   )}
                </div>

                {/* Ad Delivery Algorithm */}
                <div className="bg-gray-900/50 p-8 rounded-[3rem] border border-gray-800 space-y-6">
                   <div className="flex justify-between items-center">
                      <h3 className="text-xl font-black text-white flex items-center gap-3"><Target className="w-5 h-5 text-red-500" /> Ad Delivery Logic</h3>
                      {loadingAdSettings && <Loader2 className="w-4 h-4 animate-spin text-red-500" />}
                   </div>

                   {adSettings && (
                     <div className="space-y-6">
                        {Object.entries(adSettings).map(([key, val]) => (
                          <div key={key} className="space-y-2">
                             <div className="flex justify-between items-center px-2">
                               <label className="text-[9px] font-black uppercase text-gray-500">{key.replace('_', ' ')}</label>
                               <span className="text-[10px] font-black text-red-400">x{(val as number).toFixed(1)}</span>
                             </div>
                             <input 
                               type="range" min="0.1" max="10" step="0.1"
                               className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600" 
                               value={val as number} 
                               onChange={e => {
                                 const newWeights = { ...adSettings, [key]: parseFloat(e.target.value) };
                                 updateAlgorithmWeights('ad_delivery', newWeights);
                               }} 
                             />
                          </div>
                        ))}
                        <div className="p-4 bg-red-600/10 border border-red-500/20 rounded-2xl">
                           <p className="text-[9px] text-red-400 font-bold leading-relaxed uppercase tracking-tighter">
                             Formula: (Bid * {adSettings.bid_weight}) * (Quality * {adSettings.quality_weight})
                           </p>
                        </div>
                     </div>
                   )}
                </div>
             </div>

             {/* Real-time Leaderboard Preview */}
             <div className="bg-gray-900/50 p-8 rounded-[3rem] border border-gray-800 space-y-6">
                <h3 className="text-xl font-black text-white flex items-center gap-3"><Award className="w-5 h-5 text-yellow-500" /> Real-time Top 20 Leaderboard</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-800 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      <tr>
                        <th className="p-4">Rank</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Posts (24h)</th>
                        <th className="p-4">Total Engagement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {leaderboard.map((u, i) => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-black italic text-brand-proph">#{i + 1}</td>
                          <td className="p-4">
                            <p className="font-bold text-white">{u.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase">@{u.nickname}</p>
                          </td>
                          <td className="p-4 font-mono text-gray-300">{u.post_count}</td>
                          <td className="p-4 font-black text-brand-proph">{u.total_engagement.toLocaleString()}</td>
                        </tr>
                      ))}
                      {leaderboard.length === 0 && !loadingLeaderboard && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-600 font-black italic uppercase text-xs">No active nodes in the last 24h</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
                           <td className="p-8"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-gray-800 rounded-full border border-gray-700 flex items-center justify-center font-black italic text-white overflow-hidden">{u.profilePicture ? <img src={CloudinaryService.getOptimizedUrl(u.profilePicture)} className="w-full h-full object-cover" /> : u.name.charAt(0)}</div><div><p className="font-black italic text-base text-white">{u.name}</p><p className="text-[10px] text-green-500 font-black">@{u.nickname}</p></div></div></td>
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
                                {['command', 'financials', 'engagement', 'submissions', 'payouts', 'ad-engine', 'academic', 'users', 'broadcast', 'tasks', 'algorithms', 'branding', 'sug', 'reports'].map(page => (
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

        {activeTab === 'reports' && (
          <div className="space-y-12 animate-fade-in">
             <div className="flex items-center justify-between">
                <h1 className="text-4xl font-black tracking-tighter uppercase italic">Security Reports</h1>
                <button 
                  onClick={async () => {
                    setLoadingReports(true);
                    const data = await SupabaseService.getReports();
                    setReports(data);
                    setLoadingReports(false);
                  }}
                  className="p-3 bg-gray-800 text-gray-400 rounded-xl hover:bg-white/10 transition-all"
                >
                  <RefreshCw className={`w-5 h-5 ${loadingReports ? 'animate-spin' : ''}`} />
                </button>
             </div>

             <div className="bg-gray-900 rounded-[3.5rem] border border-gray-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto no-scrollbar">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="border-b border-gray-800 bg-gray-800/50">
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Reporter</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Target</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Reason</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                         {reports.length === 0 ? (
                           <tr>
                             <td colSpan={5} className="p-20 text-center text-gray-600 font-black italic uppercase text-xs">No active reports found</td>
                           </tr>
                         ) : (
                           reports.map(report => (
                             <tr key={report.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-8">
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
                                         <Users className="w-5 h-5 text-gray-400" />
                                      </div>
                                      <p className="text-xs font-black text-white italic truncate max-w-[150px]">{report.reporterId}</p>
                                   </div>
                                </td>
                                <td className="p-8">
                                   <div className="space-y-1">
                                      <span className="px-2 py-0.5 bg-red-600/10 text-red-500 rounded text-[8px] font-black uppercase">{report.targetType}</span>
                                      <p className="text-[10px] font-mono text-gray-500 truncate max-w-[150px]">{report.targetId}</p>
                                   </div>
                                </td>
                                <td className="p-8">
                                   <div className="space-y-1">
                                      <p className="text-xs font-black text-white italic uppercase tracking-tighter">{report.reason}</p>
                                      <p className="text-[10px] text-gray-500 font-medium italic line-clamp-2">{report.details}</p>
                                   </div>
                                </td>
                                <td className="p-8">
                                   <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                     report.status === 'pending' ? 'bg-yellow-600/10 text-yellow-500' :
                                     report.status === 'resolved' ? 'bg-green-600/10 text-green-500' :
                                     'bg-gray-600/10 text-gray-500'
                                   }`}>
                                      {report.status}
                                   </span>
                                </td>
                                <td className="p-8">
                                   <div className="flex items-center gap-2">
                                      {report.status === 'pending' && (
                                        <>
                                          <button 
                                            onClick={() => SupabaseService.updateReportStatus(report.id, 'resolved')}
                                            className="p-3 bg-green-600/10 text-green-500 rounded-xl hover:bg-green-600 hover:text-white transition-all"
                                            title="Resolve"
                                          >
                                            <CheckCircle2 className="w-5 h-5" />
                                          </button>
                                          <button 
                                            onClick={() => SupabaseService.updateReportStatus(report.id, 'dismissed')}
                                            className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                            title="Dismiss"
                                          >
                                            <XCircle className="w-5 h-5" />
                                          </button>
                                          {report.targetType === 'post' && (
                                            <button 
                                              onClick={async () => {
                                                if (window.confirm('Are you sure you want to delete this reported post?')) {
                                                  await SupabaseService.deletePost(report.targetId);
                                                  await SupabaseService.updateReportStatus(report.id, 'resolved');
                                                  const data = await SupabaseService.getReports();
                                                  setReports(data);
                                                }
                                              }}
                                              className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
                                              title="Delete Post"
                                            >
                                              <Trash2 className="w-5 h-5" />
                                            </button>
                                          )}
                                        </>
                                      )}
                                      <button 
                                        onClick={() => {
                                          if (report.targetType === 'post') {
                                            navigate(`/community?post=${report.targetId}`);
                                          } else if (report.targetType === 'user') {
                                            navigate(`/profile/${report.targetId}`);
                                          }
                                        }}
                                        className="p-3 bg-gray-800 text-gray-400 rounded-xl hover:bg-white/10 transition-all"
                                        title="View Target"
                                      >
                                        <ChevronRight className="w-5 h-5" />
                                      </button>
                                   </div>
                                </td>
                             </tr>
                           ))
                         )}
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
                                   <img src={CloudinaryService.getOptimizedUrl(conv.user1?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.user1?.username}`)} className="w-10 h-10 rounded-xl border-2 border-gray-900" alt="" />
                                   <img src={CloudinaryService.getOptimizedUrl(conv.user2?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.user2?.username}`)} className="w-10 h-10 rounded-xl border-2 border-gray-900" alt="" />
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
                                    <img src={CloudinaryService.getOptimizedUrl(sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sender?.username}`)} className="w-10 h-10 rounded-xl flex-shrink-0" alt="" />
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
            onUpdateSplashScreen={onUpdateSplashScreen}
            config={config}
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
