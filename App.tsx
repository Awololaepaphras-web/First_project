
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
import UniversityList from './views/UniversityList';
import UniversityDetail from './views/UniversityDetail';
import AdminDashboard from './views/AdminDashboard';
import AdminLogin from './views/AdminLogin';
import UserUpload from './views/UserUpload';
import Withdrawal from './views/Withdrawal';
import MemoryBank from './views/MemoryBank';
import Premium from './views/Premium';
import UserAds from './views/UserAds';
import Tasks from './views/Tasks';
import Messages from './views/Messages';
import Settings from './views/Settings';
import IncomeAnalysis from './views/IncomeAnalysis';
import VideoHub from './views/VideoHub';
import VideoDetail from './views/VideoDetail';
import VideoUpload from './views/VideoUpload';
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
import FullscreenAd from './components/FullscreenAd';
import BannerAd from './components/BannerAd';
import { Database as DB } from './src/services/database';
import { User, Post, Comment, SystemConfig, University, PastQuestion, WithdrawalRequest, EarnTask, Notification, Message, Advertisement, Video, UserAnalytics, AdTimeFrame } from './types';
import { MOCK_QUESTIONS, UNIVERSITIES as INITIAL_UNIVERSITIES, UNIVERSITY_COLLEGES as INITIAL_COLLEGES, COLLEGE_DEPARTMENTS as INITIAL_DEPARTMENTS } from './constants';

const DEFAULT_CONFIG: SystemConfig = {
  isAiEnabled: true,
  isUploadEnabled: true,
  isWithdrawalEnabled: true,
  isMaintenanceMode: false,
  isCommunityEnabled: true,
  isAdsEnabled: true,
  isUserAdsEnabled: true,
  feedWeights: { engagement: 0.4, recency: 0.3, relationship: 0.1, quality: 0.1, eduRelevance: 0.1 },
  tvWeights: { views: 0.4, likes: 0.3, recency: 0.2, categoryMatch: 0.1, adEngagement: 0.1 },
  adWeights: { budget: 0.5, relevance: 0.2, performance: 0.2, targetMatch: 0.1 },
  earnRates: {
    contribution: 50,
    referral: 80,
    tvView: 100, // per 1k views
    tvLike: 50, // per 1k likes
    adClick: 200, // per 1k clicks
    arena: 5
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
  paystackPublicKey: 'pk_test_proph_academic_node_key'
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
  const [videos, setVideos] = useState<Video[]>([]);
  const [globalAds, setGlobalAds] = useState<Advertisement[]>([]);
  const [universities, setUniversities] = useState<University[]>(INITIAL_UNIVERSITIES);
  const [universityColleges, setUniversityColleges] = useState<Record<string, string[]>>(INITIAL_COLLEGES);
  const [collegeDepartments, setCollegeDepartments] = useState<Record<string, string[]>>(INITIAL_DEPARTMENTS);
  const [appLogo, setAppLogo] = useState<string>(localStorage.getItem('proph_app_logo') || '');
  const [navigationCount, setNavigationCount] = useState(0);
  const [loginTime, setLoginTime] = useState<number | null>(null);
  const [showAd, setShowAd] = useState(false);
  const [currentAd, setCurrentAd] = useState<Advertisement | null>(null);
  const [hasShownInitialAd, setHasShownInitialAd] = useState(false);

  useEffect(() => {
    const initData = async () => {
      const savedUser = DB.getSession();
      if (savedUser) {
        setUser(savedUser);
        // Fetch monetization status from backend
        fetch(`/api/monetization/status/${savedUser.id}?followers=${savedUser.followers?.length || 0}&impressions=${savedUser.engagementStats?.totalMediaViews || 0}`)
          .then(res => res.json())
          .then(data => {
            setUser(prev => prev ? { ...prev, monetization: data } : null);
          })
          .catch(err => console.error("Failed to fetch monetization status", err));
      }
      
      const savedConfig = localStorage.getItem('proph_system_config');
      if (savedConfig) setConfig(JSON.parse(savedConfig));
      
      const savedPosts = await DB.getFeed();
      if (savedPosts.length > 0) setPosts(savedPosts);
      
      const savedUsers = await DB.getUsers();
      if (savedUsers.length > 0) setAllUsers(savedUsers);
      
      const savedMessages = localStorage.getItem('proph_messages');
      if (savedMessages) setMessages(JSON.parse(savedMessages));
      
      const savedVideos = await DB.getTV();
      if (savedVideos.length > 0) setVideos(savedVideos);
      
      const savedDocs = await DB.getDocuments();
      if (savedDocs.length > 0) setQuestions(savedDocs);
      
      const savedAds = localStorage.getItem('proph_ads');
      if (savedAds) setGlobalAds(JSON.parse(savedAds));
    };

    initData();

    // Realtime Subscriptions
    const feedSub = DB.subscribeToFeed((payload) => {
      if (payload.eventType === 'INSERT') {
        setPosts(prev => [payload.new as Post, ...prev.filter(p => p.id !== payload.new.id)]);
      } else if (payload.eventType === 'UPDATE') {
        setPosts(prev => prev.map(p => p.id === payload.new.id ? payload.new as Post : p));
      } else if (payload.eventType === 'DELETE') {
        setPosts(prev => prev.filter(p => p.id !== payload.old.id));
      }
    });

    const tvSub = DB.subscribeToTV((payload) => {
      if (payload.eventType === 'INSERT') {
        setVideos(prev => [payload.new as Video, ...prev.filter(v => v.id !== payload.new.id)]);
      } else if (payload.eventType === 'UPDATE') {
        setVideos(prev => prev.map(v => v.id === payload.new.id ? payload.new as Video : v));
      } else if (payload.eventType === 'DELETE') {
        setVideos(prev => prev.filter(v => v.id !== payload.old.id));
      }
    });

    return () => {
      feedSub.unsubscribe();
      tvSub.unsubscribe();
    };
  }, []);

  // Real-time Messages Subscription
  useEffect(() => {
    if (!user) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      const initialMessages = await DB.getMessages(user.id);
      setMessages(initialMessages.map(m => ({
        id: m.id,
        senderId: m.sender_id,
        receiverId: m.receiver_id,
        text: m.text,
        timestamp: new Date(m.created_at).getTime()
      })));
    };
    fetchMessages();

    // Subscribe to new messages
    const msgSub = DB.subscribeToMessages(user.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        const newMessage = payload.new;
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, {
            id: newMessage.id,
            senderId: newMessage.sender_id,
            receiverId: newMessage.receiver_id,
            text: newMessage.text,
            timestamp: new Date(newMessage.created_at).getTime()
          }];
        });
      }
    });

    return () => {
      msgSub.unsubscribe();
    };
  }, [user]);

  useEffect(() => { DB.saveFeed(posts); }, [posts]);
  useEffect(() => { DB.saveUsers(allUsers); }, [allUsers]);
  useEffect(() => { DB.saveTV(videos); }, [videos]);
  useEffect(() => { DB.saveDocuments(questions); }, [questions]);
  useEffect(() => { localStorage.setItem('proph_ads', JSON.stringify(globalAds)); }, [globalAds]);
  useEffect(() => { localStorage.setItem('proph_system_config', JSON.stringify(config)); }, [config]);
  useEffect(() => { DB.saveSession(user); }, [user]);

  const handleSaveConfig = async () => {
    try {
      await DB.saveConfig(config);
      alert("System Matrix Synchronized with Supabase.");
    } catch (error) {
      console.error("Sync Error:", error);
      alert("Synchronization Failed. Check network connection.");
    }
  };

  const triggerAd = useCallback(() => {
    const now = new Date();
    const hour = now.getHours();
    let currentTimeFrame: AdTimeFrame = '12am-6am';
    if (hour >= 6 && hour < 12) currentTimeFrame = '6am-12pm';
    else if (hour >= 12 && hour < 18) currentTimeFrame = '12pm-6pm';
    else if (hour >= 18) currentTimeFrame = '6pm-12am';

    const validAds = globalAds.filter(ad => {
      if (!ad.timeFrames || ad.timeFrames.length === 0) return true;
      return ad.timeFrames.includes(currentTimeFrame);
    });

    if (validAds.length > 0) {
      // Only trigger popup ads for FullscreenAd
      const popupAds = validAds.filter(ad => ad.adType === 'popup');
      if (popupAds.length > 0) {
        const randomAd = popupAds[Math.floor(Math.random() * popupAds.length)];
        setCurrentAd(randomAd);
        setShowAd(true);
      }
    }
  }, [globalAds]);

  const handlePost = (content: string, mediaUrl?: string, mediaType?: 'image' | 'video', parentId?: string) => {
    if (!user) return;
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      userNickname: user.nickname,
      userUniversity: user.university,
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

  const handleLikeVideo = (videoId: string) => {
    if (!user) return;
    setVideos(prev => prev.map(v => {
      if (v.id !== videoId) return v;
      const alreadyLiked = v.likes.includes(user.id);
      const newLikes = alreadyLiked ? v.likes.filter(id => id !== user.id) : [...v.likes, user.id];
      const updatedVideo = { ...v, likes: newLikes };
      DB.saveVideo(updatedVideo);
      return updatedVideo;
    }));
  };

  const handleShareVideo = (videoId: string) => {
    setVideos(prev => prev.map(v => {
      if (v.id !== videoId) return v;
      const updatedVideo = { ...v, shares: v.shares + 1 };
      DB.saveVideo(updatedVideo);
      return updatedVideo;
    }));
  };

  const trackEngagement = (postId: string, type: 'like' | 'repost' | 'reply' | 'link' | 'profile' | 'media', text?: string) => {
    if (!user) return;
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
        const newComment: Comment = {
          id: Math.random().toString(36).substr(2, 9),
          userId: user.id,
          userName: user.name,
          text,
          createdAt: Date.now(),
          likes: []
        };
        comments = [...comments, newComment];
      }

      const updatedPost = { ...p, stats, likes, reposts, comments };
      DB.savePost(updatedPost);
      return updatedPost;
    }));

    setAllUsers(prev => prev.map(u => {
      if (u.id !== user.id) return u;
      const es = u.engagementStats || { totalLikesGiven: 0, totalRepliesGiven: 0, totalRepostsGiven: 0, totalLinkClicks: 0, totalProfileClicks: 0, totalMediaViews: 0 };
      if (type === 'like') es.totalLikesGiven++;
      if (type === 'repost') es.totalRepostsGiven++;
      if (type === 'reply') es.totalRepliesGiven++;
      if (type === 'link') es.totalLinkClicks++;
      if (type === 'profile') es.totalProfileClicks++;
      if (type === 'media') es.totalMediaViews++;
      return { ...u, engagementStats: es };
    }));
  };

  const handleFollow = (targetUserId: string) => {
    if (!user || user.id === targetUserId) return;
    
    const isFollowing = user.following?.includes(targetUserId);
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
    <Router>
      <AdController 
        user={user} 
        loginTime={loginTime} 
        navigationCount={navigationCount} 
        setNavigationCount={setNavigationCount}
        hasShownInitialAd={hasShownInitialAd}
        setHasShownInitialAd={setHasShownInitialAd}
        triggerAd={triggerAd}
      />
      <Layout user={user} onLogout={() => { setUser(null); localStorage.removeItem('proph_session_user'); }} notifications={notifications} onSelectTrend={()=>{}} appLogo={appLogo} onSaveConfig={handleSaveConfig}>
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
          
          <Route path="/dashboard" element={user ? <Dashboard user={user} questions={questions} activeBadges={[]} /> : <Navigate to="/login" />} />
          <Route path="/community" element={user ? <Community user={user} posts={posts} globalAds={globalAds} onPost={handlePost} onLike={(id) => trackEngagement(id, 'like')} onRepost={(id) => trackEngagement(id, 'repost')} onComment={(id, text) => { trackEngagement(id, 'reply', text); }} onLikeComment={()=>{}} onFollow={handleFollow} onDeletePost={handleDeletePost} onEditPost={handleEditPost} /> : <Navigate to="/login" />} />
          <Route path="/messages" element={user ? <Messages user={user} messages={messages} onSendMessage={async (t, r) => {
            const newMsg = {
              sender_id: user.id,
              receiver_id: r,
              text: t
            };
            // Optimistic update
            const tempId = Math.random().toString();
            setMessages([...messages, { 
              id: tempId, 
              senderId: user.id, 
              receiverId: r, 
              text: t, 
              timestamp: Date.now() 
            }]);
            await DB.sendMessage(newMsg);
          }} /> : <Navigate to="/login" />} />
          <Route path="/ai-assistant" element={user ? <AIAssistant /> : <Navigate to="/login" />} />
          <Route path="/memory-bank" element={user ? <MemoryBank onAction={(c) => setUser({...user!, points: (user!.points || 0) + (c * 10)})} /> : <Navigate to="/login" />} />
          <Route path="/study-hub" element={user ? <StudyHub onAction={()=>{}} /> : <Navigate to="/login" />} />
          <Route path="/gladiator-hub" element={user ? <GladiatorLanding user={user} /> : <Navigate to="/login" />} />
          <Route path="/gladiator-hub/arena" element={user ? <LocalHub user={user} onJoin={()=>{}} /> : <Navigate to="/login" />} />
          <Route path="/gladiator-hub/vault" element={user ? <GladiatorVault user={user} /> : <Navigate to="/login" />} />
          <Route path="/gladiator-hub/creator" element={user ? <GladiatorCreatorDashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/gladiator-hub/advertiser" element={user ? <GladiatorAdDashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/gladiator-hub/competition" element={user ? <GladiatorPool user={user} onCommit={()=>{}} /> : <Navigate to="/login" />} />
          <Route path="/video-hub" element={user ? <VideoHub videos={videos} /> : <Navigate to="/login" />} />
          <Route path="/video/upload" element={user ? <VideoUpload user={user} onUpload={(v) => { setVideos([v, ...videos]); DB.saveVideo(v); }} /> : <Navigate to="/login" />} />
          <Route path="/video/:id" element={user ? <VideoDetail videos={videos} user={user} onLike={handleLikeVideo} onShare={handleShareVideo} /> : <Navigate to="/login" />} />
          <Route path="/income-analysis" element={user ? <IncomeAnalysis user={user} analytics={[]} /> : <Navigate to="/login" />} />
          <Route path="/monetization" element={user ? <AdRevenueSharing user={user} /> : <Navigate to="/login" />} />
          <Route path="/settings" element={user ? <Settings user={user} onUpdateUser={setUser} /> : <Navigate to="/login" />} />
          <Route path="/withdraw" element={user ? <Withdrawal user={user} isEnabled={config.isWithdrawalEnabled} conversionRate={config.nairaPerPoint} onAddRequest={req => setWithdrawalRequests([req, ...withdrawalRequests])} requests={withdrawalRequests} /> : <Navigate to="/login" />} />
          <Route path="/upload" element={user ? <UserUpload user={user} isEnabled={config.isUploadEnabled} onUpload={q => setQuestions([q, ...questions])} onToggleCompletion={()=>{}} universityColleges={universityColleges} collegeDepartments={collegeDepartments} /> : <Navigate to="/login" />} />
          <Route path="/anonymous-upload" element={<AnonymousUpload isEnabled={config.isUploadEnabled} onUpload={q => setQuestions([q, ...questions])} universityColleges={universityColleges} collegeDepartments={collegeDepartments} />} />
          <Route path="/tasks" element={user ? <Tasks user={user} tasks={tasks} /> : <Navigate to="/login" />} />
          <Route path="/universities" element={user ? <UniversityList user={user} universities={universities} /> : <Navigate to="/login" />} />
          <Route path="/university/:id" element={user ? <UniversityDetail user={user} questions={questions} universities={universities} universityColleges={universityColleges} collegeDepartments={collegeDepartments} /> : <Navigate to="/login" />} />
          <Route path="/advertise" element={
            user ? (
              config.isUserAdsEnabled ? (
                <UserAds 
                  user={user} 
                  pricing={config.adPricing} 
                  onDeploy={(ad) => setGlobalAds([{ ...ad, id: Math.random().toString(), createdAt: Date.now() } as Advertisement, ...globalAds])} 
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

          <Route path="/admin" element={
            user && (user.role === 'admin' || user.role === 'sub-admin') ? (
              <AdminDashboard 
                user={user} config={config} allUsers={allUsers} questions={questions} withdrawalRequests={withdrawalRequests} tasks={tasks}
                onUpdateConfig={setConfig} onUpdateUsers={setAllUsers} onAddTask={t => setTasks([t, ...tasks])} onDeleteTask={id => setTasks(tasks.filter(t => t.id !== id))}
                onDeleteQuestion={id => setQuestions(questions.filter(q => q.id !== id))} onDeleteUser={id => setAllUsers(allUsers.filter(u => u.id !== id))}
                onBroadcast={n => setNotifications([n, ...notifications])} universities={universities} universityColleges={universityColleges} collegeDepartments={collegeDepartments}
                onAddUniversity={(u) => setUniversities([...universities, u])} onRemoveUniversity={(id) => setUniversities(universities.filter(u => u.id !== id))}
                onAddCollege={(uid, c) => setUniversityColleges({...universityColleges, [uid]: [...(universityColleges[uid] || []), c]})}
                onRemoveCollege={(uid, c) => setUniversityColleges({...universityColleges, [uid]: (universityColleges[uid] || []).filter(x => x !== c)})}
                onAddDept={(c, d) => setCollegeDepartments({...collegeDepartments, [c]: [...(collegeDepartments[c] || []), d]})}
                onRemoveDept={(c, d) => setCollegeDepartments({...collegeDepartments, [c]: (collegeDepartments[c] || []).filter(x => x !== d)})}
                onApproveQuestion={(id) => setQuestions(prev => prev.map(q => q.id === id ? { ...q, status: 'approved' } : q))}
                onApproveWithdrawal={(id) => setWithdrawalRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r))}
                onRejectWithdrawal={(id) => setWithdrawalRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r))}
                globalAds={globalAds} onAddAd={(ad) => setGlobalAds([ad, ...globalAds])} onDeleteAd={(id) => setGlobalAds(globalAds.filter(a => a.id !== id))}
                onUpdateUniversity={(uid, up) => setUniversities(prev => prev.map(u => u.id === uid ? {...u, ...up} : u))}
                onUpdateLogo={setAppLogo}
                onLogout={() => { setUser(null); localStorage.removeItem('proph_session_user'); }}
              />
            ) : ( <AdminLogin onLogin={setUser} allUsers={allUsers} /> )
          } />
          <Route path="/admin/payments" element={user && (user.role === 'admin' || user.role === 'sub-admin') ? <AdminPaymentVerification user={user} /> : <Navigate to="/admin" />} />
        </Routes>
      </Layout>
      {showAd && currentAd && (
        <FullscreenAd ad={currentAd} onClose={() => setShowAd(false)} />
      )}
    </Router>
  );
};

const AdController: React.FC<{
  user: User | null;
  loginTime: number | null;
  navigationCount: number;
  setNavigationCount: (c: number | ((prev: number) => number)) => void;
  hasShownInitialAd: boolean;
  setHasShownInitialAd: (b: boolean) => void;
  triggerAd: () => void;
}> = ({ user, loginTime, navigationCount, setNavigationCount, hasShownInitialAd, setHasShownInitialAd, triggerAd }) => {
  const { pathname } = useLocation();
  
  const isUserPanel = pathname.startsWith('/dashboard') || 
                      pathname.startsWith('/community') || 
                      pathname.startsWith('/messages') || 
                      pathname.startsWith('/memory-bank') || 
                      pathname.startsWith('/video-hub') || 
                      pathname.startsWith('/withdraw') || 
                      pathname.startsWith('/upload') || 
                      pathname.startsWith('/tasks') || 
                      pathname.startsWith('/universities') || 
                      pathname.startsWith('/settings') || 
                      pathname.startsWith('/income-analysis') || 
                      pathname.startsWith('/monetization') || 
                      pathname.startsWith('/advertise') || 
                      pathname.startsWith('/premium') || 
                      pathname.startsWith('/earn-manual');

  useEffect(() => {
    setNavigationCount(prev => prev + 1);
  }, [pathname, setNavigationCount]);

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
  }, [user, loginTime, hasShownInitialAd, triggerAd, isUserPanel]);

  useEffect(() => {
    if (user && navigationCount >= 7 && isUserPanel) {
      triggerAd();
      setNavigationCount(0);
    }
  }, [user, navigationCount, triggerAd, isUserPanel]);

  return null;
};

export default App;
