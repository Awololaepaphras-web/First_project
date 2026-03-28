
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import Layout from './components/Layout';
import Home from './views/Home';
import Login from './views/Login';
import Signup from './views/Signup';
import Dashboard from './views/Dashboard';
import AIAssistant from './views/AIAssistant';
import StudyHub from './views/StudyHub';
import Community from './views/Community';
import UniversityFeed from './src/views/UniversityFeed';
import UniversityList from './views/UniversityList';
import UniversityDetail from './views/UniversityDetail';
import AdminDashboard from './views/AdminDashboard';
import AdminLogin from './views/AdminLogin';
import Profile from './views/Profile';
import UserUpload from './views/UserUpload';
import Withdrawal from './views/Withdrawal';
import MemoryBank from './views/MemoryBank';
import Premium from './views/Premium';
import UserAds from './views/UserAds';
import Tasks from './views/Tasks';
import Messages from './views/Messages';
import Settings from './views/Settings';
import IncomeAnalysis from './views/IncomeAnalysis';
import AnonymousUpload from './views/AnonymousUpload';
import LocalHub from './views/GladiatorHub';
import GladiatorLanding from './views/GladiatorLanding';
import GladiatorPool from './views/GladiatorPool';
import GladiatorVault from './views/GladiatorVault';
import GladiatorCreatorDashboard from './views/GladiatorCreatorDashboard';
import GladiatorAdDashboard from './views/GladiatorAdDashboard';
import EarnManual from './views/EarnManual';
import AdAnalytics from './views/AdAnalytics';
import AdRevenueSharing from './views/AdRevenueSharing';
import AdminPaymentVerification from './views/AdminPaymentVerification';
import Referrals from './views/Referrals';
import PointTransfer from './views/PointTransfer';
import VercelSqlView from './views/VercelSqlView';
import ForgotPassword from './views/ForgotPassword';
import ResetPassword from './views/ResetPassword';
import FullscreenAd from './components/FullscreenAd';
import { Database as DB } from './src/services/database';
import { SupabaseService } from './src/services/supabaseService';
import { supabase } from './src/lib/supabase';
import { User, Post, PostComment, SystemConfig, University, PastQuestion, WithdrawalRequest, EarnTask, Notification, Message, Advertisement, AdTimeFrame, AdPlacement, PaymentVerification } from './types';
import { MOCK_QUESTIONS, UNIVERSITIES as INITIAL_UNIVERSITIES, UNIVERSITY_COLLEGES as INITIAL_COLLEGES, COLLEGE_DEPARTMENTS as INITIAL_DEPARTMENTS } from './constants';

const DEFAULT_CONFIG: SystemConfig = {
  isAiEnabled: true,
  isUploadEnabled: true,
  isWithdrawalEnabled: true,
  isMaintenanceMode: false,
  isCommunityEnabled: true,
  isAdsEnabled: true,
  isUserAdsEnabled: true,
  isSplashScreenEnabled: true,
  feedWeights: { engagement: 0.4, recency: 0.3, relationship: 0.1, quality: 0.1, eduRelevance: 0.1 },
  adWeights: { budget: 0.5, relevance: 0.2, performance: 0.2, targetMatch: 0.1 },
  earnRates: {
    contribution: 50,
    referral: 80,
    adClick: 200, // per 1k clicks
    arena: 5,
    likeReward: 0.1,
    replyReward: 0.5,
    repostReward: 1.0
  },
  nairaPerPoint: 0.5,
  adPricing: { daily: 1500, weekly: 8500, monthly: 30000 },
  engagementWeights: {
    replies: 5.0,
    likes: 1.0,
    reposts: 2.5
  },
  premiumTiers: {
    weekly: 1000,
    monthly: 2500,
    yearly: 20000
  },
  paymentAccount: {
    bankName: 'Proph Institutional Bank',
    accountNumber: '1020304050',
    accountName: 'PROPH ACADEMIC SERVICES'
  },
  isCardPaymentEnabled: true,
  paystackPublicKey: 'pk_test_proph_academic_node_key',
  splashScreenUrl: '',
  globalAnnouncement: {
    text: 'Welcome to PROPH! The ultimate Federal Universities Past Questions Hub.',
    isEnabled: true,
    type: 'success'
  }
};

const DEFAULT_LOGO = 'https://picsum.photos/seed/proph-logo/512/512';
const DEFAULT_SPLASH = 'https://picsum.photos/seed/proph-splash/1080/1920';

const SplashScreen: React.FC<{ logo: string; splashUrl?: string; onComplete: () => void }> = ({ logo, splashUrl, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000); // Slightly longer for full image
    return () => clearTimeout(timer);
  }, [onComplete]);

  const finalSplash = splashUrl || DEFAULT_SPLASH;
  const finalLogo = logo || DEFAULT_LOGO;

  if (splashUrl) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center animate-in fade-in duration-700">
        <img src={finalSplash} alt="Splash" className="w-full h-full object-cover animate-pulse" referrerPolicy="no-referrer" />
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-brand-proph animate-progress" style={{ width: '100%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="relative">
        <div className="w-32 h-32 rounded-[2.5rem] bg-brand-proph/20 animate-pulse absolute -inset-4 blur-xl" />
        <img src={finalLogo} alt="Proph" className="w-32 h-32 rounded-[2.5rem] relative z-10 shadow-2xl animate-bounce" referrerPolicy="no-referrer" />
      </div>
      <div className="mt-12 text-center">
        <h1 className="text-5xl font-black text-white tracking-tighter italic">PROPH</h1>
        <p className="text-brand-proph font-black uppercase tracking-[0.3em] text-[10px] mt-2">Academic Node Alpha</p>
      </div>
      <div className="absolute bottom-12">
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-brand-proph animate-progress" style={{ width: '100%' }} />
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [questions, setQuestions] = useState<PastQuestion[]>(MOCK_QUESTIONS);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [tasks, setTasks] = useState<EarnTask[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [globalAds, setGlobalAds] = useState<Advertisement[]>([]);
  const [paymentVerifications, setPaymentVerifications] = useState<PaymentVerification[]>([]);
  const [universities, setUniversities] = useState<University[]>(INITIAL_UNIVERSITIES);
  const [universityColleges, setUniversityColleges] = useState<Record<string, string[]>>(INITIAL_COLLEGES);
  const [collegeDepartments, setCollegeDepartments] = useState<Record<string, string[]>>(INITIAL_DEPARTMENTS);
  const [appLogo, setAppLogo] = useState<string>(localStorage.getItem('proph_app_logo') || '');
  const [appIcon, setAppIcon] = useState<string>(localStorage.getItem('proph_app_icon') || '');
  const [showSplashScreen, setShowSplashScreen] = useState(false);
  
  useEffect(() => {
    if (config.isSplashScreenEnabled && !sessionStorage.getItem('proph_splash_shown')) {
      setShowSplashScreen(true);
      sessionStorage.setItem('proph_splash_shown', 'true');
    }
  }, [config.isSplashScreenEnabled]);

  useEffect(() => {
    if (config.appLogo) {
      setAppLogo(config.appLogo);
      localStorage.setItem('proph_app_logo', config.appLogo);
    }
    if (config.appIcon) {
      setAppIcon(config.appIcon);
      localStorage.setItem('proph_app_icon', config.appIcon);
    }
  }, [config.appLogo, config.appIcon]);

  useEffect(() => {
    if (appIcon) {
      const links = document.querySelectorAll("link[rel*='icon']");
      links.forEach(link => {
        (link as HTMLLinkElement).href = appIcon;
      });
      const appleIcon = document.querySelector("link[rel='apple-touch-icon']");
      if (appleIcon) {
        (appleIcon as HTMLLinkElement).href = appIcon;
      }
    }
  }, [appIcon]);

  const [navigationCount, setNavigationCount] = useState(0);
  const [loginTime, setLoginTime] = useState<number | null>(null);
  const [showAd, setShowAd] = useState(false);
  const [currentAd, setCurrentAd] = useState<Advertisement | null>(null);
  const [hasShownInitialAd, setHasShownInitialAd] = useState(false);

  useEffect(() => {
    const initData = async () => {
      // Restore Supabase session first
      const { data: { session } } = await SupabaseService.getSession();
      let savedUser = DB.getSession();
      
      if (session?.user) {
        // If we have a Supabase session, try to get the full user profile
        const users = await SupabaseService.getUsers();
        const foundUser = users.find(u => u.id === session.user.id || u.email === session.user.email);
        if (foundUser) {
          savedUser = foundUser;
          DB.saveSession(foundUser);
        }
      }

      if (savedUser) {
        setUser(savedUser);
        // Fetch monetization status from backend
        fetch(`/api/monetization/status/${savedUser.id}?followers=${savedUser.followers?.length || 0}&impressions=${savedUser.engagementStats?.totalMediaViews || 0}`)
          .then(res => res.json())
          .then(data => {
            setUser(prev => prev ? { ...prev, monetization: data } : null);
          })
          .catch(err => console.error("Failed to fetch monetization status", err));
          
        // Load messages for this user
        const savedMessages = await DB.getMessages(savedUser.id);
        if (savedMessages.length > 0) {
          setMessages(savedMessages.map(m => ({
            id: m.id,
            senderId: m.sender_id,
            receiverId: m.receiver_id,
            text: m.text,
            timestamp: new Date(m.created_at || m.timestamp).getTime()
          })));
        }
      }
      
      const savedConfig = localStorage.getItem('proph_system_config');
      if (savedConfig) setConfig(JSON.parse(savedConfig));
      
      const savedPosts = await DB.getFeed();
      if (savedPosts.length > 0) setPosts(savedPosts);
      
      const savedUsers = await DB.getUsers();
      if (savedUsers.length > 0) setAllUsers(savedUsers);
      
      const savedDocs = await DB.getDocuments();
      if (savedDocs.length > 0) setQuestions(savedDocs);
      
      const savedAds = await DB.getAds();
      if (savedAds.length > 0) setGlobalAds(savedAds);

      const savedTasks = await DB.getTasks();
      if (savedTasks.length > 0) setTasks(savedTasks);

      const savedWithdrawals = await DB.getWithdrawalRequests();
      if (savedWithdrawals.length > 0) setWithdrawalRequests(savedWithdrawals);

      const savedUnis = await DB.getUniversities();
      if (savedUnis.length > 0) setUniversities(savedUnis);

      const savedPayments = await DB.getPaymentVerifications();
      if (savedPayments.length > 0) setPaymentVerifications(savedPayments);

      if (savedUser) {
        const initialNotifs = await SupabaseService.getNotifications(savedUser.id);
        setNotifications(initialNotifs.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type as any,
          createdAt: new Date(n.created_at).getTime(),
          read: n.is_read
        })));
      }
    };

    initData();

    // Real-time Feed Subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to inserts, updates, and deletes
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          console.log('Change received!', payload);
          if (payload.eventType === 'INSERT') {
            const newPost = SupabaseService.mapPost(payload.new);
            setPosts(prev => {
              if (prev.some(p => p.id === newPost.id)) return prev;
              return [newPost, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedPost = SupabaseService.mapPost(payload.new);
            setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
          } else if (payload.eventType === 'DELETE') {
            setPosts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const adsSub = SupabaseService.subscribeToTable('advertisements', (payload: any) => {
      if (payload.new) {
        const mappedAd = SupabaseService.mapAd(payload.new);
        if (payload.eventType === 'INSERT') setGlobalAds(prev => [mappedAd, ...prev]);
        if (payload.eventType === 'UPDATE') setGlobalAds(prev => prev.map(item => item.id === mappedAd.id ? mappedAd : item));
      }
      if (payload.eventType === 'DELETE') setGlobalAds(prev => prev.filter(a => a.id === payload.old.id));
    });

    const tasksSub = SupabaseService.subscribeToTable('tasks', (payload: any) => {
      if (payload.new) {
        const mappedTask = SupabaseService.mapTask(payload.new);
        if (payload.eventType === 'INSERT') setTasks(prev => [mappedTask, ...prev]);
        if (payload.eventType === 'UPDATE') setTasks(prev => prev.map(item => item.id === mappedTask.id ? mappedTask : item));
      }
      if (payload.eventType === 'DELETE') setTasks(prev => prev.filter(t => t.id === payload.old.id));
    });

    const withdrawalsSub = SupabaseService.subscribeToTable('withdrawal_requests', (payload: any) => {
      if (payload.new) {
        const mappedReq = SupabaseService.mapWithdrawal(payload.new);
        if (payload.eventType === 'INSERT') setWithdrawalRequests(prev => [mappedReq, ...prev]);
        if (payload.eventType === 'UPDATE') setWithdrawalRequests(prev => prev.map(w => w.id === mappedReq.id ? mappedReq : w));
      }
    });

    const configSub = SupabaseService.subscribeToTable('system_config', (payload: any) => {
      if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
        const newConfig = payload.new.config;
        setConfig(prev => ({ ...prev, ...newConfig }));
        localStorage.setItem('proph_system_config', JSON.stringify(newConfig));
        if (newConfig.appLogo) {
          setAppLogo(newConfig.appLogo);
          localStorage.setItem('proph_app_logo', newConfig.appLogo);
        }
      }
    });

    const docsSub = SupabaseService.subscribeToTable('documents', (payload: any) => {
      if (payload.new) {
        const mappedDoc = SupabaseService.mapDocument(payload.new);
        if (payload.eventType === 'INSERT') {
          setQuestions(prev => [mappedDoc, ...prev]);
          // Forceful visibility: notify users if it's a public document
          if (mappedDoc.visibility === 'public') {
            setNotifications(prev => [{
              id: Math.random().toString(36).substr(2, 9),
              title: 'New Archive Synchronized',
              message: `${mappedDoc.courseCode} has been added to the Study Hub.`,
              type: 'info',
              createdAt: Date.now(),
              read: false
            }, ...prev]);
          }
        }
        if (payload.eventType === 'UPDATE') setQuestions(prev => prev.map(item => item.id === mappedDoc.id ? mappedDoc : item));
      }
      if (payload.eventType === 'DELETE') setQuestions(prev => prev.filter(q => q.id === payload.old.id));
    });

    const paymentsSub = SupabaseService.subscribeToTable('payment_verifications', (payload: any) => {
      if (payload.new) {
        const mappedPayment = SupabaseService.mapPayment(payload.new);
        if (payload.eventType === 'INSERT') setPaymentVerifications(prev => [mappedPayment, ...prev]);
        if (payload.eventType === 'UPDATE') setPaymentVerifications(prev => prev.map(item => item.id === mappedPayment.id ? mappedPayment : item));
      }
    });

    const unisSub = SupabaseService.subscribeToTable('universities', (payload: any) => {
      if (payload.new) {
        const mappedUni = SupabaseService.mapUniversity(payload.new);
        if (payload.eventType === 'INSERT') setUniversities(prev => [mappedUni, ...prev]);
        if (payload.eventType === 'UPDATE') setUniversities(prev => prev.map(u => u.id === mappedUni.id ? mappedUni : u));
      }
      if (payload.eventType === 'DELETE') setUniversities(prev => prev.filter(u => u.id === payload.old.id));
    });

    const usersSub = SupabaseService.subscribeToTable('users', (payload: any) => {
      if (payload.new) {
        const mappedUser = SupabaseService.mapUser(payload.new);
        if (payload.eventType === 'INSERT') setAllUsers(prev => [mappedUser, ...prev]);
        if (payload.eventType === 'UPDATE') {
          setAllUsers(prev => prev.map(item => item.id === mappedUser.id ? mappedUser : item));
          if (user && mappedUser.id === user.id) setUser(mappedUser);
        }
      }
      if (payload.eventType === 'DELETE') setAllUsers(prev => prev.filter(u => u.id === payload.old.id));
    });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(adsSub);
      supabase.removeChannel(tasksSub);
      supabase.removeChannel(withdrawalsSub);
      supabase.removeChannel(configSub);
      supabase.removeChannel(docsSub);
      supabase.removeChannel(paymentsSub);
      supabase.removeChannel(unisSub);
      supabase.removeChannel(usersSub);
    };
  }, []);

  // User-specific Subscriptions
  useEffect(() => {
    if (!user) return;

    const notifsSub = SupabaseService.subscribeToTable('notifications', (payload: any) => {
      if (payload.eventType === 'INSERT' && payload.new.user_id === user.id) {
        const newNotif: Notification = {
          id: payload.new.id,
          title: payload.new.title,
          message: payload.new.message,
          type: payload.new.type as any,
          createdAt: new Date(payload.new.created_at).getTime(),
          read: payload.new.is_read
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    });

    const usersSub = SupabaseService.subscribeToTable('users', (payload: any) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        const u = payload.new;
        const mappedUser = SupabaseService.mapUser(u);
        setAllUsers(prev => {
          if (prev.some(usr => usr.id === mappedUser.id)) return prev;
          return [...prev, mappedUser];
        });
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        const u = payload.new;
        const mappedUser = SupabaseService.mapUser(u);
        
        setAllUsers(prev => prev.map(usr => usr.id === mappedUser.id ? { ...usr, ...mappedUser } : usr));
        
        // Update current user if it's them
        if (user && mappedUser.id === user.id) {
          // Only update if something actually changed to avoid loops
          setUser(prev => {
            if (!prev) return mappedUser;
            // Check for differences (shallow check)
            const hasChanged = Object.keys(mappedUser).some(key => (mappedUser as any)[key] !== (prev as any)[key]);
            if (hasChanged) {
              DB.saveSession(mappedUser);
              return mappedUser;
            }
            return prev;
          });
        }
      } else if (payload.eventType === 'DELETE' && payload.old) {
        setAllUsers(prev => prev.filter(usr => usr.id !== payload.old.id));
        if (user && payload.old.id === user.id) {
          setUser(null);
          localStorage.removeItem('proph_session_user');
        }
      }
    });

    return () => {
      notifsSub.unsubscribe();
      usersSub.unsubscribe();
    };
  }, [user?.id]);

  // Real-time Messages Subscription
  useEffect(() => {
    if (!user) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      const initialMessages = await DB.getMessages(user.id);
      setMessages(initialMessages.map(m => ({
        id: m.id,
        senderId: m.senderId,
        receiverId: m.receiverId,
        text: m.content,
        createdAt: new Date(m.createdAt).getTime()
      })));
    };
    fetchMessages();

    // Subscribe to new messages
    const msgSub = DB.subscribeToMessages(user.id, (payload) => {
      if (payload) {
        const newMessage = payload;
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, {
            id: newMessage.id,
            senderId: newMessage.senderId,
            receiverId: newMessage.receiverId,
            text: newMessage.content,
            createdAt: new Date(newMessage.createdAt).getTime()
          }];
        });
      }
    });

    return () => {
      msgSub.unsubscribe();
    };
  }, [user]);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (user && messages.length > 0) {
      // Map back to Supabase format for storage consistency
      const mappedMessages = messages.map(m => ({
        id: m.id,
        sender_id: m.senderId,
        receiver_id: m.receiverId,
        text: m.text,
        created_at: new Date(m.timestamp).toISOString()
      }));
      DB.saveMessages(user.id, mappedMessages);
    }
  }, [messages, user?.id]);

  useEffect(() => { DB.saveFeed(posts); }, [posts]);
  useEffect(() => { DB.saveUsers(allUsers); }, [allUsers]);
  useEffect(() => { DB.saveDocuments(questions); }, [questions]);
  useEffect(() => { localStorage.setItem('proph_ads', JSON.stringify(globalAds)); }, [globalAds]);
  useEffect(() => { localStorage.setItem('proph_system_config', JSON.stringify(config)); }, [config]);
  useEffect(() => { DB.saveSession(user); }, [user]);

  const handleSaveConfig = async (newConfig: SystemConfig) => {
    setConfig(newConfig);
    try {
      await DB.saveConfig(newConfig);
    } catch (error) {
      console.error("Sync Error:", error);
    }
  };

  const handleAddAd = (ad: Advertisement) => {
    setGlobalAds([ad, ...globalAds]);
    DB.saveAd(ad);
  };

  const handleDeleteAd = (id: string) => {
    setGlobalAds(globalAds.filter(a => a.id !== id));
    DB.deleteAd(id);
  };

  const handleUpdateAd = (ad: Advertisement) => {
    setGlobalAds(prev => prev.map(a => a.id === ad.id ? ad : a));
    DB.saveAd(ad);
  };

  const handleAddTask = (task: EarnTask) => {
    setTasks([task, ...tasks]);
    DB.saveTask(task);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    DB.deleteTask(id);
  };

  const handleAddUniversity = (uni: University) => {
    setUniversities([...universities, uni]);
    DB.saveUniversity(uni);
  };

  const handleRemoveUniversity = (id: string) => {
    setUniversities(universities.filter(u => u.id !== id));
    DB.deleteUniversity(id);
  };

  const handleApproveWithdrawal = (id: string) => {
    setWithdrawalRequests(prev => prev.map(w => w.id === id ? { ...w, status: 'approved' } : w));
    DB.updateWithdrawalStatus(id, 'approved');
  };

  const handleRejectWithdrawal = (id: string) => {
    setWithdrawalRequests(prev => prev.map(w => w.id === id ? { ...w, status: 'rejected' } : w));
    DB.updateWithdrawalStatus(id, 'rejected');
  };

  const triggerAd = useCallback((placement?: AdPlacement) => {
    const now = new Date();
    const hour = now.getHours();
    let currentTimeFrame: AdTimeFrame = '12am-6am';
    if (hour >= 6 && hour < 12) currentTimeFrame = '6am-12pm';
    else if (hour >= 12 && hour < 18) currentTimeFrame = '12pm-6pm';
    else if (hour >= 18) currentTimeFrame = '6pm-12am';

    const validAds = globalAds.filter(ad => {
      if (ad.status !== 'active') return false;
      // Only trigger popups or fullscreens via this controller
      if (ad.adType !== 'popup' && ad.adType !== 'fullscreen') return false;
      
      // If a specific placement is requested, filter for it
      if (placement && ad.placement !== placement) return false;
      
      if (!ad.timeFrames || ad.timeFrames.length === 0) return true;
      return ad.timeFrames.includes(currentTimeFrame) || ad.timeFrames.includes('all-day');
    });

    if (validAds.length > 0) {
      const randomAd = validAds[Math.floor(Math.random() * validAds.length)];
      setCurrentAd(randomAd);
      setShowAd(true);
    }
  }, [globalAds]);

  const handleApproveQuestion = (id: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, status: 'approved' } : q));
    DB.updateDocumentStatus(id, 'approved');
  };

  const handleRejectQuestion = (id: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, status: 'rejected' } : q));
    DB.updateDocumentStatus(id, 'rejected');
  };

  const handlePost = (content: string, mediaUrl?: string, mediaType?: 'image' | 'video', parentId?: string, customUser?: any) => {
    if (!user && !customUser) return;
    const poster = customUser || user;
    const newPost: Post = {
      id: crypto.randomUUID(),
      userId: poster.id,
      userName: poster.name,
      userNickname: poster.nickname || poster.name,
      userUniversity: poster.university || 'Global',
      content,
      mediaUrl,
      mediaType,
      likes: [],
      comments: [],
      reposts: [],
      parentId,
      createdAt: Date.now(),
      stats: { linkClicks: 0, profileClicks: 0, mediaViews: 0, detailsExpanded: 0, impressions: 0 }
    };
    setPosts([newPost, ...posts]);
    DB.savePost(newPost);
  };

  const trackEngagement = async (postId: string, type: 'like' | 'repost' | 'reply' | 'link' | 'profile' | 'media' | 'ad_click', text?: string) => {
    if (!user) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Update local state for immediate feedback
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const stats = { ...p.stats };
      if (type === 'link') stats.linkClicks++;
      if (type === 'profile') stats.profileClicks++;
      if (type === 'media') stats.mediaViews++;
      
      const likes = type === 'like' ? (p.likes.includes(user.id) ? p.likes.filter(id => id !== user.id) : [...p.likes, user.id]) : p.likes;
      const reposts = type === 'repost' ? (p.reposts.includes(user.id) ? p.reposts.filter(id => id !== user.id) : [...p.reposts, user.id]) : p.reposts;
      
      let comments = p.comments;
      if (type === 'reply' && text) {
        const newComment: PostComment = {
          id: Math.random().toString(36).substr(2, 9),
          userId: user.id,
          userName: user.name,
          text,
          createdAt: Date.now(),
          likes: []
        };
        comments = [...comments, newComment];
      }

      return { ...p, stats, likes, reposts, comments };
    }));

    // Call Supabase Service
    if (type === 'like') {
      await SupabaseService.togglePostLike(postId, user.id);
    } else if (type === 'repost') {
      await SupabaseService.togglePostRepost(postId, user.id);
    } else if (type === 'reply' && text) {
      const newComment: PostComment = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        userName: user.name,
        text,
        createdAt: Date.now(),
        likes: []
      };
      await SupabaseService.addPostComment(postId, newComment);
    } else if (['link', 'profile', 'media', 'ad_click'].includes(type)) {
      await SupabaseService.trackPostEngagement(postId, type as any, user.id);
    }

    // Update local user engagement stats
    setAllUsers(prev => prev.map(u => {
      if (u.id !== user.id) return u;
      const es = u.engagementStats || { totalLikesGiven: 0, totalRepliesGiven: 0, totalRepostsGiven: 0, totalLinkClicks: 0, totalProfileClicks: 0, totalMediaViews: 0 };
      if (type === 'like') es.totalLikesGiven++;
      if (type === 'repost') es.totalRepostsGiven++;
      if (type === 'reply') es.totalRepliesGiven++;
      if (type === 'link') es.totalLinkClicks++;
      if (type === 'profile') es.totalProfileClicks++;
      if (type === 'media') es.totalMediaViews++;
      const updatedUser = { ...u, engagementStats: es };
      DB.saveUser(updatedUser);
      return updatedUser;
    }));
  };

  const handleFollow = async (targetUserId: string) => {
    if (!user || user.id === targetUserId) return;
    
    const isFollowing = user.following?.includes(targetUserId);
    
    if (isFollowing) {
      await SupabaseService.unfollowUser(user.id, targetUserId);
    } else {
      await SupabaseService.followUser(user.id, targetUserId);
    }

    // The state will be updated by real-time listeners on the users table if we had them,
    // but for now let's update locally for immediate feedback
    const newFollowing = isFollowing 
      ? user.following?.filter(id => id !== targetUserId) 
      : [...(user.following || []), targetUserId];
    
    setUser({ ...user, following: newFollowing });
    
    setAllUsers(prev => prev.map(u => {
      if (u.id === user.id) {
        return { ...u, following: newFollowing };
      }
      if (u.id === targetUserId) {
        const isFollower = u.followers?.includes(user.id);
        const newFollowers = isFollower 
          ? u.followers?.filter(id => id !== user.id) 
          : [...(u.followers || []), user.id];
        return { ...u, followers: newFollowers };
      }
      return u;
    }));
  };

  const handleDeletePost = async (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    await DB.deletePost(postId);
  };

  const handleEditPost = async (postId: string, content: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, content } : p));
    await DB.updatePost(postId, content);
  };

  return (
    <>
      {showSplashScreen && (
        <SplashScreen 
          logo={appLogo} 
          splashUrl={config.splashScreenUrl}
          onComplete={() => setShowSplashScreen(false)} 
        />
      )}
      <Router>
        <AdController 
          user={user} 
          loginTime={loginTime} 
          navigationCount={navigationCount} 
          setNavigationCount={setNavigationCount}
          hasShownInitialAd={hasShownInitialAd}
          setHasShownInitialAd={setHasShownInitialAd}
          triggerAd={triggerAd}
          globalAds={globalAds}
        />
        <Layout user={user} onLogout={() => { setUser(null); localStorage.removeItem('proph_session_user'); }} notifications={notifications} onSelectTrend={()=>{}} appLogo={appLogo} onSaveConfig={handleSaveConfig} config={config}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={
            !sessionStorage.getItem('has_visited_home') ? <Navigate to="/" /> :
            (user ? <Navigate to="/dashboard" /> : <Login onLogin={(u) => { setUser(u); setLoginTime(Date.now()); }} allUsers={allUsers} />)
          } />
          <Route path="/signup" element={
            !sessionStorage.getItem('has_visited_home') ? <Navigate to="/" /> :
            (user ? <Navigate to="/dashboard" /> : <Signup onSignup={u => { setUser(u); setAllUsers([...allUsers, u]); setLoginTime(Date.now()); }} allUsers={allUsers} onReferralClick={()=>{}} />)
          } />
          
          <Route path="/dashboard" element={user ? <Dashboard user={user} questions={questions} activeBadges={[]} globalAds={globalAds} /> : <Navigate to="/login" />} />
          <Route path="/profile/:id" element={user ? <Profile currentUser={user} allUsers={allUsers} posts={posts} onFollow={handleFollow} /> : <Navigate to="/login" />} />
          <Route path="/community" element={user ? <Community user={user} allUsers={allUsers} posts={posts} globalAds={globalAds} onPost={handlePost} onLike={(id) => trackEngagement(id, 'like')} onRepost={(id) => trackEngagement(id, 'repost')} onComment={(id, text) => { trackEngagement(id, 'reply', text); }} onLikeComment={()=>{}} onFollow={handleFollow} onDeletePost={handleDeletePost} onEditPost={handleEditPost} /> : <Navigate to="/login" />} />
          <Route path="/university-feed" element={user ? <UniversityFeed user={user} globalAds={globalAds} /> : <Navigate to="/login" />} />
          <Route path="/messages" element={user ? <Messages user={user} allUsers={allUsers} messages={messages} onSendMessage={async (t, r) => {
            const receiverId = r === '' ? null : r;
            const newMsg = {
              id: crypto.randomUUID(),
              sender_id: user.id,
              receiver_id: receiverId,
              content: t,
              created_at: new Date().toISOString()
            };
            // Optimistic update
            setMessages(prev => [...prev, { 
              id: newMsg.id, 
              senderId: user.id, 
              receiverId: receiverId, 
              text: t, 
              createdAt: new Date(newMsg.created_at).getTime()
            }]);
            await DB.sendMessage(newMsg);
          }} /> : <Navigate to="/login" />} />
          <Route path="/ai-assistant" element={user ? <AIAssistant /> : <Navigate to="/login" />} />
          <Route path="/memory-bank" element={user ? <MemoryBank user={user} questions={questions} onAction={(c) => setUser({...user!, points: (user!.points || 0) + (c * 10)})} /> : <Navigate to="/login" />} />
          <Route path="/study-hub" element={user ? <StudyHub questions={questions} onAction={()=>{}} /> : <Navigate to="/login" />} />
          <Route path="/gladiator-hub" element={user ? <GladiatorLanding user={user} /> : <Navigate to="/login" />} />
          <Route path="/gladiator-hub/arena" element={user ? <LocalHub user={user} onJoin={()=>{}} /> : <Navigate to="/login" />} />
          <Route path="/gladiator-hub/vault" element={user ? <GladiatorVault user={user} /> : <Navigate to="/login" />} />
          <Route path="/gladiator-hub/creator" element={user ? <GladiatorCreatorDashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/gladiator-hub/advertiser" element={user ? <GladiatorAdDashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/gladiator-hub/competition" element={user ? <GladiatorPool user={user} onCommit={()=>{}} /> : <Navigate to="/login" />} />
          <Route path="/income-analysis" element={user ? <IncomeAnalysis user={user} analytics={[]} /> : <Navigate to="/login" />} />
          <Route path="/monetization" element={user ? <AdRevenueSharing user={user} /> : <Navigate to="/login" />} />
          <Route path="/settings" element={user ? <Settings user={user} onUpdateUser={setUser} /> : <Navigate to="/login" />} />
          <Route path="/withdraw" element={user ? <Withdrawal user={user} isEnabled={config.isWithdrawalEnabled} conversionRate={config.nairaPerPoint} onAddRequest={req => setWithdrawalRequests([req, ...withdrawalRequests])} requests={withdrawalRequests} /> : <Navigate to="/login" />} />
          <Route path="/upload" element={user ? <UserUpload user={user} isEnabled={config.isUploadEnabled} onUpload={q => { 
            setQuestions([q, ...questions]); 
            DB.saveDocument(q);
            // Forceful visibility: Post to community feed
            handlePost(`I just contributed a new past question: ${q.courseCode} - ${q.courseTitle}! Check it out in the Study Hub.`, q.fileUrl, q.type === 'image' ? 'image' : undefined);
          }} onToggleCompletion={()=>{}} universityColleges={universityColleges} collegeDepartments={collegeDepartments} /> : <Navigate to="/login" />} />
          <Route path="/anonymous-upload" element={<AnonymousUpload isEnabled={config.isUploadEnabled} onUpload={q => { 
            setQuestions([q, ...questions]); 
            DB.saveDocument(q);
            // Forceful visibility: Post to community feed
            handlePost(`A new past question was contributed anonymously: ${q.courseCode} - ${q.courseTitle}! Check it out in the Study Hub.`, q.fileUrl, q.type === 'image' ? 'image' : undefined, undefined, { id: 'anonymous', name: 'Anonymous Contributor', nickname: 'Ghost', university: 'Global' });
          }} universityColleges={universityColleges} collegeDepartments={collegeDepartments} />} />
          <Route path="/tasks" element={user ? <Tasks user={user} tasks={tasks} /> : <Navigate to="/login" />} />
          <Route path="/universities" element={user ? <UniversityList user={user} universities={universities} /> : <Navigate to="/login" />} />
          <Route path="/university/:id" element={user ? <UniversityDetail user={user} questions={questions} universities={universities} universityColleges={universityColleges} collegeDepartments={collegeDepartments} globalAds={globalAds} /> : <Navigate to="/login" />} />
          <Route path="/advertise" element={
            user ? (
              config.isUserAdsEnabled ? (
                <UserAds 
                  user={user} 
                  pricing={config.adPricing} 
                  config={config}
                  onVerifyPayment={(verification) => {
                    setPaymentVerifications([verification, ...paymentVerifications]);
                    DB.savePaymentVerification(verification);
                    
                    // If it's an ad payment and it's approved (card), update the ad status to pending_review
                    if (verification.type === 'ad' && verification.status === 'approved' && verification.details?.adId) {
                      const adId = verification.details.adId;
                      setGlobalAds(prev => {
                        const updatedAds = prev.map(ad => 
                          ad.id === adId ? { ...ad, status: 'pending_review' as const } : ad
                        );
                        // Also update in DB
                        const targetAd = updatedAds.find(a => a.id === adId);
                        if (targetAd) {
                          DB.saveAd(targetAd);
                        }
                        return updatedAds;
                      });
                    }
                  }}
                  onDeploy={(ad) => {
                    const fullAd = { ...ad, id: ad.id || Math.random().toString(), createdAt: Date.now() } as Advertisement;
                    setGlobalAds([fullAd, ...globalAds]);
                    DB.saveAd(fullAd);
                  }} 
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-4 p-12 text-center">
                  <div className="p-6 bg-red-100 rounded-full text-red-600">
                    <Shield className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-black uppercase italic">Portal Locked</h2>
                  <p className="text-gray-500 max-w-md font-medium">The advertisement portal is currently closed for maintenance or administrative reasons. Please check back later.</p>
                  <button onClick={() => window.history.back()} className="px-8 py-3 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs">Go Back</button>
                </div>
              )
            ) : <Navigate to="/login" />
          } />
          <Route path="/ad-analytics" element={user ? <AdAnalytics user={user} ads={globalAds} /> : <Navigate to="/login" />} />
          <Route path="/premium" element={user ? <Premium config={config} onUpgrade={(u) => setUser(u)} /> : <Navigate to="/login" />} />
          <Route path="/earn-manual" element={user ? <EarnManual config={config} /> : <Navigate to="/login" />} />
          <Route path="/referrals" element={user ? <Referrals user={user} /> : <Navigate to="/login" />} />
          <Route path="/transfer" element={user ? <PointTransfer user={user} /> : <Navigate to="/login" />} />
          <Route path="/forgot-password" element={<ForgotPassword allUsers={allUsers} />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/vercel-sql" element={<VercelSqlView />} />

          <Route path="/Epaphrastheadminofprophandloveforx" element={
            user && user.role === 'admin' ? (
              <AdminDashboard 
                user={user} config={config} allUsers={allUsers} questions={questions} withdrawalRequests={withdrawalRequests} tasks={tasks}
                onUpdateConfig={handleSaveConfig} onUpdateUsers={(users) => { setAllUsers(users); DB.saveUsers(users); }} onAddTask={handleAddTask} onDeleteTask={handleDeleteTask}
                onDeleteQuestion={handleDeletePost} onDeleteUser={(id) => { setAllUsers(allUsers.filter(u => u.id !== id)); }}
                onBroadcast={n => setNotifications([n, ...notifications])} universities={universities} universityColleges={universityColleges} collegeDepartments={collegeDepartments}
                onAddUniversity={handleAddUniversity} onRemoveUniversity={handleRemoveUniversity}
                onAddCollege={(uid, c) => setUniversityColleges({...universityColleges, [uid]: [...(universityColleges[uid] || []), c]})}
                onRemoveCollege={(uid, c) => setUniversityColleges({...universityColleges, [uid]: (universityColleges[uid] || []).filter(x => x !== c)})}
                onAddDept={(c, d) => setCollegeDepartments({...collegeDepartments, [c]: [...(collegeDepartments[c] || []), d]})}
                onRemoveDept={(c, d) => setCollegeDepartments({...collegeDepartments, [c]: (collegeDepartments[c] || []).filter(x => x !== d)})}
                onApproveQuestion={handleApproveQuestion}
                onRejectQuestion={handleRejectQuestion}
                onApproveWithdrawal={handleApproveWithdrawal}
                onRejectWithdrawal={handleRejectWithdrawal}
                globalAds={globalAds} onAddAd={handleAddAd} onDeleteAd={handleDeleteAd} onUpdateAd={handleUpdateAd}
                onUpdateUniversity={(uid, up) => setUniversities(prev => prev.map(u => u.id === uid ? {...u, ...up} : u))}
                onUpdateLogo={(logoUrl) => {
                  setAppLogo(logoUrl);
                  localStorage.setItem('proph_app_logo', logoUrl);
                  handleSaveConfig({ ...config, appLogo: logoUrl });
                }}
                onUpdateIcon={(iconUrl) => {
                  setAppIcon(iconUrl);
                  localStorage.setItem('proph_app_icon', iconUrl);
                  handleSaveConfig({ ...config, appIcon: iconUrl });
                }}
                onUpdateSplashScreen={(url) => {
                  handleSaveConfig({ ...config, splashScreenUrl: url });
                }}
                onLogout={() => { setUser(null); localStorage.removeItem('proph_session_user'); }}
              />
            ) : ( <AdminLogin onLogin={setUser} allUsers={allUsers} /> )
          } />
          <Route path="/Epaphrastheadminofprophandloveforx/payments" element={user && user.role === 'admin' ? <AdminPaymentVerification user={user} /> : <Navigate to="/Epaphrastheadminofprophandloveforx" />} />
        </Routes>
      </Layout>
      {showAd && currentAd && (
        <FullscreenAd ad={currentAd} onClose={() => setShowAd(false)} />
      )}
      </Router>
    </>
  );
};

const AdController: React.FC<{
  user: User | null;
  loginTime: number | null;
  navigationCount: number;
  setNavigationCount: (c: number | ((prev: number) => number)) => void;
  hasShownInitialAd: boolean;
  setHasShownInitialAd: (b: boolean) => void;
  triggerAd: (placement?: AdPlacement) => void;
  globalAds: Advertisement[];
}> = ({ user, loginTime, navigationCount, setNavigationCount, hasShownInitialAd, setHasShownInitialAd, triggerAd, globalAds }) => {
  const { pathname } = useLocation();
  
  const isUserPanel = pathname.startsWith('/dashboard') || 
                      pathname.startsWith('/community') || 
                      pathname.startsWith('/messages') || 
                      pathname.startsWith('/memory-bank') || 
                      pathname.startsWith('/withdraw') || 
                      pathname.startsWith('/upload') || 
                      pathname.startsWith('/tasks') || 
                      pathname.startsWith('/universities') || 
                      pathname.startsWith('/settings') || 
                      pathname.startsWith('/income-analysis') || 
                      pathname.startsWith('/monetization') || 
                      pathname.startsWith('/advertise') || 
                      pathname.startsWith('/premium') || 
                      pathname.startsWith('/referrals') || 
                      pathname.startsWith('/transfer') || 
                      pathname.startsWith('/earn-manual');

  useEffect(() => {
    setNavigationCount(prev => prev + 1);
  }, [pathname, setNavigationCount]);

  // Startup Ad Logic
  useEffect(() => {
    if (user && isUserPanel && !hasShownInitialAd) {
      const startupAds = globalAds.filter(ad => ad.status === 'active' && ad.placement === 'startup');
      if (startupAds.length > 0) {
        // Delay slightly to allow layout to settle
        const timer = setTimeout(() => {
          triggerAd('startup');
          setHasShownInitialAd(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, isUserPanel, hasShownInitialAd, globalAds, triggerAd, setHasShownInitialAd]);

  useEffect(() => {
    if (user && loginTime && !hasShownInitialAd && isUserPanel) {
      const timer = setInterval(() => {
        const elapsed = Date.now() - loginTime;
        if (elapsed >= 60000) { // 1 minute
          triggerAd();
          setHasShownInitialAd(true);
          clearInterval(timer);
        }
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [user, loginTime, hasShownInitialAd, triggerAd, isUserPanel, setHasShownInitialAd]);

  useEffect(() => {
    if (user && navigationCount >= 7 && isUserPanel) {
      triggerAd();
      setNavigationCount(0);
    }
  }, [user, navigationCount, triggerAd, isUserPanel, setNavigationCount]);

  return null;
};

export default App;
