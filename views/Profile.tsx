
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, MapPin, GraduationCap, Calendar, 
  ShieldCheck, ArrowLeft, MessageSquare, UserPlus, UserMinus,
  Grid, Users, Heart, BarChart2, Coins, X
} from 'lucide-react';
import { User, Post } from '../types';
import { SupabaseService } from '../src/services/supabaseService';

interface ProfileProps {
  currentUser: User;
  allUsers: User[];
  posts: Post[];
  onFollow: (userId: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, allUsers, posts, onFollow }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState(10);
  const [isTippingInProgress, setIsTippingInProgress] = useState(false);

  const handleTip = async () => {
    if (!user || !currentUser) return;
    setIsTippingInProgress(true);
    const result = await SupabaseService.transferPoints(currentUser.id, user.id, tipAmount);
    if (result.success) {
      alert(`Successfully tipped ${tipAmount} coins to ${user.name}!`);
      setShowTipModal(false);
    } else {
      alert(result.error);
    }
    setIsTippingInProgress(false);
  };

  useEffect(() => {
    const targetUser = allUsers.find(u => u.id === id);
    if (targetUser) {
      setUser(targetUser);
      
      // Send notification if viewing someone else's profile
      if (currentUser.id !== targetUser.id) {
        SupabaseService.sendNotification(targetUser.id, {
          title: 'Profile View',
          message: `${currentUser.name} viewed your profile.`,
          type: 'info',
          data: { viewerId: currentUser.id }
        });
      }
    }
  }, [id, allUsers, currentUser.id, currentUser.name]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-proph"></div>
        <p className="mt-4 text-brand-muted font-black uppercase tracking-widest text-xs">Synchronizing Node...</p>
      </div>
    );
  }

  const userPosts = posts.filter(p => p.userId === user.id);
  const followers = allUsers.filter(u => user.followers?.includes(u.id));
  const following = allUsers.filter(u => user.following?.includes(u.id));
  const isFollowing = currentUser.following?.includes(user.id);

  return (
    <div className="w-full max-w-full mx-auto border-x border-brand-border min-h-screen bg-white dark:bg-brand-black pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-brand-black/80 backdrop-blur-md border-b border-brand-border p-4 flex items-center gap-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black italic tracking-tighter uppercase">{user.name}</h2>
          <p className="text-xs text-brand-muted font-bold">{userPosts.length} Archive Entries</p>
        </div>
      </div>

      {/* Banner & Avatar */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-brand-proph/20 to-brand-primary/20 border-b border-brand-border"></div>
        <div className="absolute -bottom-16 left-6">
          <div className="w-32 h-32 rounded-full border-4 border-white dark:border-brand-black bg-brand-border overflow-hidden shadow-2xl">
            {user.profilePicture ? (
              <img src={user.profilePicture} className="w-full h-full object-cover" alt={user.name} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-400">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="absolute -bottom-16 right-6 flex gap-3">
          {currentUser.id !== user.id ? (
            <>
              <button 
                onClick={() => navigate(`/messages?user=${user.id}`)}
                className="p-3 border border-brand-border rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowTipModal(true)}
                className="p-3 border border-yellow-500/50 rounded-full hover:bg-yellow-500/10 transition-all text-yellow-500"
              >
                <Coins className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onFollow(user.id)}
                className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                  isFollowing 
                    ? 'bg-brand-border text-brand-muted border border-brand-border' 
                    : 'bg-brand-proph text-black hover:brightness-110'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow Node'}
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate('/settings')}
              className="px-6 py-2.5 border border-brand-border rounded-full font-black text-xs uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              Edit Identity
            </button>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-20 px-6 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black italic tracking-tighter uppercase">{user.name}</h1>
            <ShieldCheck className="w-6 h-6 text-brand-proph" />
          </div>
          <div className="flex items-center gap-3">
            <p className="text-brand-muted font-black uppercase tracking-widest text-xs">@{user.nickname}</p>
            <div className="w-1 h-1 rounded-full bg-brand-border" />
            <p className="text-brand-proph font-black uppercase tracking-widest text-[10px]">Proph ID: {user.referralCode}</p>
          </div>
        </div>

        <p className="text-[15px] leading-relaxed dark:text-gray-200 italic">
          {user.role === 'admin' ? 'System Administrator' : 'Academic Node'} at {user.university}. Level {user.level} Scholar.
        </p>

        <div className="flex flex-wrap gap-4 text-brand-muted text-sm font-bold">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            <span>{user.university}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>Nigeria</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>Joined {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex gap-6 pt-2">
          <button onClick={() => setActiveTab('following')} className="hover:underline">
            <span className="font-black dark:text-white">{(user.following || []).length}</span>
            <span className="text-brand-muted ml-1 text-sm font-bold uppercase tracking-widest">Following</span>
          </button>
          <button onClick={() => setActiveTab('followers')} className="hover:underline">
            <span className="font-black dark:text-white">{(user.followers || []).length}</span>
            <span className="text-brand-muted ml-1 text-sm font-bold uppercase tracking-widest">Followers</span>
          </button>
          <div className="flex items-center gap-1">
            <span className="font-black dark:text-white">{userPosts.reduce((acc, p) => acc + (p.likes?.length || 0), 0)}</span>
            <span className="text-brand-muted ml-1 text-sm font-bold uppercase tracking-widest">Likes</span>
          </div>
        </div>

        {currentUser.id === user.id && !user.isSugVerified && (
          <div className="mt-6 p-6 bg-brand-proph/10 rounded-3xl border border-brand-proph/20 animate-pulse-slow">
            <h3 className="text-lg font-black italic uppercase tracking-tighter text-brand-proph mb-2">SUG Identity Verification</h3>
            <p className="text-xs text-brand-muted font-medium italic mb-4">Verify your Student Union Government status to unlock 1 year of Proph+ Premium access.</p>
            <button 
              onClick={() => {
                alert("Verification Protocol Initiated: Please upload your SUG ID card and appointment letter in the Submissions portal for manual node verification.");
              }}
              className="w-full py-3 bg-brand-proph text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-lg"
            >
              Verify SUG Identity
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-brand-border mt-6 sticky top-[61px] z-30 bg-white/80 dark:bg-brand-black/80 backdrop-blur-md">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'posts' ? 'text-brand-proph' : 'text-brand-muted hover:text-white'}`}
        >
          Archive
          {activeTab === 'posts' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-proph" />}
        </button>
        <button 
          onClick={() => setActiveTab('followers')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'followers' ? 'text-brand-proph' : 'text-brand-muted hover:text-white'}`}
        >
          Followers
          {activeTab === 'followers' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-proph" />}
        </button>
        <button 
          onClick={() => setActiveTab('following')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'following' ? 'text-brand-proph' : 'text-brand-muted hover:text-white'}`}
        >
          Following
          {activeTab === 'following' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-proph" />}
        </button>
      </div>

      {/* Content */}
      <div className="divide-y divide-brand-border">
        {activeTab === 'posts' && (
          userPosts.length > 0 ? (
            userPosts.map(post => (
              <div key={post.id} className="p-4 hover:bg-black/[0.05] dark:hover:bg-brand-black transition-colors cursor-pointer group">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-border flex-shrink-0 flex items-center justify-center font-black overflow-hidden shadow-inner">
                    {user.profilePicture ? <img src={user.profilePicture} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-black text-[15px] truncate text-gray-900 dark:text-white">{user.name}</span>
                      <ShieldCheck className="w-4 h-4 text-brand-proph flex-shrink-0" />
                      <span className="text-brand-muted text-[15px] truncate">@{user.nickname}</span>
                    </div>
                    <div className="mt-1 text-[15px] text-gray-900 dark:text-white leading-normal whitespace-pre-wrap">{post.content}</div>
                    {post.mediaUrl && (
                      <div className="mt-3 rounded-2xl overflow-hidden border border-brand-border">
                        {post.mediaType === 'image' ? <img src={post.mediaUrl} className="w-full h-auto object-cover" /> : <video src={post.mediaUrl} className="w-full h-auto" controls />}
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-3 max-w-md text-brand-muted">
                      <div className="flex items-center gap-2"><Heart className="w-4 h-4" /> <span className="text-xs">{post.likes.length}</span></div>
                      <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> <span className="text-xs">{post.comments.length}</span></div>
                      <div className="flex items-center gap-2"><BarChart2 className="w-4 h-4" /> <span className="text-xs">{post.stats.impressions}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center">
              <p className="text-brand-muted font-black uppercase tracking-widest text-xs italic">No archived assets found for this node.</p>
            </div>
          )
        )}

        {activeTab === 'followers' && (
          followers.length > 0 ? (
            followers.map(u => (
              <div key={u.id} onClick={() => navigate(`/profile/${u.id}`)} className="p-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-border overflow-hidden flex items-center justify-center font-black">
                    {u.profilePicture ? <img src={u.profilePicture} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black italic text-gray-900 dark:text-white">{u.name}</h4>
                    <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest">@{u.nickname}</p>
                  </div>
                </div>
                {currentUser.id !== u.id && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onFollow(u.id); }}
                    className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${
                      currentUser.following?.includes(u.id) ? 'bg-brand-border text-brand-muted' : 'bg-brand-proph text-black'
                    }`}
                  >
                    {currentUser.following?.includes(u.id) ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-20 text-center">
              <p className="text-brand-muted font-black uppercase tracking-widest text-xs italic">This node has no followers yet.</p>
            </div>
          )
        )}

        {activeTab === 'following' && (
          following.length > 0 ? (
            following.map(u => (
              <div key={u.id} onClick={() => navigate(`/profile/${u.id}`)} className="p-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-border overflow-hidden flex items-center justify-center font-black">
                    {u.profilePicture ? <img src={u.profilePicture} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black italic text-gray-900 dark:text-white">{u.name}</h4>
                    <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest">@{u.nickname}</p>
                  </div>
                </div>
                {currentUser.id !== u.id && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onFollow(u.id); }}
                    className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${
                      currentUser.following?.includes(u.id) ? 'bg-brand-border text-brand-muted' : 'bg-brand-proph text-black'
                    }`}
                  >
                    {currentUser.following?.includes(u.id) ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-20 text-center">
              <p className="text-brand-muted font-black uppercase tracking-widest text-xs italic">This node is not following anyone yet.</p>
            </div>
          )
        )}
      </div>
      {/* Tip Modal */}
      {showTipModal && user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-xl font-black uppercase italic mb-2">Tip {user.name}</h3>
              <p className="text-gray-500 text-sm mb-6">Support this student with some coins!</p>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[10, 50, 100, 500, 1000, 5000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setTipAmount(amount)}
                    className={`py-3 rounded-2xl font-black text-xs transition-all border-2 ${
                      tipAmount === amount 
                        ? 'bg-yellow-500 border-yellow-500 text-black shadow-lg shadow-yellow-500/20' 
                        : 'border-gray-100 dark:border-gray-800 hover:border-yellow-500/50'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowTipModal(false)}
                  className="flex-1 py-4 bg-gray-100 dark:bg-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px]"
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
    </div>
  );
};

export default Profile;
