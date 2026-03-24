
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CloudinaryService } from '../services/cloudinaryService';
import { Heart, MessageCircle, Repeat2, Share2, Image as ImageIcon, Loader2, ShieldCheck, MoreHorizontal } from 'lucide-react';

export default function XCommunityFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userHandle] = useState("User_" + Math.floor(Math.random() * 999));

  // --- THE X ALGORITHM: LOAD & LISTEN ---
  useEffect(() => {
    // Initial Load: Sort by Newest
    const fetchPosts = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setPosts(data);
    };
    fetchPosts();

    // Real-time Subscription
    const channel = supabase
      .channel('realtime posts')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'posts' }, 
        (payload) => {
          console.log('New post arrived!', payload.new);
          setPosts((prev) => [payload.new, ...prev]);
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          setPosts((prev) => prev.map(p => p.id === payload.new.id ? payload.new : p));
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'posts' },
        (payload) => {
          setPosts((prev) => prev.filter(p => p.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

    const { error } = await supabase.from('posts').insert([
      { 
        user_name: userHandle, 
        user_nickname: userHandle.toLowerCase(),
        content, 
        media_url: imageUrl,
        media_type: image ? 'image' : null,
        created_at: Date.now(),
        likes: [],
        reposts: [],
        comments: []
      }
    ]);

    if (!error) {
      setContent("");
      setImage(null);
    }
    setUploading(false);
  };

  const handleLike = async (postId: string, currentLikes: string[]) => {
    // In our app, likes is an array of user IDs. 
    // For this demo, we'll just add a dummy ID if not present
    const dummyUserId = "demo_user";
    const newLikes = currentLikes.includes(dummyUserId) 
      ? currentLikes.filter(id => id !== dummyUserId)
      : [...currentLikes, dummyUserId];

    await supabase
      .from('posts')
      .update({ likes: newLikes })
      .eq('id', postId);
  };

  return (
    <div className="max-w-2xl mx-auto border-x border-gray-200 dark:border-gray-800 min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold">Community Feed</h1>
      </div>

      {/* Post Box */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold">
            {userHandle[0]}
          </div>
          <div className="flex-grow">
            <textarea
              className="w-full bg-transparent text-lg outline-none resize-none placeholder-gray-500"
              placeholder="What's happening?"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {image && (
              <div className="relative mt-2">
                <img src={URL.createObjectURL(image)} className="rounded-2xl max-h-80 w-full object-cover" />
                <button onClick={() => setImage(null)} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white">
                  <Loader2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 dark:border-gray-900">
              <label className="cursor-pointer text-blue-400 hover:bg-blue-400/10 p-2 rounded-full transition-colors">
                <ImageIcon className="w-5 h-5" />
                <input type="file" hidden onChange={(e) => setImage(e.target.files?.[0] || null)} />
              </label>
              <button
                onClick={handlePost}
                disabled={uploading || (!content.trim() && !image)}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold px-6 py-2 rounded-full transition-colors"
              >
                {uploading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {posts.map((post) => (
          <div key={post.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold">
                {post.user_name?.[0]}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-1">
                  <span className="font-bold hover:underline">{post.user_name}</span>
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
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
                  <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                    <MessageCircle className="w-4.5 h-4.5" />
                    <span className="text-xs">{post.comments?.length || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                    <Repeat2 className="w-4.5 h-4.5" />
                    <span className="text-xs">{post.reposts?.length || 0}</span>
                  </button>
                  <button 
                    onClick={() => handleLike(post.id, post.likes || [])} 
                    className={`flex items-center gap-2 transition-colors ${post.likes?.includes("demo_user") ? "text-red-500" : "hover:text-red-500"}`}
                  >
                    <Heart className={`w-4.5 h-4.5 ${post.likes?.includes("demo_user") ? "fill-current" : ""}`} />
                    <span className="text-xs">{post.likes?.length || 0}</span>
                  </button>
                  <button className="hover:text-blue-400 transition-colors">
                    <Share2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
