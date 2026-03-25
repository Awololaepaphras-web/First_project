
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CloudinaryService } from '../services/cloudinaryService';
import { Heart, MessageCircle, Repeat2, Share2, Image as ImageIcon, Loader2, ShieldCheck, MoreHorizontal, X } from 'lucide-react';
import { User } from '../../types';

interface UniversityFeedProps {
  user: User;
}

export default function UniversityFeed({ user }: UniversityFeedProps) {
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
          posts.map((post) => (
            <div key={post.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
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
          ))
        )}
      </div>
    </div>
  );
}
