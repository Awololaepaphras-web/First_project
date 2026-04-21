
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CloudinaryService } from '../services/cloudinaryService';
import { SupabaseService } from '../services/supabaseService';
import { Heart, MessageCircle, Repeat2, Share2, Image as ImageIcon, Loader2, ShieldCheck, MoreHorizontal, X, Coins, Send, BarChart2, Plus, Trash2, Edit3, Clock } from 'lucide-react';
import { User, Advertisement, AdTimeFrame, Post, PostComment, Report, Poll, PollOption, Status } from '../../types';
import StatusPanel from '../components/StatusPanel';

interface UniversityFeedProps {
  user: User;
  globalAds: Advertisement[];
  onUpdateUser: (user: User) => void;
}

const BannerAd: React.FC<{ ad: Advertisement }> = ({ ad }) => (
  <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-brand-proph/5 animate-fade-in">
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-brand-proph p-1 rounded text-[8px] font-black uppercase text-black">Ad</div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            {ad.isSponsored ? 'Sponsored' : 'Not Sponsored'}
          </span>
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
              Learn More <Share2 className="w-3 h-3" />
            </div>
          </div>
        </div>
      </a>
    </div>
  </div>
);

const NativeAd: React.FC<{ ad: Advertisement }> = ({ ad }) => (
  <div className="p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group relative overflow-hidden">
    <div className="absolute top-0 left-0 w-1 h-full bg-brand-proph shadow-[0_0_15px_rgba(0,186,124,0.6)]" />
    <div className="flex gap-3">
      <div className="w-12 h-12 rounded-full bg-brand-proph/10 flex-shrink-0 flex items-center justify-center font-black text-brand-proph overflow-hidden border border-brand-proph/20">
        {ad.title.charAt(0)}
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-black text-[15px] truncate text-gray-900 dark:text-white">{ad.title}</span>
            <ShieldCheck className="w-4 h-4 text-brand-proph flex-shrink-0" />
            <span className="text-gray-500 text-[15px] truncate">@{ad.isSponsored ? 'sponsored' : 'partner'}</span>
            <span className="text-gray-500 text-[15px]">•</span>
            <span className="text-brand-proph text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-brand-proph/10 rounded border border-brand-proph/20">
              {ad.isSponsored ? 'Sponsored' : 'Partner'}
            </span>
          </div>
        </div>
        <div className="mt-1 text-[15px] text-gray-900 dark:text-white leading-normal whitespace-pre-wrap break-words break-all">{ad.description}</div>
        {ad.mediaUrl && (
          <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-black/5">
            {ad.mediaType === 'image' ? (
              <img src={ad.mediaUrl} className="w-full h-auto max-h-96 object-cover" alt={ad.title} referrerPolicy="no-referrer" />
            ) : (
              <video src={ad.mediaUrl} className="w-full h-auto max-h-96 object-cover" autoPlay muted loop playsInline />
            )}
          </div>
        )}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-6 text-gray-500">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><MessageCircle className="w-4 h-4" /> 0</div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><Repeat2 className="w-4 h-4" /> 0</div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><Heart className="w-4 h-4" /> 0</div>
          </div>
          <a href={ad.link} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 bg-brand-proph text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-brand-proph/20">
            Learn More
          </a>
        </div>
      </div>
    </div>
  </div>
);

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

export default function UniversityFeed({ user, globalAds = [], onUpdateUser }: UniversityFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  // Poll state
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  // Reporting state
  const [reportingPost, setReportingPost] = useState<Post | null>(null);
  const [reportReason, setReportReason] = useState<Report['reason']>('offensive');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [mediaFile, setMediaFile] = useState<{ file: File; type: 'image' | 'video' } | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);

  // --- THE UNIVERSITY ALGORITHM: LOAD & LISTEN ---
  useEffect(() => {
    console.log('UniversityFeed initialized for:', user.university);
    
    // Initial Load: Sort by Newest, Filtered by University
    const fetchPosts = async () => {
      try {
        const data = await SupabaseService.getUniversityFeed(user.university);
        console.log('Fetched university posts:', data?.length);
        setPosts(data);
        setConnectionStatus('connected');
      } catch (err) {
        console.error('Unexpected error fetching posts:', err);
        setConnectionStatus('error');
      }
    };

    const fetchStatuses = async () => {
      try {
        const data = await SupabaseService.getStatuses(user.university);
        setStatuses(data);
      } catch (err) {
        console.error('Error fetching university statuses:', err);
      }
    };

    fetchPosts();
    fetchStatuses();

    // Real-time Subscription
    const channel = SupabaseService.subscribeToTable('posts', (payload: any) => {
      console.log('University Change received!', payload);
      
      if (payload.eventType === 'INSERT') {
        const newPost = SupabaseService.mapPost(payload.new);
        if (newPost.userUniversity === user.university) {
          setPosts((prev) => {
            if (prev.some(p => p.id === newPost.id)) return prev;
            return [newPost, ...prev];
          });
        }
      } else if (payload.eventType === 'UPDATE') {
        const updatedPost = SupabaseService.mapPost(payload.new);
        if (updatedPost.userUniversity === user.university) {
          setPosts((prev) => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
        }
      } else if (payload.eventType === 'DELETE') {
        setPosts((prev) => prev.filter(p => p.id !== payload.old.id));
      }
    });

    setConnectionStatus('connected');

    // Subscribe to Statuses
    const statusChannel = SupabaseService.subscribeToTable('statuses', (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
        const fetchStatuses = async () => {
          const data = await SupabaseService.getStatuses(user.university);
          setStatuses(data);
        };
        fetchStatuses();
      }
    });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(statusChannel);
    };
  }, [user.university]);

  // --- ACTIONS ---
  const handlePost = async () => {
    if (!content.trim() && !mediaFile) return;

    // Check points
    if ((user.points || 0) < 30) {
      alert('Insufficient Prophy Points! Each post costs 30 coins.');
      return;
    }

    setUploading(true);

    let mediaUrl = undefined;
    let mediaType = undefined;
    if (mediaFile) {
      try {
        mediaUrl = await CloudinaryService.uploadFile(mediaFile.file, mediaFile.type);
        mediaType = mediaFile.type;
      } catch (err) {
        console.error("Upload failed", err);
      }
    }

    const newPost: Post = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      userNickname: user.nickname || user.name,
      userUniversity: user.university,
      content,
      mediaUrl,
      mediaType,
      poll: showPollCreator && pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2 ? {
        question: pollQuestion,
        options: pollOptions.filter(o => o.trim()).map(o => ({
          id: Math.random().toString(36).substr(2, 9),
          text: o,
          votes: []
        })),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours default
      } : undefined,
      likes: [],
      comments: [],
      reposts: [],
      createdAt: Date.now(),
      stats: { linkClicks: 0, profileClicks: 0, mediaViews: 0, detailsExpanded: 0, impressions: 0 }
    };

    try {
      await SupabaseService.savePost(newPost);
      
      // Deduct coins securely
      const result = await SupabaseService.deductPoints(user.id, 30);
      
      if (result.success) {
        // Update local state with new balance if returned, otherwise estimate
        const newPoints = result.new_points !== undefined ? result.new_points : (user.points || 0) - 30;
        const newDailyPoints = result.new_daily_points !== undefined ? result.new_daily_points : (user.dailyPoints || 0);
        onUpdateUser({ ...user, points: newPoints, dailyPoints: newDailyPoints });
      }

      setContent("");
      setMediaFile(null);
      setShowPollCreator(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
      // Real-time listener will handle the update
    } catch (error: any) {
      console.error("Post failed", error);
      alert("Failed to broadcast intel: " + error.message);
    }
    setUploading(false);
  };

  const handleEditPost = async (postId: string) => {
    if (!editContent.trim()) return;
    try {
      await SupabaseService.updatePost(postId, editContent);
      setEditingPostId(null);
      setEditContent('');
    } catch (err) {
      console.error('Failed to edit post:', err);
      alert('Failed to update post');
    }
  };

  const handleBlockUser = async (targetUserId: string) => {
    if (!user) return;
    if (window.confirm('Are you sure you want to block this user? Their posts will no longer appear in your feed.')) {
      const result = await SupabaseService.blockUser(user.id, targetUserId);
      if (result.success) {
        alert('User blocked successfully.');
        // Update local user state if possible, or rely on reload/re-fetch
        // In a real app, we'd update the global user context
      }
    }
  };

  const handleSubmitReport = async () => {
    if (!user || !reportingPost) return;
    setSubmittingReport(true);
    const result = await SupabaseService.submitReport({
      reporterId: user.id,
      targetId: reportingPost.id,
      targetType: 'post',
      reason: reportReason,
      details: reportDetails,
      status: 'pending',
      createdAt: Date.now()
    });

    if (result.success) {
      alert('Report submitted successfully. Administrators will review it shortly.');
      setReportingPost(null);
      setReportDetails('');
    } else {
      alert('Failed to submit report. Please try again.');
    }
    setSubmittingReport(false);
  };

  const handleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    await SupabaseService.togglePostLike(postId, user.id);
    
    if (post.userId !== user.id && !post.likes.includes(user.id)) {
      SupabaseService.sendNotification(post.userId, {
        title: 'New Like',
        message: `${user.name} liked your post in ${user.university} feed.`,
        type: 'success',
        data: { postId, actorId: user.id }
      });
    }
  };

  const [replyingTo, setReplyingTo] = useState<Post | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [tippingUser, setTippingUser] = useState<{ id: string, name: string } | null>(null);
  const [tipAmount, setTipAmount] = useState(10);
  const [tipping, setTipping] = useState(false);

  const handleReply = async () => {
    if (!replyingTo || !replyContent.trim()) return;

    // Check points
    if ((user.points || 0) < 30) {
      alert('Insufficient Prophy Points! Each reply costs 30 coins.');
      return;
    }

    const comment: PostComment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      text: replyContent,
      createdAt: Date.now(),
      likes: []
    };
    await SupabaseService.addPostComment(replyingTo.id, comment);
    
    // Deduct coins securely
    const result = await SupabaseService.deductPoints(user.id, 30);
    if (result.success) {
      const newPoints = result.new_points !== undefined ? result.new_points : (user.points || 0) - 30;
      const newDailyPoints = result.new_daily_points !== undefined ? result.new_daily_points : (user.dailyPoints || 0);
      onUpdateUser({ ...user, points: newPoints, dailyPoints: newDailyPoints });
    }

    if (replyingTo.userId !== user.id) {
      SupabaseService.sendNotification(replyingTo.userId, {
        title: 'New Reply',
        message: `${user.name} replied to your post in ${user.university} feed.`,
        type: 'info',
        data: { postId: replyingTo.id, actorId: user.id }
      });
    }
    
    setReplyingTo(null);
    setReplyContent("");
  };

  const handleRepost = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    await SupabaseService.togglePostRepost(postId, user.id);
    
    if (post.userId !== user.id && !post.reposts.includes(user.id)) {
      SupabaseService.sendNotification(post.userId, {
        title: 'New Repost',
        message: `${user.name} shared your post in ${user.university} feed.`,
        type: 'info',
        data: { postId, actorId: user.id }
      });
    }
  };

  const handleShare = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    await SupabaseService.togglePostRepost(postId, user.id);
    
    if (post.userId !== user.id && !post.reposts.includes(user.id)) {
      SupabaseService.sendNotification(post.userId, {
        title: 'New Share',
        message: `${user.name} shared your post in ${user.university} feed.`,
        type: 'info',
        data: { postId, actorId: user.id }
      });
    }
  };

  const handleTip = async () => {
    if (!tippingUser) return;
    setTipping(true);
    const result = await SupabaseService.transferPoints(user.id, tippingUser.id, tipAmount);
    if (result.success) {
      alert(`Successfully tipped ${tipAmount} points to ${tippingUser.name}!`);
      setTippingUser(null);
    } else {
      alert(result.error);
    }
    setTipping(false);
  };

  const handleVote = async (postId: string, optionId: string) => {
    const result = await SupabaseService.voteOnPoll(postId, optionId, user.id);
    if (!result.success) {
      alert(result.error instanceof Error ? result.error.message : 'Failed to vote');
    }
  };

  return (
    <div className="max-w-2xl mx-auto border-x border-gray-200 dark:border-brand-border min-h-screen bg-white dark:bg-brand-black text-black dark:text-white">
      {/* Backend Status Indicator */}
      <div className="px-4 py-2 flex items-center justify-between bg-gray-50 dark:bg-brand-black/50 border-b border-gray-200 dark:border-brand-border">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
          }`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
            {connectionStatus === 'connected' ? 'Real-time Feed Active' : 
             connectionStatus === 'connecting' ? 'Connecting to Node...' : 'Node Connection Error'}
          </span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-proph italic">
          {user.university} Node
        </span>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-brand-black/80 backdrop-blur-md p-4 border-b border-gray-200 dark:border-brand-border">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white uppercase italic tracking-tighter">University Parallel Universe</h1>
          <p className="text-xs text-brand-proph font-black uppercase tracking-widest">{user.university}</p>
        </div>
      </div>

      {/* University Stories */}
      <StatusPanel currentUser={user} />

      {/* Post Box */}
      <div className="p-4 border-b border-gray-200 dark:border-brand-border">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-proph/10 flex items-center justify-center font-bold text-brand-proph">
            {user.name[0]}
          </div>
          <div className="flex-grow">
            <textarea
              className="w-full bg-transparent text-lg outline-none resize-none placeholder-gray-500 min-h-[120px]"
              placeholder={`What's happening at ${user.university}?`}
              value={content}
              onChange={(e) => {
                // Allow alphanumeric, common punctuation, spaces, and newlines
                const val = e.target.value.replace(/[^a-zA-Z0-9$.,!? \n]/g, '');
                setContent(val);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  // Default behavior is newline
                }
              }}
            />
            {mediaFile && (
              <div className="relative mt-2">
                {mediaFile.type === 'image' ? (
                  <img src={URL.createObjectURL(mediaFile.file)} className="rounded-2xl max-h-80 w-full object-cover" />
                ) : (
                  <video src={URL.createObjectURL(mediaFile.file)} className="rounded-2xl max-h-80 w-full object-cover" controls />
                )}
                <button onClick={() => setMediaFile(null)} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {showPollCreator && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-brand-card rounded-2xl border border-brand-border animate-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-proph">Create Poll</span>
                  <button onClick={() => setShowPollCreator(false)} className="text-gray-500 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Ask a question..."
                  className="w-full bg-white dark:bg-brand-black border border-brand-border rounded-xl p-3 mb-3 outline-none focus:border-brand-proph transition-colors text-sm"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                />
                <div className="space-y-2">
                  {pollOptions.map((option, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        className="flex-grow bg-white dark:bg-brand-black border border-brand-border rounded-xl p-3 outline-none focus:border-brand-proph transition-colors text-sm"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...pollOptions];
                          newOptions[idx] = e.target.value;
                          setPollOptions(newOptions);
                        }}
                      />
                      {pollOptions.length > 2 && (
                        <button 
                          onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                          className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {pollOptions.length < 4 && (
                  <button 
                    onClick={() => setPollOptions([...pollOptions, ""])}
                    className="mt-3 flex items-center gap-2 text-xs font-bold text-brand-proph hover:bg-brand-proph/10 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Option
                  </button>
                )}
              </div>
            )}

            <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 dark:border-brand-border/30">
              <div className="flex gap-2">
                <label className="cursor-pointer text-brand-proph hover:bg-brand-proph/10 p-2 rounded-full transition-colors">
                  <ImageIcon className="w-5 h-5" />
                  <input type="file" hidden accept="image/*,video/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const type = file.type.startsWith('video') ? 'video' : 'image';
                      if (type === 'video') {
                        const video = document.createElement('video');
                        video.preload = 'metadata';
                        video.onloadedmetadata = () => {
                          window.URL.revokeObjectURL(video.src);
                          if (video.duration > 30.5) {
                            alert('Video must be 30 seconds or less');
                          } else {
                            setMediaFile({ file, type });
                          }
                        };
                        video.src = URL.createObjectURL(file);
                      } else {
                        setMediaFile({ file, type });
                      }
                    }
                  }} />
                </label>
                <button 
                  onClick={() => setShowPollCreator(!showPollCreator)}
                  className={`p-2 rounded-full transition-colors ${showPollCreator ? 'bg-brand-proph text-white' : 'text-brand-proph hover:bg-brand-proph/10'}`}
                >
                  <BarChart2 className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handlePost}
                disabled={uploading || (!content.trim() && !mediaFile)}
                className="bg-brand-proph hover:bg-brand-proph/90 disabled:opacity-50 text-white font-bold px-6 py-2 rounded-full transition-colors"
              >
                {uploading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="divide-y divide-gray-200 dark:divide-brand-border">
        {posts.filter(p => !user.blockedUsers?.includes(p.userId)).length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-gray-500 font-medium italic">No intel has been shared at {user.university} yet. Be the first to broadcast!</p>
          </div>
        ) : (
          posts
            .filter(p => !user.blockedUsers?.includes(p.userId))
            .map((post, index) => {
            const hour = new Date().getHours();
            let currentTimeFrame: AdTimeFrame = 'all-day';
            if (hour >= 0 && hour < 6) currentTimeFrame = '12am-6am';
            else if (hour >= 6 && hour < 12) currentTimeFrame = '6am-12pm';
            else if (hour >= 12 && hour < 18) currentTimeFrame = '12pm-6pm';
            else if (hour >= 18) currentTimeFrame = '6pm-12am';

            const universityAds = globalAds.filter(ad => 
              ad.status === 'active' && 
              (!ad.expiryDate || ad.expiryDate > Date.now()) &&
              ((ad.adTypes && (ad.adTypes.includes('native') || ad.adTypes.includes('banner'))) || (ad.adType === 'native' || ad.adType === 'banner')) && 
              ((ad.placements && (ad.placements.includes('university') || ad.placements.includes('timeline'))) || (ad.placement === 'university' || ad.placement === 'timeline')) &&
              (!ad.timeFrames || ad.timeFrames.length === 0 || ad.timeFrames.includes(currentTimeFrame) || ad.timeFrames.includes('all-day'))
            );

            const showAd = index > 0 && index % 5 === 0 && universityAds.length > 0;
            const adToShow = showAd ? universityAds[Math.floor((index / 5) % universityAds.length)] : null;

            return (
              <React.Fragment key={post.id}>
                {adToShow && (
                  (adToShow.adTypes?.includes('banner') || adToShow.adType === 'banner') ? <BannerAd ad={adToShow} /> : <NativeAd ad={adToShow} />
                )}
                <div className="p-4 hover:bg-gray-50 dark:hover:bg-brand-card transition-colors cursor-pointer group">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-brand-border flex items-center justify-center font-bold">
                  {post.userName?.[0]}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-1">
                    <span className="font-bold hover:underline">{post.userName}</span>
                    <ShieldCheck className="w-4 h-4 text-brand-proph" />
                    <span className="text-gray-500">@{post.userNickname}</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-500">{formatRelativeTime(post.createdAt)}</span>
                    
                    <div className="ml-auto relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPostOptions(showPostOptions === post.id ? null : post.id);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-brand-card rounded-full transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      {showPostOptions === post.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-brand-card rounded-2xl shadow-2xl border border-gray-100 dark:border-brand-border z-50 overflow-hidden py-2">
                          {post.userId === user.id && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPostId(post.id);
                                setEditContent(post.content);
                                setShowPostOptions(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm font-bold text-brand-proph hover:bg-brand-proph/10 flex items-center gap-2"
                            >
                              <Edit3 className="w-4 h-4" /> Edit Intel
                            </button>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setReportingPost(post);
                              setShowPostOptions(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4" /> Report Intel
                          </button>
                          {post.userId !== user.id && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBlockUser(post.userId);
                                setShowPostOptions(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                            >
                              <X className="w-4 h-4" /> Block User
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-1 text-[15px] leading-normal">
                    {editingPostId === post.id ? (
                      <div className="space-y-2 mt-2">
                        <textarea 
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-brand-black border border-brand-border rounded-xl p-3 text-sm outline-none focus:border-brand-proph"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingPostId(null)} className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5">Cancel</button>
                          <button onClick={() => handleEditPost(post.id)} className="px-4 py-1.5 bg-brand-proph text-black rounded-full text-[10px] font-black uppercase tracking-widest">Save</button>
                        </div>
                      </div>
                    ) : (
                      post.content
                    )}
                  </div>
                  
                  {post.poll && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-brand-card rounded-2xl border border-brand-border">
                      <h4 className="font-bold text-sm mb-4">{post.poll.question}</h4>
                      <div className="space-y-3">
                        {post.poll.options.map((option) => {
                          const totalVotes = post.poll?.options.reduce((acc, opt) => acc + opt.votes.length, 0) || 0;
                          const percentage = totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0;
                          const hasVoted = post.poll?.options.some(opt => opt.votes.includes(user.id));
                          const isSelected = option.votes.includes(user.id);

                          return (
                            <button
                              key={option.id}
                              disabled={hasVoted}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVote(post.id, option.id);
                              }}
                              className="w-full relative h-12 rounded-xl border border-brand-border overflow-hidden group transition-all hover:border-brand-proph/50 disabled:cursor-default"
                            >
                              {hasVoted && (
                                <div 
                                  className="absolute inset-y-0 left-0 bg-brand-proph/20 transition-all duration-1000"
                                  style={{ width: `${percentage}%` }}
                                />
                              )}
                              <div className="absolute inset-0 px-4 flex items-center justify-between">
                                <span className={`text-sm font-bold ${isSelected ? 'text-brand-proph' : ''}`}>
                                  {option.text}
                                  {isSelected && <ShieldCheck className="w-3 h-3 inline ml-2" />}
                                </span>
                                {hasVoted && (
                                  <span className="text-xs font-black text-brand-proph">{percentage}%</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-brand-muted">
                        <span>{post.poll.options.reduce((acc, opt) => acc + opt.votes.length, 0)} votes</span>
                        <span>·</span>
                        <span>{formatRelativeTime(post.poll.expiresAt)} left</span>
                      </div>
                    </div>
                  )}

                  {post.mediaUrl && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                      {post.mediaType === 'video' ? (
                        <video src={post.mediaUrl} className="w-full h-auto max-h-96 object-cover" controls />
                      ) : (
                        <img src={post.mediaUrl} className="w-full h-auto max-h-96 object-cover" />
                      )}
                    </div>
                  )}
                  <div className="flex justify-between mt-3 max-w-md text-gray-500">
                    <button 
                      onClick={() => setReplyingTo(post)}
                      className="flex items-center gap-2 hover:text-brand-proph transition-colors"
                    >
                      <MessageCircle className="w-4.5 h-4.5" />
                      <span className="text-xs">{post.comments?.length || 0}</span>
                    </button>
                    <button 
                      onClick={() => handleRepost(post.id)}
                      className={`flex items-center gap-2 transition-colors ${post.reposts?.includes(user.id) ? "text-green-500" : "hover:text-green-500"}`}
                    >
                      <Repeat2 className="w-4.5 h-4.5" />
                      <span className="text-xs">{post.reposts?.length || 0}</span>
                    </button>
                    <button 
                      onClick={() => handleLike(post.id)} 
                      className={`flex items-center gap-2 transition-colors ${post.likes?.includes(user.id) ? "text-red-500" : "hover:text-red-500"}`}
                    >
                      <Heart className={`w-4.5 h-4.5 ${post.likes?.includes(user.id) ? "fill-current" : ""}`} />
                      <span className="text-xs">{post.likes?.length || 0}</span>
                    </button>
                    <button 
                      onClick={() => setTippingUser({ id: post.userId, name: post.userName })}
                      className="flex items-center gap-2 hover:text-yellow-500 transition-colors"
                    >
                      <Coins className="w-4.5 h-4.5" />
                    </button>
                    <button 
                      onClick={() => handleShare(post.id)}
                      className="hover:text-brand-proph transition-colors"
                    >
                      <Share2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
            );
          })
        )}
      </div>
      {/* Modals */}
      {reportingPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-brand-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-brand-border flex justify-between items-center">
              <h3 className="font-black uppercase italic text-sm text-gray-900 dark:text-white">Report Intel</h3>
              <button onClick={() => setReportingPost(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-brand-border rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-widest">Why are you reporting this intel?</p>
              <div className="space-y-2 mb-6">
                {[
                  { id: 'nudity', label: 'Nudity or Sexual Content' },
                  { id: 'offensive', label: 'Offensive or Hate Speech' },
                  { id: 'harassment', label: 'Harassment or Bullying' },
                  { id: 'spam', label: 'Spam or Misleading' },
                  { id: 'other', label: 'Other Violation' }
                ].map(reason => (
                  <button
                    key={reason.id}
                    onClick={() => setReportReason(reason.id as any)}
                    className={`w-full p-4 rounded-2xl text-left font-bold text-sm transition-all border-2 ${
                      reportReason === reason.id 
                        ? 'bg-brand-proph/10 border-brand-proph text-brand-proph' 
                        : 'border-gray-100 dark:border-brand-border hover:border-brand-proph/50 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {reason.label}
                  </button>
                ))}
              </div>
              <textarea
                className="w-full bg-gray-50 dark:bg-brand-black border border-gray-100 dark:border-brand-border rounded-2xl p-4 text-sm outline-none focus:border-brand-proph transition-colors min-h-[100px] text-gray-900 dark:text-white"
                placeholder="Additional details (optional)..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
              />
              
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20 mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 leading-relaxed">
                  Strict Rule: Nudity, offensive content, or anything violating the rights of others is strictly prohibited. Violators face immediate penalties including point deduction or permanent ban.
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setReportingPost(null)}
                  className="flex-1 py-4 bg-gray-100 dark:bg-brand-border rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitReport}
                  disabled={submittingReport}
                  className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {submittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {replyingTo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-brand-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-brand-border flex justify-between items-center">
              <h3 className="font-black uppercase italic text-sm text-gray-900 dark:text-white">Reply to Intel</h3>
              <button onClick={() => setReplyingTo(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-brand-border rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex gap-3 mb-4 opacity-50">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-brand-border flex items-center justify-center font-bold text-gray-900 dark:text-white">{replyingTo.userName[0]}</div>
                <div className="flex-grow">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{replyingTo.userName}</p>
                  <p className="text-sm line-clamp-2 text-gray-700 dark:text-gray-300">{replyingTo.content}</p>
                </div>
              </div>
              <textarea
                autoFocus
                className="w-full bg-transparent text-lg outline-none resize-none placeholder-gray-500 min-h-[120px] text-gray-900 dark:text-white"
                placeholder="Post your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleReply}
                  disabled={!replyContent.trim()}
                  className="bg-brand-proph hover:bg-brand-proph/90 disabled:opacity-50 text-white font-bold px-8 py-2.5 rounded-full transition-all flex items-center gap-2"
                >
                  Reply <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tippingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-brand-card w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-xl font-black uppercase italic mb-2 text-gray-900 dark:text-white">Tip {tippingUser.name}</h3>
              <p className="text-gray-500 text-sm mb-6">Support your fellow student with some points!</p>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[10, 50, 100, 500, 1000, 5000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setTipAmount(amount)}
                    className={`py-3 rounded-2xl font-black text-xs transition-all border-2 ${
                      tipAmount === amount 
                        ? 'bg-yellow-500 border-yellow-500 text-black shadow-lg shadow-yellow-500/20' 
                        : 'border-gray-100 dark:border-brand-border hover:border-yellow-500/50 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setTippingUser(null)}
                  className="flex-1 py-4 bg-gray-100 dark:bg-brand-border rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleTip}
                  disabled={tipping}
                  className="flex-1 py-4 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-yellow-500/20 disabled:opacity-50"
                >
                  {tipping ? 'Processing...' : 'Send Tip'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
