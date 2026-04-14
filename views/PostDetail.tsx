
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MessageCircle, Heart, Repeat2, 
  Share2, MoreHorizontal, ShieldCheck, Trash2,
  Edit3, Check, X, AlertCircle, Ghost, ShieldAlert,
  CheckCircle2, Award, Crown, Gem, Loader2, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Post, PostComment, SystemConfig } from '../types';
import { SupabaseService } from '../src/services/supabaseService';
import { CloudinaryService } from '../src/services/cloudinaryService';
import VideoEmbed from '../src/components/VideoEmbed';

interface PostDetailProps {
  user: User;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onDeletePost: (postId: string) => void;
  onEditPost: (postId: string, content: string) => void;
  onFollow: (userId: string) => void;
  config: SystemConfig;
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

const PostDetail: React.FC<PostDetailProps> = ({ 
  user, onLike, onRepost, onComment, onDeletePost, onEditPost, onFollow, config 
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    setIsLoading(true);
    try {
      const data = await SupabaseService.getPostById(id!);
      if (data) {
        setPost(data);
        setEditContent(data.content);
      }
    } catch (err) {
      console.error('Failed to load post:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !post) return;
    setIsReplying(true);
    try {
      await onComment(post.id, replyText);
      setReplyText('');
      // Reload post to show new comment
      await loadPost();
    } catch (err) {
      console.error('Reply failed:', err);
    } finally {
      setIsReplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-brand-black">
        <Loader2 className="w-12 h-12 text-brand-proph animate-spin" />
        <p className="mt-4 text-brand-muted font-black uppercase tracking-widest text-[10px]">Syncing Intel Node...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-brand-black p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-black uppercase italic tracking-tighter dark:text-white">Intel Node Not Found</h2>
        <p className="text-brand-muted mt-2 max-w-xs mx-auto">The requested synchronization point does not exist or has been purged from the matrix.</p>
        <button onClick={() => navigate(-1)} className="mt-8 px-8 py-3 bg-brand-proph text-black rounded-2xl font-black uppercase tracking-widest text-xs">Return to Feed</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-brand-black pb-32 border-x border-brand-border max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-brand-black/80 backdrop-blur-md border-b border-brand-border p-4 flex items-center gap-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-black italic tracking-tighter uppercase text-gray-900 dark:text-white">Intel Node</h2>
      </div>

      <div className="p-4">
        {/* Author Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-brand-border flex-shrink-0 flex items-center justify-center font-black overflow-hidden shadow-inner border-2 border-brand-proph/20">
              {post.userAvatar ? (
                <img src={CloudinaryService.getOptimizedUrl(post.userAvatar)} className="w-full h-full object-cover" alt="" />
              ) : post.userName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-black text-lg text-gray-900 dark:text-white">{post.userName}</span>
                <div className="flex items-center gap-0.5">
                  {(post.userIsVerified || post.userIsSugVerified) && (
                    <CheckCircle2 className="w-4 h-4 text-brand-proph" title="Verified Scholar" />
                  )}
                  {post.userPremiumTier === 'premium' && <Award className="w-4 h-4 text-brand-muted" />}
                  {post.userPremiumTier === 'premium_plus' && <Crown className="w-4 h-4 text-yellow-500" />}
                  {post.userPremiumTier === 'alpha_premium' && <Gem className="w-4 h-4 text-blue-400" />}
                </div>
              </div>
              <p className="text-brand-muted text-sm font-bold tracking-tight">@{post.userNickname}</p>
            </div>
          </div>
          {post.userId !== user.id && (
            <button 
              onClick={() => onFollow(post.userId)}
              className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-all ${user.following?.includes(post.userId) ? 'bg-brand-border text-brand-muted' : 'bg-brand-proph text-black'}`}
            >
              {user.following?.includes(post.userId) ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* Post Content */}
        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <textarea 
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full bg-brand-border/20 dark:bg-white/5 border border-brand-proph/30 rounded-2xl p-4 text-lg outline-none focus:ring-2 focus:ring-brand-proph dark:text-white min-h-[150px]"
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-xl text-xs font-black uppercase text-brand-muted">Cancel</button>
                <button onClick={() => { onEditPost(post.id, editContent); setIsEditing(false); setPost({...post, content: editContent}); }} className="px-6 py-2 bg-brand-proph text-black rounded-xl text-xs font-black uppercase">Save Changes</button>
              </div>
            </div>
          ) : (
            <p className="text-xl md:text-2xl text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap break-words italic font-medium">
              {post.content}
            </p>
          )}

          {post.mediaUrl && (
            <div className="rounded-[2.5rem] overflow-hidden border border-brand-border bg-black/5">
              {post.mediaType === 'image' ? (
                <img src={CloudinaryService.getOptimizedUrl(post.mediaUrl)} className="w-full h-auto" alt="" />
              ) : (
                <video src={post.mediaUrl} className="w-full h-auto" controls />
              )}
            </div>
          )}

          <div className="flex items-center gap-4 text-brand-muted text-sm font-bold border-b border-brand-border pb-4">
            <span>{new Date(post.createdAt).toLocaleTimeString()}</span>
            <span>·</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            <span>·</span>
            <span className="text-brand-proph font-black">{post.stats.impressions} Views</span>
          </div>

          <div className="flex justify-around py-4 border-b border-brand-border">
            <button onClick={() => onLike(post.id)} className={`flex flex-col items-center gap-1 transition-colors ${post.likes.includes(user.id) ? 'text-red-500' : 'text-brand-muted hover:text-red-500'}`}>
              <Heart className={`w-6 h-6 ${post.likes.includes(user.id) ? 'fill-current' : ''}`} />
              <span className="text-xs font-black">{post.likes.length}</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-brand-muted hover:text-brand-proph transition-colors">
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs font-black">{post.comments.length}</span>
            </button>
            <button onClick={() => onRepost(post.id)} className={`flex flex-col items-center gap-1 transition-colors ${post.reposts.includes(user.id) ? 'text-green-500' : 'text-brand-muted hover:text-green-500'}`}>
              <Repeat2 className="w-6 h-6" />
              <span className="text-xs font-black">{post.reposts.length}</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-brand-muted hover:text-brand-proph transition-colors">
              <Share2 className="w-6 h-6" />
              <span className="text-xs font-black">Share</span>
            </button>
          </div>
        </div>

        {/* Reply Input */}
        <div className="mt-6 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-border flex-shrink-0 overflow-hidden">
            {user.profilePicture && <img src={CloudinaryService.getOptimizedUrl(user.profilePicture)} className="w-full h-full object-cover" />}
          </div>
          <div className="flex-grow space-y-3">
            <textarea 
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Post your reply..."
              className="w-full bg-transparent text-lg outline-none dark:text-white placeholder:text-brand-muted min-h-[60px] resize-none"
            />
            <div className="flex justify-end border-t border-brand-border pt-3">
              <button 
                onClick={handleReply}
                disabled={!replyText.trim() || isReplying}
                className="px-6 py-2 bg-brand-proph text-black rounded-full font-black uppercase text-xs tracking-widest disabled:opacity-50 flex items-center gap-2"
              >
                {isReplying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                Reply
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8 divide-y divide-brand-border">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted mb-4">Intel Replies</h3>
          {post.comments.length > 0 ? (
            post.comments.map(comment => (
              <div key={comment.id} className="py-6 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-border flex-shrink-0 flex items-center justify-center font-black overflow-hidden">
                  {comment.userName.charAt(0)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm dark:text-white">{comment.userName}</span>
                      <span className="text-brand-muted text-xs">· {formatRelativeTime(comment.createdAt)}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-[15px] dark:text-gray-200 leading-relaxed">{comment.text}</p>
                  <div className="flex items-center gap-6 mt-3 text-brand-muted">
                    <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-[10px] font-black">{comment.likes?.length || 0}</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-brand-proph transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-brand-muted font-black uppercase tracking-widest text-[10px] italic">No replies synchronized yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
