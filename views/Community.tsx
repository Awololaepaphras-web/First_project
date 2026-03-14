
import React, { useState, useRef } from 'react';
import { 
  MessageCircle, Heart, Share2, ShieldCheck, 
  MoreHorizontal, Repeat2, X, Trash2, Loader2, 
  BarChart, Image as ImageIcon, Twitter, Facebook, Instagram, Ghost, MessageSquare,
  Search, Edit3, Check, AlertCircle
} from 'lucide-react';
import { User, Post, Comment, Advertisement } from '../types';
import BannerAd from '../components/BannerAd';

interface CommunityProps {
  user: User;
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

const Community: React.FC<CommunityProps> = ({ user, posts, globalAds = [], onPost, onLike, onRepost, onComment, onLikeComment, onFollow, onDeletePost, onEditPost }) => {
  const [newPostContent, setNewPostContent] = useState('');
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [showShareMenu, setShowShareMenu] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [mediaFile, setMediaFile] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const filteredPosts = posts.filter(p => 
    p.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.userNickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="w-full max-w-2xl mx-auto border-x border-brand-border min-h-screen bg-white dark:bg-brand-black pb-32">
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

      <div className="p-4 border-b border-brand-border">
        <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-border overflow-hidden flex-shrink-0">
                {user.profilePicture ? <img src={user.profilePicture} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">{user.name.charAt(0)}</div>}
            </div>
            <div className="flex-grow pt-2">
                <textarea 
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                    placeholder="Synchronize scholarly thought..."
                    className="w-full bg-transparent text-xl border-none outline-none resize-none min-h-[50px] placeholder:text-brand-muted text-gray-900 dark:text-white"
                />
                {mediaFile && (
                    <div className="relative mt-3 rounded-2xl overflow-hidden border border-brand-border">
                        {mediaFile.type === 'image' ? <img src={mediaFile.url} className="w-full h-auto object-cover" /> : <video src={mediaFile.url} className="w-full h-auto" controls />}
                        <button onClick={() => setMediaFile(null)} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80" title="Remove Media"><X className="w-4 h-4" /></button>
                    </div>
                )}
                <div className="flex justify-between items-center mt-4 border-t border-brand-border/30 pt-3">
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-brand-proph hover:bg-brand-proph/10 rounded-full" title="Attach Media"><ImageIcon className="w-5 h-5" /></button>
                    <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={(e) => {
                       const file = e.target.files?.[0];
                       if(file) {
                          const reader = new FileReader();
                          reader.onload = () => setMediaFile({ url: reader.result as string, type: file.type.startsWith('video/') ? 'video' : 'image' });
                          reader.readAsDataURL(file);
                       }
                    }} />
                    <button onClick={handlePostSubmit} className="bg-brand-proph text-black font-black px-6 py-2 rounded-full text-sm hover:brightness-110 active:scale-95 shadow-md" title="Broadcast Post">Post</button>
                </div>
            </div>
        </div>
      </div>

      <div className="divide-y divide-brand-border">
        {filteredPosts.map((post, index) => (
          <React.Fragment key={post.id}>
            {/* Timeline Ad Insertion */}
            {index > 0 && index % 5 === 0 && globalAds.filter(ad => ad.placement === 'timeline' && ad.adType === 'banner').length > 0 && (
              <div className="p-4 border-b border-brand-border bg-brand-proph/5">
                <BannerAd ad={globalAds.filter(ad => ad.placement === 'timeline' && ad.adType === 'banner')[Math.floor(Math.random() * globalAds.filter(ad => ad.placement === 'timeline' && ad.adType === 'banner').length)]} />
              </div>
            )}
            
            <div className="p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer group relative">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-border flex-shrink-0 flex items-center justify-center font-black overflow-hidden shadow-inner">{post.userName.charAt(0)}</div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 min-w-0">
                      <span className="font-black text-[15px] truncate text-gray-900 dark:text-white hover:underline cursor-pointer" title="View Node">{post.userName}</span>
                      <ShieldCheck className="w-4 h-4 text-brand-proph flex-shrink-0" />
                      <span className="text-brand-muted text-[15px] truncate">@{post.userNickname}</span>
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
                  <div className="mt-1 text-[15px] text-gray-900 dark:text-white leading-normal whitespace-pre-wrap">{post.content}</div>
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
                  <button onClick={(e) => { e.stopPropagation(); handleReplyClick(post.id); }} className="flex items-center gap-2 hover:text-brand-primary group/btn transition-colors" title="Reply">
                    <div className="p-2 rounded-full group-hover/btn:bg-brand-primary/10"><MessageCircle className="w-4.5 h-4.5" /></div>
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
      ))}
    </div>
    </div>
  );
};

export default Community;
