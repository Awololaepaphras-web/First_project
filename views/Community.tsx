
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  MessageCircle, Heart, Share2, ShieldCheck, 
  MoreHorizontal, Repeat2, X, Trash2, Loader2, 
  BarChart, Image as ImageIcon, Twitter, Facebook, Instagram, Ghost, MessageSquare,
  Search, Edit3, Check, AlertCircle, TrendingUp, Megaphone, ExternalLink
} from 'lucide-react';
import { User, Post, Comment, Advertisement } from '../types';
import { CloudinaryService } from '../src/services/cloudinaryService';

interface CommunityProps {
  user: User;
  allUsers: User[];
  posts: Post[];
  globalAds?: Advertisement[];
  onPost: (content: string, mediaUrl?: string, mediaType?: 'image' | 'video', parentId?: string) => void;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onLikeComment: (postId: string, commentId: string) => void;
  onFollow: (userId: string) => void;
  onDeletePost: (postId: string) => void;
  onEditPost: (postId: string, content: string) => void;
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
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Sponsored</span>
        </div>
        <span className="text-[10px] font-black italic text-brand-proph">{ad.title}</span>
      </div>
      <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-2xl border border-brand-proph/20 aspect-[3/1]">
        {ad.mediaType === 'image' ? (
          <img src={ad.mediaUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={ad.title} referrerPolicy="no-referrer" />
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
              Promoted
              <span className="absolute -inset-1 bg-brand-proph/10 blur-sm rounded-full -z-10" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-proph animate-pulse shadow-[0_0_12px_rgba(0,186,124,1)]" />
            </span>
            <ShieldCheck className="w-4 h-4 text-brand-proph flex-shrink-0" />
            <span className="text-brand-muted text-[15px] truncate">@sponsor</span>
          </div>
        </div>
        <div className="mt-1 text-[15px] text-gray-900 dark:text-white leading-normal font-bold italic break-words break-all">{ad.title}</div>
        {ad.mediaUrl && (
          <div className="mt-4 rounded-[2rem] overflow-hidden border border-brand-border bg-black/5 shadow-inner relative group/media">
            <div className="absolute inset-0 bg-brand-proph/5 opacity-0 group-hover/media:opacity-100 transition-opacity pointer-events-none" />
            {ad.mediaType === 'image' ? (
              <img src={ad.mediaUrl} className="w-full h-auto max-h-[600px] object-cover" alt="Ad" referrerPolicy="no-referrer" />
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

const Community: React.FC<CommunityProps> = ({ user, allUsers, posts, globalAds = [], onPost, onLike, onRepost, onComment, onLikeComment, onFollow, onDeletePost, onEditPost }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'trends' | 'node'>('all');
  const [newPostContent, setNewPostContent] = useState('');
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [showShareMenu, setShowShareMenu] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [mediaFile, setMediaFile] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Handle Trends tab from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'trends') {
      setActiveTab('trends');
    }
  }, [location.search]);

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.userNickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTrend = !selectedTrend || 
      p.content.toLowerCase().includes(selectedTrend.toLowerCase()) ||
      p.id === selectedTrend;

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
    setShowShareMenu(null);
  };

  return (
    <div className="w-full max-w-full mx-auto border-x border-brand-border min-h-screen bg-white dark:bg-brand-black pb-32">
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-brand-black/80 backdrop-blur-md border-b border-brand-border p-4 flex items-center justify-between gap-4">
         <h2 className="text-xl font-black italic tracking-tighter uppercase whitespace-nowrap">Social Hub</h2>
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
      </div>

      <div className="flex border-b border-brand-border sticky top-[73px] lg:top-[81px] z-30 bg-white/80 dark:bg-brand-black/80 backdrop-blur-md">
        <button 
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'all' ? 'text-brand-proph' : 'text-brand-muted hover:text-white'}`}
        >
          All Feeds
          {activeTab === 'all' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-proph" />}
        </button>
        <button 
          onClick={() => setActiveTab('following')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'following' ? 'text-brand-proph' : 'text-brand-muted hover:text-white'}`}
        >
          Following
          {activeTab === 'following' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-proph" />}
        </button>
        <button 
          onClick={() => setActiveTab('node')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'node' ? 'text-brand-proph' : 'text-brand-muted hover:text-white'}`}
        >
          My Node
          {activeTab === 'node' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-proph" />}
        </button>
        <button 
          onClick={() => setActiveTab('trends')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'trends' ? 'text-brand-proph' : 'text-brand-muted hover:text-white'}`}
        >
          Trends
          {activeTab === 'trends' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-proph" />}
        </button>
      </div>

      <div className="p-4 border-b border-brand-border">
        <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-border overflow-hidden flex-shrink-0">
                {user.profilePicture ? <img src={user.profilePicture} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">{user.name.charAt(0)}</div>}
            </div>
            <div className="flex-grow pt-2">
                <textarea 
                    value={newPostContent}
                    onChange={e => {
                      const val = e.target.value.replace(/[^a-zA-Z0-9$.,!? ]/g, '');
                      setNewPostContent(val);
                    }}
                    placeholder="Synchronize scholarly thought..."
                    className="w-full bg-transparent text-xl border-none outline-none resize-none min-h-[50px] placeholder:text-brand-muted text-gray-900 dark:text-white"
                />
                {mediaFile && (
                    <div className="relative mt-3 rounded-2xl overflow-hidden border border-brand-border">
                        {mediaFile.type === 'image' ? <img src={mediaFile.url} className="w-full h-auto object-cover" /> : <video src={mediaFile.url} className="w-full h-auto" controls />}
                        <button disabled={isUploading} onClick={() => setMediaFile(null)} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 disabled:opacity-50" title="Remove Media"><X className="w-4 h-4" /></button>
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-brand-proph animate-spin" />
                          </div>
                        )}
                    </div>
                )}
                <div className="flex justify-between items-center mt-4 border-t border-brand-border/30 pt-3">
                    <button disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="p-2 text-brand-proph hover:bg-brand-proph/10 rounded-full disabled:opacity-50" title="Attach Media"><ImageIcon className="w-5 h-5" /></button>
                    <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={async (e) => {
                       const file = e.target.files?.[0];
                       if(file) {
                          setIsUploading(true);
                          try {
                            const type = file.type.startsWith('video/') ? 'video' : 'image';
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
              <span className="font-black uppercase tracking-widest text-xs">Filtering by: {selectedTrend}</span>
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
                  <h3 className="text-xl font-black uppercase tracking-tighter italic">Trending Topics</h3>
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
                  <MessageCircle className="w-6 h-6 text-brand-proph" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter italic">Viral Synchronizations</h3>
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
          filteredPosts.map((post, index) => {
            const now = new Date();
            const hour = now.getHours();
            let currentTimeFrame: any = '12am-6am';
            if (hour >= 6 && hour < 12) currentTimeFrame = '6am-12pm';
            else if (hour >= 12 && hour < 18) currentTimeFrame = '12pm-6pm';
            else if (hour >= 18) currentTimeFrame = '6pm-12am';

            const timelineAds = globalAds.filter(ad => 
              ad.status === 'active' && 
              (ad.adType === 'native' || ad.adType === 'banner') && 
              ad.placement === 'timeline' &&
              (!ad.timeFrames || ad.timeFrames.length === 0 || ad.timeFrames.includes(currentTimeFrame) || ad.timeFrames.includes('all-day'))
            );

            const showAd = index > 0 && index % 5 === 0 && timelineAds.length > 0;
            const adToShow = showAd ? timelineAds[Math.floor((index / 5) % timelineAds.length)] : null;

            return (
              <React.Fragment key={post.id}>
                {adToShow && (
                  adToShow.adType === 'banner' ? <BannerAd ad={adToShow} /> : <NativeAd ad={adToShow} />
                )}
                <div className="p-4 hover:bg-black/[0.05] dark:hover:bg-brand-black transition-colors cursor-pointer group relative">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-brand-border flex-shrink-0 flex items-center justify-center font-black overflow-hidden shadow-inner">{post.userName.charAt(0)}</div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 min-w-0">
                            <span className="font-black text-[15px] truncate text-gray-900 dark:text-white hover:underline cursor-pointer" title="View Node">{post.userName}</span>
                            <ShieldCheck className="w-4 h-4 text-brand-proph flex-shrink-0" />
                            <span className="text-brand-muted text-[15px] truncate">@{post.userNickname}</span>
                            <span className="text-brand-muted text-[15px]">•</span>
                            <span className="text-brand-proph text-[15px] font-black italic truncate max-w-[100px]" title="Node">{post.userUniversity}</span>
                            <span className="text-brand-muted text-[15px]">•</span>
                            <span className="text-brand-muted text-[15px] whitespace-nowrap" title={new Date(post.createdAt).toLocaleString()}>{formatRelativeTime(post.createdAt)}</span>
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
                                </>
                              ) : (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setShowOptions(null); }}
                                  className="w-full flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 text-brand-muted rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                                >
                                  <AlertCircle className="w-4 h-4" /> Report
                                </button>
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
                        <div className="mt-1 text-[15px] text-gray-900 dark:text-white leading-normal whitespace-pre-wrap break-words break-all">{post.content}</div>
                      )}
                      {post.mediaUrl && (
                        <div className="mt-4 rounded-[2rem] overflow-hidden border border-brand-border bg-black/5 shadow-inner" title="Media Preview">
                           {post.mediaType === 'image' ? (
                             <img 
                               src={post.mediaUrl} 
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
                        <button className="flex items-center gap-2 hover:text-brand-primary group/btn transition-colors" title="Views">
                          <div className="p-2 rounded-full group-hover/btn:bg-brand-primary/10"><BarChart className="w-4.5 h-4.5" /></div>
                          <span className="text-xs">{(post.stats.mediaViews + post.stats.linkClicks).toLocaleString()}</span>
                        </button>
                        <div className="relative">
                          <button onClick={(e) => { e.stopPropagation(); setShowShareMenu(showShareMenu === post.id ? null : post.id); }} className="p-2 hover:text-brand-primary rounded-full transition-colors" title="Share"><Share2 className="w-4 h-4" /></button>
                          {showShareMenu === post.id && (
                            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-brand-card border border-brand-border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                              <button onClick={(e) => { e.stopPropagation(); handleShare('whatsapp', post); }} className="w-full flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest"><MessageSquare className="w-4 h-4 text-green-500" /> WhatsApp</button>
                              <button onClick={(e) => { e.stopPropagation(); handleShare('twitter', post); }} className="w-full flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest"><Twitter className="w-4 h-4 text-blue-400" /> Twitter</button>
                              <button onClick={(e) => { e.stopPropagation(); handleShare('facebook', post); }} className="w-full flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest"><Facebook className="w-4 h-4 text-blue-600" /> Facebook</button>
                              <button onClick={(e) => { e.stopPropagation(); handleShare('instagram', post); }} className="w-full flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest"><Instagram className="w-4 h-4 text-pink-500" /> Instagram</button>
                              <button onClick={(e) => { e.stopPropagation(); handleShare('snapchat', post); }} className="w-full flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest"><Ghost className="w-4 h-4 text-yellow-400" /> Snapchat</button>
                            </div>
                          )}
                        </div>
                      </div>
                      {showComments[post.id] && (
                        <div className="mt-4 space-y-4 border-t border-brand-border/30 pt-4 animate-fade-in">
                          {post.comments.map(c => (
                            <div key={c.id} className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand-border flex-shrink-0 flex items-center justify-center text-[10px] font-black">{c.userName.charAt(0)}</div>
                              <div className="flex-grow"><p className="text-sm font-black dark:text-white">{c.userName} <span className="font-normal text-brand-muted">@node</span></p><p className="text-sm dark:text-gray-200 mt-0.5">{c.text}</p></div>
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
          })
        )}
      </div>
    </div>
  );
};

export default Community;
