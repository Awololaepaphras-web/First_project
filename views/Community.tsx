
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  MessageCircle, Heart, Share2, ShieldCheck, 
  MoreHorizontal, Repeat2, X, Trash2, Loader2, 
  BarChart, Image as ImageIcon, Twitter, Facebook, Instagram, Ghost, MessageSquare,
  Search, Edit3, Check, AlertCircle, TrendingUp, Megaphone, ExternalLink, Coins,
  RefreshCw, Crown, Gem, Award, CheckCircle2, Zap
} from 'lucide-react';
import VideoEmbed from '../src/components/VideoEmbed';
import { User, Post, PostComment, Advertisement, Report, SystemConfig } from '../types';
import { CloudinaryService } from '../src/services/cloudinaryService';
import { SupabaseService } from '../src/services/supabaseService';
import { useRealtimeFeed } from '../src/services/useRealtimeFeed';
import { Lightbox } from '../src/components/Lightbox';

interface CommunityProps {
  user: User;
  allUsers: User[];
  posts: Post[];
  wallet?: { prophy_points: number } | null;
  globalAds?: Advertisement[];
  config: SystemConfig;
  onPost: (content: string, mediaUrl?: string, mediaType?: 'image' | 'video', parentId?: string) => void;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onLikeComment: (postId: string, commentId: string) => void;
  onFollow: (userId: string) => void;
  onDeletePost: (postId: string) => void;
  onEditPost: (postId: string, content: string) => void;
  onShare: (postId: string) => void;
  onRenewPost: (postId: string) => void;
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

const BannerAd: React.FC<{ ad: Advertisement }> = ({ ad }) => (
  <div className="p-4 border-b border-brand-border bg-brand-proph/5 animate-fade-in">
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-brand-proph p-1 rounded text-[8px] font-black uppercase text-black">Ad</div>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
            {ad.isSponsored ? 'Sponsored' : 'Not Sponsored'}
          </span>
        </div>
        <span className="text-[10px] font-black italic text-brand-proph">{ad.title}</span>
      </div>
      <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-2xl border border-brand-proph/20 aspect-[3/1]">
        {ad.mediaType === 'image' ? (
          <img src={CloudinaryService.getOptimizedUrl(ad.mediaUrl)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={ad.title} referrerPolicy="no-referrer" />
        ) : (
          <video src={ad.mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
          <div className="flex justify-between items-center w-full">
            <p className="text-xs font-bold text-white line-clamp-1">{ad.description}</p>
            <div className="bg-brand-proph text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-brand-proph/20">
              Learn More <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>
      </a>
    </div>
  </div>
);

const NativeAd: React.FC<{ ad: Advertisement }> = ({ ad }) => (
  <div className="p-4 border-b border-brand-border hover:bg-black/[0.05] dark:hover:bg-brand-black transition-colors cursor-pointer group relative overflow-hidden">
    <div className="absolute top-0 left-0 w-1 h-full bg-brand-proph shadow-[0_0_15px_rgba(0,186,124,0.6)]" />
    <div className="flex gap-3">
      <div className="w-12 h-12 rounded-full bg-brand-proph/20 flex-shrink-0 flex items-center justify-center font-black overflow-hidden shadow-[inset_0_0_10px_rgba(0,186,124,0.2)]">
        <Megaphone className="w-6 h-6 text-brand-proph drop-shadow-[0_0_8px_rgba(0,186,124,0.4)]" />
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-black text-[15px] truncate text-gray-900 dark:text-white flex items-center gap-1 relative">
              {ad.isSponsored ? 'Sponsored' : 'Promoted'}
              <span className="absolute -inset-1 bg-brand-proph/10 blur-sm rounded-full -z-10" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-proph animate-pulse shadow-[0_0_12px_rgba(0,186,124,1)]" />
            </span>
            <ShieldCheck className="w-4 h-4 text-brand-proph flex-shrink-0" />
            <span className="text-brand-muted text-[15px] truncate">@{ad.isSponsored ? 'sponsored' : 'partner'}</span>
          </div>
        </div>
        <div className="mt-1 text-[15px] text-gray-900 dark:text-white leading-normal font-bold italic break-words break-all">{ad.title}</div>
        {ad.mediaUrl && (
          <div className="mt-4 rounded-[2rem] overflow-hidden border border-brand-border bg-black/5 shadow-inner relative group/media">
            <div className="absolute inset-0 bg-brand-proph/5 opacity-0 group-hover/media:opacity-100 transition-opacity pointer-events-none" />
            {ad.mediaType === 'image' ? (
              <img src={CloudinaryService.getOptimizedUrl(ad.mediaUrl)} className="w-full h-auto max-h-[600px] object-cover" alt="Ad" referrerPolicy="no-referrer" />
            ) : (
              <video src={ad.mediaUrl} className="w-full h-auto max-h-[600px]" controls />
            )}
          </div>
        )}
        <div className="mt-4">
          <a 
            href={ad.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block w-full text-center py-3 bg-brand-proph text-black font-black rounded-2xl text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,186,124,0.2)] hover:shadow-[0_0_30px_rgba(0,186,124,0.4)]"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  </div>
);

const Community: React.FC<CommunityProps> = ({ user, allUsers, posts: initialPosts, wallet, globalAds = [], config, onPost, onLike, onRepost, onComment, onLikeComment, onFollow, onDeletePost, onEditPost, onShare, onRenewPost }) => {
  const { posts, setPosts } = useRealtimeFeed(initialPosts);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'trends' | 'node'>('all');
  const [newPostContent, setNewPostContent] = useState('');
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [showShareMenu, setShowShareMenu] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [mediaFile, setMediaFile] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [tippingUser, setTippingUser] = useState<{ id: string, name: string } | null>(null);
  const [tipAmount, setTipAmount] = useState(10);
  const [isTippingInProgress, setIsTippingInProgress] = useState(false);
  const [reportingPost, setReportingPost] = useState<Post | null>(null);
  const [topChats, setTopChats] = useState<any[]>([]);
  const [loadingTopChats, setLoadingTopChats] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Handle Trends tab and post highlighting from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'trends') {
      setActiveTab('trends');
    }
    const postId = params.get('post');
    if (postId) {
      setSelectedTrend(postId);
      setActiveTab('all');
    }
  }, [location.search]);

  useEffect(() => {
    if (activeTab === 'trends') {
      const fetchTopChats = async () => {
        setLoadingTopChats(true);
        const chats = await SupabaseService.getTopEngagedChats();
        setTopChats(chats);
        setLoadingTopChats(false);
      };
      fetchTopChats();
    }
  }, [activeTab]);

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.userNickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTrend = !selectedTrend || 
      p.content.toLowerCase().includes(selectedTrend.toLowerCase()) ||
      p.id === selectedTrend;

    const isBlocked = user.blockedUsers?.includes(p.userId);
    if (isBlocked) return false;

    if (activeTab === 'following') {
      return matchesSearch && matchesTrend && user.following?.includes(p.userId);
    }
    if (activeTab === 'node') {
      return matchesSearch && matchesTrend && p.userUniversity === user.university;
    }
    return matchesSearch && matchesTrend;
  });

  const trendingPosts = [...posts]
    .filter(p => {
      const content = p.content.trim();
      const hasCashtag = content.startsWith('$') || content.endsWith('$');
      return hasCashtag && (p.likes?.length || 0) + (p.comments?.length || 0) + (p.reposts?.length || 0) >= 3;
    })
    .sort((a, b) => {
      const bScore = (b.likes?.length || 0) + (b.comments?.length || 0) + (b.reposts?.length || 0);
      const aScore = (a.likes?.length || 0) + (a.comments?.length || 0) + (a.reposts?.length || 0);
      return bScore - aScore;
    })
    .slice(0, 5);

  const extractKeywords = (content: string) => {
    const words = content.split(/\s+/);
    return words.filter(w => {
      const clean = w.replace(/[^a-zA-Z$]/g, '');
      return (clean.startsWith('$') || clean.endsWith('$')) && 
             !['about', 'there', 'their', 'would'].includes(clean.toLowerCase());
    });
  };

  const allKeywords = posts.flatMap(p => extractKeywords(p.content));
  
  const renderContentWithTags = (content: string) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const nickname = part.substring(1);
        const taggedUser = allUsers.find(u => u.nickname === nickname || u.name === nickname);
        return (
          <span 
            key={i} 
            className="text-brand-proph font-black cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              if (taggedUser) {
                // Navigate to user profile or show info
                setSelectedTrend(taggedUser.id);
                setActiveTab('all');
              }
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const keywordCounts = allKeywords.reduce((acc, word) => {
    // Preserve $ at start or end
    const cleanWord = word.replace(/[^a-zA-Z$]/g, '');
    if (cleanWord.length > 3 || cleanWord.startsWith('$') || cleanWord.endsWith('$')) {
      acc[cleanWord] = (acc[cleanWord] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const trendingKeywords = Object.entries(keywordCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 6)
    .map(([word, count]) => {
      const isCashtag = word.startsWith('$') || word.endsWith('$');
      return { 
        tag: isCashtag ? word : `$${word}`, 
        posts: count, 
        category: isCashtag ? 'Cashtag' : 'App' 
      };
    });

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && !mediaFile) return;
    onPost(newPostContent, mediaFile?.url, mediaFile?.type);
    setNewPostContent('');
    setMediaFile(null);
  };

  const handleReplyClick = (postId: string) => {
    setShowComments(prev => ({ ...prev, [postId]: true }));
    setTimeout(() => {
      commentInputRefs.current[postId]?.focus();
    }, 100);
  };

  const handleShare = (platform: string, post: Post) => {
    const text = encodeURIComponent(`Check out this post on PROPH by ${post.userName}: ${post.content}`);
    const url = encodeURIComponent(window.location.href);
    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct link sharing via URL, usually copy to clipboard
        alert('Link copied to clipboard! You can now paste it on Instagram.');
        navigator.clipboard.writeText(`${post.content} ${window.location.href}`);
        break;
      case 'snapchat':
        // Snapchat also doesn't have a simple web share URL for content
        alert('Link copied to clipboard! You can now paste it on Snapchat.');
        navigator.clipboard.writeText(`${post.content} ${window.location.href}`);
        break;
    }

    if (shareUrl) window.open(shareUrl, '_blank');
    onShare(post.id);
    setShowShareMenu(null);
  };

  const handleTip = async () => {
    if (!tippingUser) return;
    setIsTippingInProgress(true);
    const result = await SupabaseService.transferPoints(user.id, tippingUser.id, tipAmount);
    if (result.success) {
      alert(`Successfully tipped ${tipAmount} coins to ${tippingUser.name}!`);
      setTippingUser(null);
    } else {
      alert(result.error);
    }
    setIsTippingInProgress(false);
  };

  const handleBlockUser = async (targetId: string) => {
    if (!window.confirm('Are you sure you want to block this user? Their posts and messages will no longer be visible to you.')) return;
    const result = await SupabaseService.blockUser(user.id, targetId);
    if (result.success) {
      alert('User blocked successfully.');
      window.location.reload(); // Refresh to update feed
    } else {
      alert('Failed to block user.');
    }
  };

  const handleReportSubmit = async () => {
    if (!reportReason) {
      alert('Please select a reason for reporting.');
      return;
    }
    setIsReporting(true);
    const report: Partial<Report> = {
      reporterId: user.id,
      targetId: reportingPost?.id,
      targetType: 'post',
      reason: reportReason,
      details: reportDetails,
    };
    const result = await SupabaseService.submitReport(report);
    if (result.success) {
      alert('Report submitted successfully. Our moderators will review it.');
      setReportingPost(null);
      setReportReason('');
      setReportDetails('');
    } else {
      alert('Failed to submit report.');
    }
    setIsReporting(false);
  };

  return (
    <div className="w-full max-w-full mx-auto border-x border-brand-border min-h-screen bg-white dark:bg-brand-black pb-32">
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-brand-black/80 backdrop-blur-md border-b border-brand-border p-4 flex items-center justify-between gap-4">
         <h2 className="text-xl font-black italic tracking-tighter uppercase whitespace-nowrap text-gray-900 dark:text-white">Social Hub</h2>
         <div className="relative flex-grow max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search users or posts..."
              className="w-full bg-brand-border/30 dark:bg-white/5 border border-transparent focus:border-brand-proph/50 rounded-full py-2 pl-10 pr-4 text-xs font-bold outline-none transition-all dark:text-white"
            />
         </div>
         <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-proph/10 border border-brand-proph/20 rounded-full">
                <Coins className="w-3.5 h-3.5 text-brand-proph" />
                <span className="text-[11px] font-black text-brand-proph uppercase tracking-tighter">
                  {((user?.dailyPoints || 0) + (user?.points || 0)).toLocaleString()}
                </span>
              </div>
              {(user?.dailyPoints || 0) > 0 && (
                <span className="text-[7px] font-black text-brand-proph uppercase tracking-widest mt-0.5">
                  +{user.dailyPoints} Daily
                </span>
              )}
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-0.5">Prophy Points</span>
            </div>
         </div>
      </div>

      <div className="flex border-b border-brand-border sticky top-[73px] lg:top-[81px] z-30 bg-white/80 dark:bg-brand-black/80 backdrop-blur-md">
        <button 
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'all' ? 'text-brand-proph' : 'text-brand-muted hover:text-gray-900 dark:hover:text-white'}`}
        >
          All Feeds
          {activeTab === 'all' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-proph" />}
        </button>
        <button 
          onClick={() => setActiveTab('following')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'following' ? 'text-brand-proph' : 'text-brand-muted hover:text-gray-900 dark:hover:text-white'}`}
        >
          Following
          {activeTab === 'following' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-proph" />}
        </button>
        <button 
          onClick={() => setActiveTab('node')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'node' ? 'text-brand-proph' : 'text-brand-muted hover:text-gray-900 dark:hover:text-white'}`}
        >
          My Node
          {activeTab === 'node' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-proph" />}
        </button>
        <button 
          onClick={() => setActiveTab('trends')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'trends' ? 'text-brand-proph' : 'text-brand-muted hover:text-gray-900 dark:hover:text-white'}`}
        >
          Trends
          {activeTab === 'trends' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-proph" />}
        </button>
      </div>

      <div className="p-4 border-b border-brand-border">
        <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-border overflow-hidden flex-shrink-0 text-gray-900 dark:text-white">
                {user.profilePicture ? <img src={CloudinaryService.getOptimizedUrl(user.profilePicture)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">{user.name.charAt(0)}</div>}
            </div>
            <div className="flex-grow pt-2">
                {showPreview ? (
                  <div className="w-full bg-brand-proph/5 rounded-2xl p-4 border border-brand-proph/20 min-h-[100px] animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-proph bg-brand-proph/10 px-2 py-0.5 rounded">Preview Mode</span>
                    </div>
                    <div className="text-xl text-gray-900 dark:text-white leading-normal whitespace-pre-wrap break-words break-all italic font-bold">
                      {renderContentWithTags(newPostContent || "Your intellectual synchronization will appear here...")}
                    </div>
                  </div>
                ) : (
                  <textarea 
                      value={newPostContent}
                      onChange={e => {
                        const val = e.target.value.replace(/[^a-zA-Z0-9$.,!? \n]/g, '');
                        setNewPostContent(val);
                      }}
                      placeholder="Synchronize scholarly thought..."
                      className="w-full bg-transparent text-xl border-none outline-none resize-none min-h-[100px] placeholder:text-brand-muted text-gray-900 dark:text-white"
                  />
                )}
                {mediaFile && (
                    <div className="relative mt-3 rounded-2xl overflow-hidden border border-brand-border">
                        {mediaFile.type === 'image' ? <img src={CloudinaryService.getOptimizedUrl(mediaFile.url)} className="w-full h-auto object-cover" /> : <video src={mediaFile.url} className="w-full h-auto" controls />}
                        <button disabled={isUploading} onClick={() => setMediaFile(null)} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 disabled:opacity-50" title="Remove Media"><X className="w-4 h-4" /></button>
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-brand-proph animate-spin" />
                          </div>
                        )}
                    </div>
                )}
                <div className="flex justify-between items-center mt-4 border-t border-brand-border/30 pt-3">
                    <div className="flex items-center gap-2">
                      <button disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="p-2 text-brand-proph hover:bg-brand-proph/10 rounded-full disabled:opacity-50" title="Attach Media"><ImageIcon className="w-5 h-5" /></button>
                      <button 
                        onClick={() => setShowPreview(!showPreview)} 
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${showPreview ? 'bg-brand-proph text-black' : 'text-brand-muted hover:bg-black/5 dark:hover:bg-white/5'}`}
                        title="Toggle Preview"
                      >
                        {showPreview ? 'Edit' : 'Preview'}
                      </button>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${newPostContent.length > 280 ? 'text-red-500' : 'text-brand-muted'}`}>
                        {newPostContent.length}/280
                      </span>
                    </div>
                    <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={async (e) => {
                       const file = e.target.files?.[0];
                       if(file) {
                          const isVideo = file.type.startsWith('video/');
                          
                          if (isVideo) {
                            // Check video duration
                            const video = document.createElement('video');
                            video.preload = 'metadata';
                            video.onloadedmetadata = async () => {
                              window.URL.revokeObjectURL(video.src);
                              if (video.duration > 30) {
                                alert('Video duration cannot exceed 30 seconds.');
                                setIsUploading(false);
                                return;
                              }
                              
                              setIsUploading(true);
                              try {
                                const url = await CloudinaryService.uploadFile(file, 'video');
                                setMediaFile({ url, type: 'video' });
                              } catch (error) {
                                console.error('Media upload failed:', error);
                                alert('Failed to upload media.');
                              } finally {
                                setIsUploading(false);
                              }
                            };
                            video.src = URL.createObjectURL(file);
                            return;
                          }

                          setIsUploading(true);
                          try {
                            const type = 'image';
                            const url = await CloudinaryService.uploadFile(file, type);
                            setMediaFile({ url, type });
                          } catch (error) {
                            console.error('Media upload failed:', error);
                            alert('Failed to upload media.');
                          } finally {
                            setIsUploading(false);
                          }
                       }
                    }} />
                    <button disabled={isUploading} onClick={handlePostSubmit} className="bg-brand-proph text-black font-black px-6 py-2 rounded-full text-sm hover:brightness-110 active:scale-95 shadow-md disabled:opacity-50" title="Broadcast Post">
                      {isUploading ? 'Uploading...' : 'Post'}
                    </button>
                </div>
            </div>
        </div>
      </div>

       <div className="divide-y divide-brand-border">
        {selectedTrend && (
          <div className="p-4 bg-brand-proph/10 border-b border-brand-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-brand-proph" />
              <span className="font-black uppercase tracking-widest text-xs text-gray-900 dark:text-white">Filtering by: {selectedTrend}</span>
            </div>
            <button 
              onClick={() => setSelectedTrend(null)}
              className="p-1 hover:bg-brand-proph/20 rounded-full transition-all"
            >
              <X className="w-4 h-4 text-brand-proph" />
            </button>
          </div>
        )}
        {activeTab === 'trends' && !selectedTrend ? (
          <div className="p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-proph/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,186,124,0.2)]">
                  <TrendingUp className="w-6 h-6 text-brand-proph" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter italic text-gray-900 dark:text-white">Trending Topics</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Real-time intellectual momentum</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendingKeywords.map((trend, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedTrend(trend.tag)}
                    className="group relative p-6 rounded-[2rem] border border-brand-border bg-black/[0.02] dark:bg-white/[0.02] hover:bg-brand-proph/5 hover:border-brand-proph/30 transition-all text-left overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                      <TrendingUp className="w-12 h-12 text-brand-proph" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-proph px-2 py-0.5 bg-brand-proph/10 rounded-full">{trend.category}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">#{idx + 1} Trending</span>
                      </div>
                      <div className="text-2xl font-black italic tracking-tighter text-gray-900 dark:text-white group-hover:text-brand-proph transition-colors">{trend.tag}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-brand-muted mt-2">{trend.posts} Synchronizations</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-proph/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,186,124,0.2)]">
                  <MessageSquare className="w-6 h-6 text-brand-proph" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter italic text-gray-900 dark:text-white">Top Engaged Chats</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Most active encrypted links</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loadingTopChats ? (
                  <div className="col-span-full py-10 flex items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 text-brand-proph animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Syncing Matrix Chats...</span>
                  </div>
                ) : topChats.length > 0 ? (
                  topChats.map((chat, idx) => (
                    <div 
                      key={chat.id}
                      className="p-6 rounded-[2rem] border border-brand-border bg-black/[0.02] dark:bg-white/[0.02] hover:border-brand-proph/30 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex -space-x-3">
                          <img src={CloudinaryService.getOptimizedUrl(chat.user1.avatar || `https://ui-avatars.com/api/?name=${chat.user1.nickname}`)} className="w-10 h-10 rounded-full border-2 border-white dark:border-brand-black object-cover" alt="" />
                          <img src={CloudinaryService.getOptimizedUrl(chat.user2.avatar || `https://ui-avatars.com/api/?name=${chat.user2.nickname}`)} className="w-10 h-10 rounded-full border-2 border-white dark:border-brand-black object-cover" alt="" />
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-proph">{chat.engagementScore} Engagement</p>
                          <p className="text-[8px] text-brand-muted uppercase font-black">{chat.messageCount} Messages</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black italic text-gray-900 dark:text-white">@{chat.user1.nickname} × @{chat.user2.nickname}</p>
                        <p className="text-xs text-brand-muted truncate italic">"{chat.lastMessage}"</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-10 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">No high-engagement chats detected.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-proph/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,186,124,0.2)]">
                  <MessageCircle className="w-6 h-6 text-brand-proph" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter italic text-gray-900 dark:text-white">Viral Synchronizations</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">High-impact scholarly discourse</p>
                </div>
              </div>

              <div className="space-y-4">
                {trendingPosts.map((post) => (
                  <div 
                    key={post.id}
                    onClick={() => setSelectedTrend(post.id)}
                    className="p-6 rounded-[2rem] border border-brand-border bg-black/[0.02] dark:bg-white/[0.02] hover:bg-brand-proph/5 hover:border-brand-proph/30 transition-all cursor-pointer group"
                  >
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-border flex-shrink-0 flex items-center justify-center font-black text-xs">{post.userName.charAt(0)}</div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-sm text-gray-900 dark:text-white">{post.userName}</span>
                          <span className="text-brand-muted text-xs">@{post.userNickname}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 italic font-bold">{post.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-brand-muted">
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                            <Heart className="w-3 h-3 text-red-500" /> {post.likes.length}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                            <MessageCircle className="w-3 h-3 text-brand-proph" /> {post.comments.length}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                            <Repeat2 className="w-3 h-3 text-green-500" /> {post.reposts.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-brand-border">
            {searchQuery && (
              <div className="p-4 bg-brand-proph/5 border-b border-brand-border animate-fade-in">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3">Matching Users</h3>
                <div className="flex flex-wrap gap-3">
                  {allUsers.filter(u => 
                    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    u.nickname.toLowerCase().includes(searchQuery.toLowerCase())
                  ).slice(0, 5).map(u => (
                    <div key={u.id} className="flex items-center gap-2 bg-white dark:bg-brand-card p-2 rounded-xl border border-brand-border hover:border-brand-proph transition-all cursor-pointer group">
                      <div className="w-8 h-8 rounded-full bg-brand-border overflow-hidden flex-shrink-0">
                        {u.profilePicture ? <img src={CloudinaryService.getOptimizedUrl(u.profilePicture)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-gray-400">{u.name.charAt(0)}</div>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black dark:text-white truncate">{u.name}</p>
                        <p className="text-[8px] text-brand-muted truncate">@{u.nickname}</p>
                      </div>
                      {u.id !== user.id && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onFollow(u.id); }}
                          className={`ml-1 p-1 rounded-full transition-all ${user.following?.includes(u.id) ? 'text-brand-proph' : 'text-brand-muted hover:text-brand-proph'}`}
                        >
                          {user.following?.includes(u.id) ? <Check className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  ))}
                  {allUsers.filter(u => 
                    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    u.nickname.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <p className="text-[10px] italic text-brand-muted">No users found matching "{searchQuery}"</p>
                  )}
                </div>
              </div>
            )}
            {filteredPosts.map((post, index) => {
            const now = new Date();
            const hour = now.getHours();
            let currentTimeFrame: any = '12am-6am';
            if (hour >= 6 && hour < 12) currentTimeFrame = '6am-12pm';
            else if (hour >= 12 && hour < 18) currentTimeFrame = '12pm-6pm';
            else if (hour >= 18) currentTimeFrame = '6pm-12am';

            const timelineAds = globalAds.filter(ad => 
              ad.status === 'active' && 
              (!ad.expiryDate || ad.expiryDate > Date.now()) &&
              ((ad.adTypes && (ad.adTypes.includes('native') || ad.adTypes.includes('banner'))) || (ad.adType === 'native' || ad.adType === 'banner')) && 
              ((ad.placements && ad.placements.includes('timeline')) || ad.placement === 'timeline') &&
              (!ad.timeFrames || ad.timeFrames.length === 0 || ad.timeFrames.includes(currentTimeFrame) || ad.timeFrames.includes('all-day'))
            );

            const showAd = index > 0 && index % 5 === 0 && timelineAds.length > 0;
            const adToShow = showAd ? timelineAds[Math.floor((index / 5) % timelineAds.length)] : null;

            return (
              <React.Fragment key={post.id}>
                {adToShow && (
                  (adToShow.adTypes?.includes('banner') || adToShow.adType === 'banner') ? <BannerAd ad={adToShow} /> : <NativeAd ad={adToShow} />
                )}
                <div className="p-4 hover:bg-black/[0.05] dark:hover:bg-brand-black transition-colors cursor-pointer group relative">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-brand-border flex-shrink-0 flex items-center justify-center font-black overflow-hidden shadow-inner">{post.userName.charAt(0)}</div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 min-w-0">
                            <span className="font-black text-[15px] truncate text-gray-900 dark:text-white hover:underline cursor-pointer" title="View Node">{post.userName}</span>
                            
                            {/* Badges */}
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              {(post.userIsVerified || post.userIsSugVerified) && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-brand-proph" title="Verified Scholar" />
                              )}
                              {post.userPremiumTier === 'premium' && (
                                <Award className="w-3.5 h-3.5 text-brand-muted" title="Premium Node" />
                              )}
                              {post.userPremiumTier === 'premium_plus' && (
                                <Crown className="w-3.5 h-3.5 text-yellow-500" title="Premium+ Node" />
                              )}
                              {post.userPremiumTier === 'alpha_premium' && (
                                <Gem className="w-3.5 h-3.5 text-blue-400" title="Alpha Premium Node" />
                              )}
                              {post.userNickname && post.userUniversity && (
                                <ShieldCheck className="w-3.5 h-3.5 text-green-500" title="Registration Complete" />
                              )}
                            </div>

                            <span className="text-brand-muted text-[15px] truncate">@{post.userNickname}</span>
                            <span className="text-brand-muted text-[15px]">•</span>
                            <span className="text-brand-proph text-[15px] font-black italic truncate max-w-[100px]" title="Node">{post.userUniversity}</span>
                            <span className="text-brand-muted text-[15px]">•</span>
                            <span className="text-brand-muted text-[15px] whitespace-nowrap" title={new Date(post.createdAt).toLocaleString()}>{formatRelativeTime(post.createdAt)}</span>
                            {post.isEdited && (
                              <span className="text-brand-muted text-[10px] font-black uppercase tracking-widest ml-1 opacity-50 italic">Edited</span>
                            )}
                            {post.userId !== user.id && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); onFollow(post.userId); }}
                                className={`ml-2 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all ${user.following?.includes(post.userId) ? 'bg-brand-border text-brand-muted' : 'bg-brand-proph text-black hover:brightness-110'}`}
                              >
                                {user.following?.includes(post.userId) ? 'Following' : 'Follow'}
                              </button>
                            )}
                        </div>
                        <div className="relative">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowOptions(showOptions === post.id ? null : post.id); }}
                            className="p-2 text-brand-muted hover:text-brand-proph rounded-full hover:bg-brand-proph/10 transition-all"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          {showOptions === post.id && (
                            <div className="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-brand-card border border-brand-border rounded-2xl shadow-2xl p-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                              {post.userId === user.id ? (
                                <>
                                  <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      setEditingPostId(post.id); 
                                      setEditContent(post.content); 
                                      setShowOptions(null); 
                                    }}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-brand-proph/10 text-brand-proph rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                                  >
                                    <Edit3 className="w-4 h-4" /> Edit Post
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onDeletePost(post.id); setShowOptions(null); }}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" /> Delete Post
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onRenewPost(post.id); setShowOptions(null); }}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-brand-proph/10 text-brand-proph rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                                  >
                                    <RefreshCw className="w-4 h-4" /> Renew Post ({config.renewPostCost || 50})
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setShowOptions(null); setReportingPost(post); }}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 text-brand-muted rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                                  >
                                    <AlertCircle className="w-4 h-4" /> Report
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleBlockUser(post.userId); setShowOptions(null); }}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                                  >
                                    <Ghost className="w-4 h-4" /> Block User
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {editingPostId === post.id ? (
                        <div className="mt-2 space-y-2" onClick={e => e.stopPropagation()}>
                          <textarea 
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            className="w-full bg-brand-border/20 dark:bg-white/5 border border-brand-proph/30 rounded-xl p-3 text-[15px] outline-none focus:ring-1 focus:ring-brand-proph dark:text-white min-h-[100px]"
                          />
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setEditingPostId(null)}
                              className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-muted hover:bg-black/5 dark:hover:bg-white/5"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => { onEditPost(post.id, editContent); setEditingPostId(null); }}
                              className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-proph text-black hover:brightness-110 flex items-center gap-2"
                            >
                              Save <Check className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1 text-[15px] text-gray-900 dark:text-white leading-normal whitespace-pre-wrap break-words break-all">
                          {renderContentWithTags(post.content)}
                          <VideoEmbed content={post.content} />
                        </div>
                      )}
                      {post.mediaUrl && (
                        <div 
                          className="mt-4 rounded-[2rem] overflow-hidden border border-brand-border bg-black/5 shadow-inner cursor-zoom-in" 
                          title="Click to expand"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (post.mediaType === 'image') setLightboxImage(post.mediaUrl || null);
                          }}
                        >
                           {post.mediaType === 'image' ? (
                             <img 
                               src={CloudinaryService.getOptimizedUrl(post.mediaUrl)} 
                               className="w-full h-auto max-h-[600px] object-cover hover:scale-[1.02] transition-transform duration-500" 
                               alt="Post media"
                             />
                           ) : (
                             <video src={post.mediaUrl} className="w-full h-auto max-h-[600px]" controls />
                           )}
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-3 max-w-md text-brand-muted">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleReplyClick(post.id); }} 
                          className={`flex items-center gap-2 group/btn transition-colors ${post.comments.some(c => c.userId === user.id) ? 'text-brand-proph' : 'hover:text-brand-proph'}`} 
                          title="Reply"
                        >
                          <div className="p-2 rounded-full group-hover/btn:bg-brand-proph/10"><MessageCircle className="w-4.5 h-4.5" /></div>
                          <span className="text-xs">{post.comments.length}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onRepost(post.id); }} className={`flex items-center gap-2 group/btn transition-colors ${post.reposts.includes(user.id) ? 'text-green-500' : 'hover:text-green-500'}`} title="Repost">
                          <div className="p-2 rounded-full group-hover/btn:bg-green-500/10"><Repeat2 className="w-4.5 h-4.5" /></div>
                          <span className="text-xs">{post.reposts.length}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onLike(post.id); }} className={`flex items-center gap-2 group/btn transition-colors ${post.likes.includes(user.id) ? 'text-red-500' : 'hover:text-red-500'}`} title="Like">
                          <div className="p-2 rounded-full group-hover/btn:bg-red-500/10"><Heart className={`w-4.5 h-4.5 ${post.likes.includes(user.id) ? 'fill-current' : ''}`} /></div>
                          <span className="text-xs">{post.likes.length}</span>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setTippingUser({ id: post.userId, name: post.userName }); }}
                          className="flex items-center gap-2 hover:text-yellow-500 group/btn transition-colors"
                          title="Tip"
                        >
                          <div className="p-2 rounded-full group-hover/btn:bg-yellow-500/10"><Coins className="w-4.5 h-4.5" /></div>
                        </button>
                        <button className="flex items-center gap-2 hover:text-brand-primary group/btn transition-colors" title="Views">
                          <div className="p-2 rounded-full group-hover/btn:bg-brand-primary/10"><BarChart className="w-4.5 h-4.5" /></div>
                          <span className="text-xs">{(post.stats.mediaViews + post.stats.linkClicks).toLocaleString()}</span>
                        </button>
                        <div className="relative">
                          <button onClick={(e) => { e.stopPropagation(); setShowShareMenu(showShareMenu === post.id ? null : post.id); }} className="p-2 hover:text-brand-primary rounded-full transition-colors" title="Share"><Share2 className="w-4 h-4" /></button>
                          {showShareMenu === post.id && (
                            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-brand-card border border-brand-border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                              <button onClick={(e) => { e.stopPropagation(); handleShare('whatsapp', post); }} className="w-full flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white"><MessageSquare className="w-4 h-4 text-green-500" /> WhatsApp</button>
                              <button onClick={(e) => { e.stopPropagation(); handleShare('twitter', post); }} className="w-full flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white"><Twitter className="w-4 h-4 text-blue-400" /> Twitter</button>
                              <button onClick={(e) => { e.stopPropagation(); handleShare('facebook', post); }} className="w-full flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white"><Facebook className="w-4 h-4 text-blue-600" /> Facebook</button>
                              <button onClick={(e) => { e.stopPropagation(); handleShare('instagram', post); }} className="w-full flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white"><Instagram className="w-4 h-4 text-pink-500" /> Instagram</button>
                              <button onClick={(e) => { e.stopPropagation(); handleShare('snapchat', post); }} className="w-full flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white"><Ghost className="w-4 h-4 text-yellow-400" /> Snapchat</button>
                            </div>
                          )}
                        </div>
                      </div>
                      {showComments[post.id] && (
                        <div className="mt-4 space-y-4 border-t border-brand-border/30 pt-4 animate-fade-in">
                          {post.comments.map(c => (
                            <div key={c.id} className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand-border flex-shrink-0 flex items-center justify-center text-[10px] font-black">{c.userName.charAt(0)}</div>
                              <div className="flex-grow">
                                <p className="text-sm font-black dark:text-white">{c.userName} <span className="font-normal text-brand-muted">@node</span></p>
                                <p className="text-sm dark:text-gray-200 mt-0.5">{renderContentWithTags(c.text)}</p>
                              </div>
                            </div>
                          ))}
                          <div className="flex gap-2 items-center">
                            <input 
                              ref={el => commentInputRefs.current[post.id] = el}
                              onChange={e => {
                                const val = e.target.value.replace(/[^a-zA-Z0-9$.,!? ]/g, '');
                                e.target.value = val;
                              }}
                              onKeyDown={e => { if(e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) { onComment(post.id, (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }} 
                              placeholder="Post your reply" 
                              className="flex-grow bg-transparent border-b border-brand-border py-2 text-sm focus:border-brand-proph outline-none dark:text-white" 
                            />
                            <button 
                              onClick={() => {
                                const input = commentInputRefs.current[post.id];
                                if (input && input.value.trim()) {
                                  onComment(post.id, input.value);
                                  input.value = '';
                                }
                              }}
                              className="bg-brand-proph text-black font-black px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-95"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
      </div>

      {/* Tip Modal */}
      {tippingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-brand-card w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-xl font-black uppercase italic mb-2">Tip {tippingUser.name}</h3>
              <p className="text-gray-500 text-sm mb-6">Support this student with some coins!</p>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[10, 50, 100, 500, 1000, 5000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setTipAmount(amount)}
                    className={`py-3 rounded-2xl font-black text-xs transition-all border-2 ${
                      tipAmount === amount 
                        ? 'bg-yellow-500 border-yellow-500 text-black shadow-lg shadow-yellow-500/20' 
                        : 'border-gray-100 dark:border-brand-border hover:border-yellow-500/50'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setTippingUser(null)}
                  className="flex-1 py-4 bg-gray-100 dark:bg-brand-card rounded-2xl font-black uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleTip}
                  disabled={isTippingInProgress}
                  className="flex-1 py-4 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-yellow-500/20 disabled:opacity-50"
                >
                  {isTippingInProgress ? 'Processing...' : 'Send Tip'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportingPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-brand-card w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black uppercase italic">Report Content</h3>
                <button onClick={() => setReportingPost(null)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="space-y-4 mb-6">
                <p className="text-sm text-brand-muted font-bold uppercase tracking-widest">Why are you reporting this?</p>
                {[
                  'Nudity or sexual content',
                  'Harassment or bullying',
                  'Hate speech',
                  'Violence or physical harm',
                  'Spam or misleading',
                  'Intellectual property violation',
                  'Other'
                ].map(reason => (
                  <button
                    key={reason}
                    onClick={() => setReportReason(reason)}
                    className={`w-full text-left p-4 rounded-2xl font-bold text-sm transition-all border-2 ${
                      reportReason === reason 
                        ? 'bg-brand-proph/10 border-brand-proph text-brand-proph' 
                        : 'border-gray-100 dark:border-brand-border hover:border-brand-proph/30'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <textarea 
                value={reportDetails}
                onChange={e => setReportDetails(e.target.value)}
                placeholder="Additional details (optional)..."
                className="w-full bg-gray-50 dark:bg-brand-card border border-brand-border rounded-2xl p-4 text-sm outline-none focus:border-brand-proph mb-6 min-h-[100px]"
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => setReportingPost(null)}
                  className="flex-1 py-4 bg-gray-100 dark:bg-brand-card rounded-2xl font-black uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReportSubmit}
                  disabled={isReporting}
                  className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {isReporting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Lightbox 
        isOpen={!!lightboxImage} 
        imageUrl={lightboxImage || ''} 
        onClose={() => setLightboxImage(null)} 
      />
    </div>
  );
};

export default Community;
