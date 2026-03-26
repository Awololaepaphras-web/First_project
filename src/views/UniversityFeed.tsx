
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CloudinaryService } from '../services/cloudinaryService';
import { Heart, MessageCircle, Repeat2, Share2, Image as ImageIcon, Loader2, ShieldCheck, MoreHorizontal, X } from 'lucide-react';
import { User, Advertisement, AdTimeFrame } from '../../types';

interface UniversityFeedProps {
  user: User;
  globalAds: Advertisement[];
}

const BannerAd: React.FC<{ ad: Advertisement }> = ({ ad }) => (
  <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-brand-proph/5 animate-fade-in">
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-brand-proph p-1 rounded text-[8px] font-black uppercase text-black">Ad</div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sponsored</span>
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
            <span className="text-gray-500 text-[15px] truncate">@sponsored</span>
            <span className="text-gray-500 text-[15px]">•</span>
            <span className="text-brand-proph text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-brand-proph/10 rounded border border-brand-proph/20">Ad</span>
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

export default function UniversityFeed({ user, globalAds = [] }: UniversityFeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  // --- THE UNIVERSITY ALGORITHM: LOAD & LISTEN ---
  useEffect(() => {
    console.log('UniversityFeed initialized for:', user.university);
    
    // Initial Load: Sort by Newest, Filtered by University
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('user_university', user.university)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching university posts:', error);
          setConnectionStatus('error');
        } else {
          console.log('Fetched university posts:', data?.length);
          if (data) setPosts(data);
          setConnectionStatus('connected');
        }
      } catch (err) {
        console.error('Unexpected error fetching posts:', err);
        setConnectionStatus('error');
      }
    };
    fetchPosts();

    // Real-time Subscription
    const channel = supabase
      .channel('realtime-university-posts')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'posts'
        }, 
        (payload) => {
          console.log('Real-time payload received:', payload);
          
          const newPost = payload.new as any;
          const oldPost = payload.old as any;

          if (payload.eventType === 'INSERT') {
            if (newPost.user_university === user.university) {
              setPosts((prev) => {
                if (prev.some(p => p.id === newPost.id)) return prev;
                return [newPost, ...prev];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            if (newPost.user_university === user.university) {
              setPosts((prev) => prev.map(p => p.id === newPost.id ? newPost : p));
            }
          } else if (payload.eventType === 'DELETE') {
            setPosts((prev) => prev.filter(p => p.id !== oldPost.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('error');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.university]);

  // --- ACTIONS ---
  const handlePost = async () => {
    if (!content.trim() && !image) return;
    setUploading(true);

    let imageUrl = null;
    if (image) {
      try {
        imageUrl = await CloudinaryService.uploadFile(image, 'image');
      } catch (err) {
        console.error("Upload failed", err);
      }
    }

    const { data, error } = await supabase.from('posts').insert([
      { 
        user_id: user.id,
        user_name: user.name, 
        user_nickname: user.nickname,
        user_university: user.university,
        content, 
        media_url: imageUrl,
        media_type: image ? 'image' : null,
        created_at: Date.now(),
        likes: [],
        reposts: [],
        comments: []
      }
    ]).select();

    if (!error && data) {
      setContent("");
      setImage(null);
      // Optimistic update in case real-time is slow
      setPosts(prev => {
        if (prev.some(p => p.id === data[0].id)) return prev;
        return [data[0], ...prev];
      });
    } else if (error) {
      console.error("Post failed", error);
      alert("Failed to broadcast intel: " + error.message);
    }
    setUploading(false);
  };

  const handleLike = async (postId: string, currentLikes: string[]) => {
    const newLikes = currentLikes.includes(user.id) 
      ? currentLikes.filter(id => id !== user.id)
      : [...currentLikes, user.id];

    await supabase
      .from('posts')
      .update({ likes: newLikes })
      .eq('id', postId);
  };

  return (
    <div className="max-w-2xl mx-auto border-x border-gray-200 dark:border-gray-800 min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Backend Status Indicator */}
      <div className="px-4 py-2 flex items-center justify-between bg-brand-black/50 border-b border-brand-border">
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
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">University Feed</h1>
          <p className="text-xs text-brand-proph font-black uppercase tracking-widest">{user.university}</p>
        </div>
      </div>

      {/* Post Box */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-proph/10 flex items-center justify-center font-bold text-brand-proph">
            {user.name[0]}
          </div>
          <div className="flex-grow">
            <textarea
              className="w-full bg-transparent text-lg outline-none resize-none placeholder-gray-500"
              placeholder={`What's happening at ${user.university}?`}
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {image && (
              <div className="relative mt-2">
                <img src={URL.createObjectURL(image)} className="rounded-2xl max-h-80 w-full object-cover" />
                <button onClick={() => setImage(null)} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 dark:border-gray-900">
              <label className="cursor-pointer text-brand-proph hover:bg-brand-proph/10 p-2 rounded-full transition-colors">
                <ImageIcon className="w-5 h-5" />
                <input type="file" hidden onChange={(e) => setImage(e.target.files?.[0] || null)} />
              </label>
              <button
                onClick={handlePost}
                disabled={uploading || (!content.trim() && !image)}
                className="bg-brand-proph hover:bg-brand-proph/90 disabled:opacity-50 text-white font-bold px-6 py-2 rounded-full transition-colors"
              >
                {uploading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {posts.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-gray-500 font-medium italic">No intel has been shared at {user.university} yet. Be the first to broadcast!</p>
          </div>
        ) : (
          posts.map((post, index) => {
            const hour = new Date().getHours();
            let currentTimeFrame: AdTimeFrame = 'all-day';
            if (hour >= 0 && hour < 6) currentTimeFrame = '12am-6am';
            else if (hour >= 6 && hour < 12) currentTimeFrame = '6am-12pm';
            else if (hour >= 12 && hour < 18) currentTimeFrame = '12pm-6pm';
            else if (hour >= 18) currentTimeFrame = '6pm-12am';

            const universityAds = globalAds.filter(ad => 
              ad.status === 'active' && 
              (ad.adType === 'native' || ad.adType === 'banner') && 
              (ad.placement === 'university' || ad.placement === 'timeline') &&
              (!ad.timeFrames || ad.timeFrames.length === 0 || ad.timeFrames.includes(currentTimeFrame) || ad.timeFrames.includes('all-day'))
            );

            const showAd = index > 0 && index % 5 === 0 && universityAds.length > 0;
            const adToShow = showAd ? universityAds[Math.floor((index / 5) % universityAds.length)] : null;

            return (
              <React.Fragment key={post.id}>
                {adToShow && (
                  adToShow.adType === 'banner' ? <BannerAd ad={adToShow} /> : <NativeAd ad={adToShow} />
                )}
                <div className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold">
                  {post.user_name?.[0]}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-1">
                    <span className="font-bold hover:underline">{post.user_name}</span>
                    <ShieldCheck className="w-4 h-4 text-brand-proph" />
                    <span className="text-gray-500">@{post.user_nickname}</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-500">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-1 text-[15px] leading-normal">{post.content}</div>
                  {post.media_url && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                      <img src={post.media_url} className="w-full h-auto max-h-96 object-cover" />
                    </div>
                  )}
                  <div className="flex justify-between mt-3 max-w-md text-gray-500">
                    <button className="flex items-center gap-2 hover:text-brand-proph transition-colors">
                      <MessageCircle className="w-4.5 h-4.5" />
                      <span className="text-xs">{post.comments?.length || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                      <Repeat2 className="w-4.5 h-4.5" />
                      <span className="text-xs">{post.reposts?.length || 0}</span>
                    </button>
                    <button 
                      onClick={() => handleLike(post.id, post.likes || [])} 
                      className={`flex items-center gap-2 transition-colors ${post.likes?.includes(user.id) ? "text-red-500" : "hover:text-red-500"}`}
                    >
                      <Heart className={`w-4.5 h-4.5 ${post.likes?.includes(user.id) ? "fill-current" : ""}`} />
                      <span className="text-xs">{post.likes?.length || 0}</span>
                    </button>
                    <button className="hover:text-brand-proph transition-colors">
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
    </div>
  );
}
