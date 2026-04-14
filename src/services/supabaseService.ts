
import { supabase } from '../lib/supabase';
import { User, Post, PostComment, PastQuestion, SystemConfig, PaymentVerification, WithdrawalRequest, University, Advertisement, Message, EarnTask as Task, StudyDocument as Document, ArchiveIntel, Status, ChatInvite, Group, GroupMember, Poll } from '../../types';

export const SupabaseService = {
  // Auth
  async getSession() {
    return await supabase.auth.getSession();
  },

  async signUp(email: string, password: string, userData: Partial<User>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async resetPasswordForEmail(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  },

  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: password
    });
    return { data, error };
  },

  // Users
  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return this.mapUser(data);
  },

  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        if (error.message.includes('relation "public.profiles" does not exist')) {
          // Fallback to users if view not yet created
          const { data: uData, error: uErr } = await supabase.from('users').select('*');
          if (uErr) return [];
          return (uData || []).map(u => this.mapUser(u));
        }
        console.error('Error fetching users:', error);
        return [];
      }
      return (data || []).map(u => this.mapUser(u));
    } catch (err) {
      console.error('Unexpected error in getUsers:', err);
      return [];
    }
  },

  async saveUser(user: User) {
    const dbUser = this.toDbUser(user);
    const { error } = await supabase.from('users').upsert(dbUser);
    if (error) console.error('Error saving user:', error);
  },

  async updateUser(user: User) {
    const dbUser = this.toDbUser(user);
    const { data, error } = await supabase.from('users').update(dbUser).eq('id', user.id).select().single();
    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    return this.mapUser(data);
  },

  async isNicknameAvailable(nickname: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('nickname')
        .ilike('nickname', nickname)
        .maybeSingle();
      
      if (error) {
        // If the table doesn't exist, it's a major setup issue
        if (error.code === 'PGRST116') return true; // No rows found
        if (error.message.includes('relation "public.users" does not exist')) {
          console.error('CRITICAL: Supabase "users" table not found. Please run the setup SQL script.');
          return true; // Allow signup to proceed, but it will likely fail on trigger
        }
        console.error('Error checking nickname availability:', error);
        return false; // Assume unavailable on other errors for safety
      }
      
      return !data;
    } catch (err) {
      console.error('Unexpected error in isNicknameAvailable:', err);
      return false;
    }
  },

  mapUser(u: any): User {
    return {
      ...u,
      themePreference: u.theme_preference,
      isSugVerified: u.is_sug_verified,
      staffPermissions: u.staff_permissions,
      isPremium: u.is_premium,
      premiumExpiry: u.premium_until ? new Date(u.premium_until).getTime() : undefined,
      premiumTier: u.premium_tier,
      referralCode: u.referral_code,
      referralStats: u.referral_stats,
      referralCount: u.referral_count,
      aiAppUnlockedUntil: u.ai_app_unlocked_until ? new Date(u.ai_app_unlocked_until).getTime() : undefined,
      engagementScore: u.engagement_score,
      registrationIp: u.registration_ip,
      bankDetails: u.bank_details,
      gladiatorEarnings: u.gladiator_earnings,
      dailyPoints: u.daily_points,
      lastPointsReset: u.last_points_reset ? new Date(u.last_points_reset).getTime() : undefined,
      isVerified: u.is_verified,
      verificationCode: u.verification_code,
      referredBy: u.referred_by,
      engagementStats: u.engagement_stats,
      blockedUsers: u.blocked_users || [],
      hasSeenOnboarding: u.has_seen_onboarding || false,
      status: u.status || 'active',
      lastSeen: u.last_seen ? new Date(u.last_seen).getTime() : undefined,
      isOnline: u.is_online,
      badges: u.badges || [],
      fingerprintId: u.fingerprint_id,
      createdAt: new Date(u.created_at).getTime()
    };
  },

  toDbUser(user: User): any {
    const { 
      themePreference, isSugVerified, staffPermissions, isPremium, 
      premiumExpiry, premiumTier, referralCode, referralStats, referralCount,
      aiAppUnlockedUntil, engagementScore, registrationIp, bankDetails, 
      gladiatorEarnings, dailyPoints, lastPointsReset, isVerified, verificationCode, referredBy,
      engagementStats, blockedUsers, hasSeenOnboarding, lastSeen, isOnline,
      badges, fingerprintId, createdAt, ...rest 
    } = user;
    
    return { 
      ...rest, 
      theme_preference: themePreference,
      is_sug_verified: isSugVerified,
      staff_permissions: staffPermissions,
      is_premium: isPremium,
      premium_until: premiumExpiry ? new Date(premiumExpiry).toISOString() : null,
      premium_tier: premiumTier,
      daily_points: dailyPoints,
      last_points_reset: lastPointsReset ? new Date(lastPointsReset).toISOString() : null,
      referral_code: referralCode,
      referral_stats: referralStats,
      referral_count: referralCount,
      ai_app_unlocked_until: aiAppUnlockedUntil ? new Date(aiAppUnlockedUntil).toISOString() : null,
      engagement_score: engagementScore,
      registration_ip: registrationIp,
      bank_details: bankDetails,
      gladiator_earnings: gladiatorEarnings,
      is_verified: isVerified,
      verification_code: verificationCode,
      referred_by: referredBy,
      engagement_stats: engagementStats,
      blocked_users: blockedUsers || [],
      has_seen_onboarding: hasSeenOnboarding || false,
      last_seen: lastSeen ? new Date(lastSeen).toISOString() : null,
      is_online: isOnline,
      badges: badges || [],
      fingerprint_id: fingerprintId,
      created_at: createdAt ? new Date(createdAt).toISOString() : undefined
    };
  },

  async followUser(followerId: string, followingId: string) {
    try {
      const { data, error } = await supabase.rpc('follow_user', {
        follower_id: followerId,
        following_id: followingId
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error in followUser:', error);
      return { success: false, error };
    }
  },

  async resetDailyPoints(userId: string) {
    try {
      const { error } = await supabase.rpc('reset_daily_points', {
        u_id: userId
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error in resetDailyPoints:', error);
      return { success: false, error };
    }
  },

  async unfollowUser(followerId: string, followingId: string) {
    try {
      const { data, error } = await supabase.rpc('unfollow_user', {
        follower_id: followerId,
        following_id: followingId
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error in unfollowUser:', error);
      return { success: false, error };
    }
  },

  async updateUserTheme(userId: string, theme: 'light' | 'dark') {
    const { error } = await supabase.from('users').update({ theme_preference: theme }).eq('id', userId);
    if (error) console.error('Error updating user theme:', error);
  },

  async updateUserPoints(userId: string, points: number) {
    // This is now blocked by RLS for non-admins. 
    // For rewards, use rewardEngagement instead which uses a secure RPC.
    if (await this.is_admin()) {
      const { error } = await supabase.from('users').update({ points }).eq('id', userId);
      if (error) console.error('Error updating user points:', error);
    } else {
      console.warn('Direct point updates are restricted. Use secure RPCs.');
    }
  },

  async is_admin(): Promise<boolean> {
    const { data } = await supabase.rpc('is_admin');
    return !!data;
  },

  async deductPoints(userId: string, amount: number) {
    try {
      const { data, error } = await supabase.rpc('deduct_points_secure', {
        p_amount: amount
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error in deductPoints:', error);
      return { success: false, error: error.message };
    }
  },

  async distributeGroupRevenue(amount: number) {
    const { data: premiumUsers, error } = await supabase
      .from('users')
      .select('id, points, premium_tier')
      .neq('premium_tier', 'none');
    
    if (error || !premiumUsers) return;

    for (const user of premiumUsers) {
      let share = 0;
      if (user.premium_tier === 'premium') share = amount * 0.10;
      else if (user.premium_tier === 'premium_plus') share = amount * 0.15;
      else if (user.premium_tier === 'alpha_premium') share = amount * 0.30;

      if (share > 0) {
        await supabase.from('users').update({ points: (user.points || 0) + share }).eq('id', user.id);
      }
    }
  },

  async transferPoints(senderId: string, receiverId: string, amount: number) {
    try {
      // Check if sender has been active for 3 weeks (21 days)
      const { data: sender, error: sErr } = await supabase
        .from('users')
        .select('created_at')
        .eq('id', senderId)
        .single();
      
      if (sErr) throw sErr;
      
      const createdAt = new Date(sender.created_at).getTime();
      const threeWeeksInMs = 21 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      
      if (now - createdAt < threeWeeksInMs) {
        const daysRemaining = Math.ceil((threeWeeksInMs - (now - createdAt)) / (24 * 60 * 60 * 1000));
        throw new Error(`You must be active for at least 3 weeks to tip. ${daysRemaining} days remaining.`);
      }

      // We now use a secure RPC function that handles the transfer atomically on the server
      // First, we need to get the receiver's referral code (Proph ID)
      const { data: receiver, error: rErr } = await supabase
        .from('users')
        .select('referral_code')
        .eq('id', receiverId)
        .single();
      
      if (rErr) throw rErr;

      const { data, error } = await supabase.rpc('transfer_points', {
        receiver_proph_id: receiver.referral_code,
        transfer_amount: amount
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error in transferPoints:', error);
      return { success: false, error: error.message || error };
    }
  },

  async getChatInvites(userId: string): Promise<ChatInvite[]> {
    const { data, error } = await supabase
      .from('chat_invites')
      .select('*')
      .or(`inviter_id.eq.${userId},invitee_id.eq.${userId}`);
    
    if (error) throw error;
    return (data || []).map(i => ({
      id: i.id,
      inviterId: i.inviter_id,
      inviteeId: i.invitee_id,
      targetId: i.target_id,
      targetType: i.target_type,
      status: i.status,
      mutualAgreement: i.mutual_agreement || [],
      expiresAt: new Date(i.expires_at).getTime(),
      createdAt: new Date(i.created_at).getTime()
    }));
  },

  async sendChatInvite(invite: Partial<ChatInvite>) {
    const { data, error } = await supabase.from('chat_invites').insert({
      inviter_id: invite.inviterId,
      invitee_id: invite.inviteeId,
      target_id: invite.targetId,
      target_type: invite.targetType,
      status: 'pending',
      mutual_agreement: [invite.inviterId],
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
      created_at: new Date().toISOString()
    }).select().single();
    if (error) throw error;
    return data;
  },

  async respondToChatInvite(inviteId: string, userId: string, accept: boolean) {
    if (!accept) {
      const { error } = await supabase.from('chat_invites').update({ status: 'rejected' }).eq('id', inviteId);
      if (error) throw error;
      return;
    }

    const { data: invite, error: fErr } = await supabase.from('chat_invites').select('*').eq('id', inviteId).single();
    if (fErr) throw fErr;

    const mutualAgreement = [...(invite.mutual_agreement || []), userId];
    const status = mutualAgreement.length >= 2 ? 'accepted' : 'pending';

    const { error: uErr } = await supabase.from('chat_invites').update({
      mutual_agreement: mutualAgreement,
      status: status
    }).eq('id', inviteId);
    if (uErr) throw uErr;
  },

  async voteOnPoll(postId: string, optionId: string, userId: string) {
    try {
      const { data, error } = await supabase.rpc('vote_on_poll', {
        p_post_id: postId,
        p_option_id: optionId,
        p_user_id: userId
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error voting on poll:', error);
      return { success: false, error };
    }
  },

  async togglePostLike(postId: string, userId: string) {
    try {
      const { data: post, error: fErr } = await supabase.from('posts').select('likes, user_id').eq('id', postId).single();
      if (fErr) throw fErr;

      const likes = post.likes || [];
      const isLiked = likes.includes(userId);
      const newLikes = isLiked ? likes.filter((id: string) => id !== userId) : [...likes, userId];

      const { error: uErr } = await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);
      if (uErr) throw uErr;

      // Reward author if liked
      if (!isLiked && post.user_id !== userId) {
        await this.rewardEngagement(post.user_id, 'like');
      }

      return { success: true, isLiked: !isLiked };
    } catch (error) {
      console.error('Error toggling like:', error);
      return { success: false, error };
    }
  },

  async addPostComment(postId: string, comment: PostComment) {
    try {
      const { data: post, error: fErr } = await supabase.from('posts').select('comments, user_id').eq('id', postId).single();
      if (fErr) throw fErr;

      const comments = post.comments || [];
      const newComments = [...comments, comment];

      const { error: uErr } = await supabase.from('posts').update({ comments: newComments }).eq('id', postId);
      if (uErr) throw uErr;

      // Reward author
      if (post.user_id !== comment.userId) {
        await this.rewardEngagement(post.user_id, 'comment');
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error };
    }
  },

  async togglePostRepost(postId: string, userId: string) {
    try {
      const { data: post, error: fErr } = await supabase.from('posts').select('reposts, user_id').eq('id', postId).single();
      if (fErr) throw fErr;

      const reposts = post.reposts || [];
      const isReposted = reposts.includes(userId);
      const newReposts = isReposted ? reposts.filter((id: string) => id !== userId) : [...reposts, userId];

      const { error: uErr } = await supabase.from('posts').update({ reposts: newReposts }).eq('id', postId);
      if (uErr) throw uErr;

      // Reward author if reposted
      if (!isReposted && post.user_id !== userId) {
        await this.rewardEngagement(post.user_id, 'repost');
      }

      return { success: true, isReposted: !isReposted };
    } catch (error) {
      console.error('Error toggling repost:', error);
      return { success: false, error };
    }
  },

  async rewardEngagement(authorId: string, type: 'like' | 'comment' | 'repost' | 'link' | 'profile' | 'media') {
    try {
      const { data, error } = await supabase.rpc('reward_engagement_secure', {
        p_author_id: authorId,
        p_engagement_type: type
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error rewarding engagement:', error);
      return { success: false, error };
    }
  },

  async trackPostEngagement(postId: string, type: 'link' | 'profile' | 'media' | 'ad_click', userId: string) {
    try {
      const { data: post, error: fErr } = await supabase.from('posts').select('stats, user_id').eq('id', postId).single();
      if (fErr) throw fErr;

      const stats = post.stats || { linkClicks: 0, profileClicks: 0, mediaViews: 0, detailsExpanded: 0, impressions: 0 };
      if (type === 'link') stats.linkClicks++;
      if (type === 'profile') stats.profileClicks++;
      if (type === 'media') stats.mediaViews++;
      
      const { error: uErr } = await supabase.from('posts').update({ stats }).eq('id', postId);
      if (uErr) throw uErr;

      // Reward author for engagement
      if (post.user_id !== userId) {
        await this.rewardEngagement(post.user_id, type as any);
      }

      return { success: true };
    } catch (error) {
      console.error('Error tracking post engagement:', error);
      return { success: false, error };
    }
  },

  async getTopPosts(limit: number = 20): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false }) // Initial sort, we'll sort by engagement in JS or via a better query
      .limit(100); // Fetch more to calculate engagement
    
    if (error) {
      console.error('Error fetching top posts:', error);
      return [];
    }

    const posts = (data || []).map(p => this.mapPost(p));
    return posts
      .sort((a, b) => {
        const aEng = (a.likes?.length || 0) + (a.comments?.length || 0) + (a.reposts?.length || 0);
        const bEng = (b.likes?.length || 0) + (b.comments?.length || 0) + (b.reposts?.length || 0);
        return bEng - aEng;
      })
      .slice(0, limit);
  },

  async getPostById(id: string): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .select('*, users(name, nickname, profile_picture, university, premium_tier, is_verified, is_sug_verified)')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching post by id:', error);
      return null;
    }

    return this.mapPost(data);
  },

  async getTopReferrers(limit: number = 20): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('referral_count', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching top referrers:', error);
      return [];
    }
    return (data || []).map(u => this.mapUser(u));
  },

  // Feed
  async getFeed(limit: number = 20, offset: number = 0): Promise<Post[]> {
    try {
      const { data, error } = await supabase.rpc('fetch_secure_feed', {
        limit_count: limit,
        offset_count: offset
      });
      
      if (error) {
        console.error('Error fetching secure feed:', error);
        // Fallback to standard fetch if RPC fails (e.g. during migration)
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('posts')
          .select('*')
          .eq('visibility', 'public')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(limit)
          .range(offset, offset + limit - 1);
          
        if (fallbackError) throw fallbackError;
        return (fallbackData || []).map(p => this.mapPost(p));
      }
      
      return (data || []).map((p: any) => this.mapPost(p));
    } catch (err: any) {
      console.error('Fatal error fetching feed:', err);
      return [];
    }
  },

  async getUniversityFeed(university: string, limit: number = 20, offset: number = 0): Promise<Post[]> {
    try {
      const { data, error } = await supabase.rpc('fetch_university_feed', {
        p_university: university,
        limit_count: limit,
        offset_count: offset
      });

      if (error) {
        console.error('Error fetching university feed:', error);
        // Fallback
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('posts')
          .select('*')
          .or(`university.eq.${university},user_university.eq.${university}`)
          .or('visibility.eq.public,visibility.eq.node_only')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(limit)
          .range(offset, offset + limit - 1);

        if (fallbackError) throw fallbackError;
        return (fallbackData || []).map(p => this.mapPost(p));
      }

      return (data || []).map((p: any) => this.mapPost(p));
    } catch (err) {
      console.error('Fatal error fetching university feed:', err);
      return [];
    }
  },

  async updateAlgorithmWeights(newWeights: any) {
    const { error } = await supabase.rpc('update_algorithm_weights', {
      new_weights: newWeights
    });
    if (error) throw error;
  },

  async getCloudinarySignature(params: { timestamp: number, folder: string, public_id?: string }) {
    const { data, error } = await supabase.functions.invoke('cloudinary-signature', {
      body: params
    });
    if (error) throw error;
    return data.signature;
  },

  async getMyWallet() {
    const { data, error } = await supabase.rpc('get_my_wallet');
    if (error) throw error;
    return data;
  },

  mapPost(p: any): Post {
    return {
      ...p,
      userId: p.user_id,
      userName: p.user_name,
      userNickname: p.user_nickname,
      userUniversity: p.user_university || p.university, // Support both column names
      userAvatar: p.user_avatar,
      mediaUrl: p.media_url,
      mediaType: p.media_type,
      tags: p.tags,
      visibility: p.visibility,
      isEdited: p.is_edited,
      adId: p.ad_id,
      poll: p.poll,
      stats: p.stats || { linkClicks: 0, profileClicks: 0, mediaViews: 0, detailsExpanded: 0, impressions: 0 },
      createdAt: p.created_at ? new Date(p.created_at).getTime() : Date.now()
    };
  },

  toDbPost(post: Post): any {
    const { userId, userName, userNickname, userUniversity, userAvatar, mediaUrl, mediaType, tags, visibility, isEdited, adId, poll, stats, createdAt, ...rest } = post as any;
    return {
      ...rest,
      user_id: userId,
      user_name: userName,
      user_nickname: userNickname,
      user_university: userUniversity,
      university: userUniversity, // Ensure university column is set for filtering
      user_avatar: userAvatar,
      media_url: mediaUrl,
      media_type: mediaType,
      tags: tags || [],
      visibility: visibility || 'public',
      is_edited: isEdited || false,
      ad_id: adId,
      poll: poll || null,
      stats: stats || { linkClicks: 0, profileClicks: 0, mediaViews: 0, detailsExpanded: 0, impressions: 0 },
      created_at: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString()
    };
  },

  async savePost(post: Post) {
    try {
      const dbPost = this.toDbPost(post);
      const { error } = await supabase.from('posts').upsert(dbPost);
      if (error) {
        console.error('Error saving post:', error);
        throw error;
      }
    } catch (err) {
      console.error('Fatal error saving post:', err);
      throw err;
    }
  },

  async deletePost(postId: string) {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) console.error('Error deleting post:', error);
  },

  async updatePost(postId: string, content: string) {
    const { error } = await supabase.from('posts').update({ 
      content,
      is_edited: true 
    }).eq('id', postId);
    if (error) console.error('Error updating post:', error);
  },

  async renewPost(postId: string, cost: number) {
    const { data, error } = await supabase.rpc('renew_post', {
      p_post_id: postId,
      p_cost: cost
    });

    if (error) {
      console.error('Error renewing post:', error);
      return { success: false, error: error.message };
    }
    return data;
  },

  // Documents
  async getDocuments(): Promise<PastQuestion[]> {
    const { data, error } = await supabase.from('documents').select('*');
    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
    return (data || []).map(d => this.mapDocument(d));
  },

  mapDocument(d: any): PastQuestion {
    return {
      ...d,
      universityId: d.university_id,
      courseCode: d.course_code,
      courseTitle: d.course_title,
      fileUrl: d.file_url,
      uploadedBy: d.uploaded_by,
      createdAt: d.created_at ? new Date(d.created_at).getTime() : Date.now(),
      intelData: d.intel_data
    };
  },

  // Student Past Questions (New Table)
  async getStudentPastQuestions(): Promise<PastQuestion[]> {
    const { data, error } = await supabase.from('student_past_questions').select('*');
    if (error) {
      console.error('Error fetching student past questions:', error);
      return [];
    }
    return (data || []).map(q => this.mapDocument(q));
  },

  async saveStudentPastQuestion(question: PastQuestion) {
    const dbQ = {
      id: question.id,
      university_id: question.universityId,
      course_code: question.courseCode,
      course_title: question.courseTitle,
      year: question.year,
      semester: question.semester,
      file_url: question.fileUrl,
      uploaded_by: question.uploadedBy,
      status: question.status,
      intel_data: question.intelData,
      created_at: new Date(question.createdAt).toISOString()
    };
    const { error } = await supabase.from('student_past_questions').upsert(dbQ);
    if (error) console.error('Error saving student past question:', error);
  },

  async archiveStudentPastQuestion(id: string, reason: string) {
    const { error } = await supabase
      .from('student_past_questions')
      .update({ status: 'archived', intel_data: { archive_reason: reason } })
      .eq('id', id);
    if (error) console.error('Error archiving student past question:', error);
  },

  async getArchiveIntel(): Promise<ArchiveIntel[]> {
    const { data, error } = await supabase.from('archive_intel').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching archive intel:', error);
      return [];
    }
    return (data || []).map(i => ({
      id: i.id,
      questionId: i.question_id,
      action: i.action as any,
      performedBy: i.performed_by,
      metadata: i.metadata,
      createdAt: new Date(i.created_at).getTime()
    }));
  },

  async getStatuses(): Promise<Status[]> {
    const { data, error } = await supabase
      .from('statuses')
      .select('*, users(name, nickname, profile_picture)')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching statuses:', error);
      return [];
    }

    return (data || []).map(s => ({
      id: s.id,
      userId: s.user_id,
      userName: s.users?.name || 'Unknown',
      userAvatar: s.users?.profile_picture,
      mediaUrl: s.image_url,
      mediaType: 'image',
      caption: s.caption,
      renewed: s.renewal_count > 0,
      expiresAt: new Date(s.expires_at).getTime(),
      createdAt: new Date(s.created_at).getTime()
    }));
  },

  async saveStatus(status: any) {
    try {
      const { error } = await supabase.from('statuses').insert({
        user_id: status.userId,
        user_name: status.userName,
        user_avatar: status.userAvatar,
        image_url: status.mediaUrl,
        media_type: status.mediaType || 'image',
        caption: status.caption,
        expires_at: new Date(status.expiresAt || (Date.now() + 24 * 60 * 60 * 1000)).toISOString(),
        renewal_count: 0
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error saving status:', error);
      return { success: false, error };
    }
  },

  async renewStatus(statusId: string, _unused_newExpiresAt?: number) {
    try {
      // First check if it can be renewed
      const { data: status, error: fetchError } = await supabase
        .from('statuses')
        .select('*')
        .eq('id', statusId)
        .single();

      if (fetchError || !status) return { success: false };

      const now = Date.now();
      const expiresAt = new Date(status.expires_at).getTime();
      const oneHour = 60 * 60 * 1000;

      // Check if already renewed
      if (status.renewal_count > 0) return { success: false };

      // Check if within 1 hour of expiry
      if (expiresAt - now > oneHour) return { success: false };
      if (now > expiresAt) return { success: false }; // Already expired

      const newExpiresAt = new Date(expiresAt + 24 * 60 * 60 * 1000).toISOString();

      const { error: updateError } = await supabase
        .from('statuses')
        .update({
          expires_at: newExpiresAt,
          renewal_count: 1
        })
        .eq('id', statusId);

      if (updateError) throw updateError;
      return { success: true };
    } catch (error) {
      console.error('Error renewing status:', error);
      return { success: false };
    }
  },

  subscribeToDocuments(callback: (payload: any) => void) {
    return supabase
      .channel('realtime-documents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, (payload: any) => {
        if (payload.new) {
          payload.new = this.mapDocument(payload.new);
        }
        callback(payload);
      })
      .subscribe();
  },

  async saveDocument(doc: PastQuestion) {
    try {
      const { universityId, courseCode, courseTitle, fileUrl, uploadedBy, createdAt, ...rest } = doc as any;
      const dbDoc = {
        ...rest,
        university_id: universityId,
        course_code: courseCode,
        course_title: courseTitle,
        file_url: fileUrl,
        uploaded_by: uploadedBy,
        created_at: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString()
      };
      const { error } = await supabase.from('documents').upsert(dbDoc);
      if (error) console.error('Error saving document:', error);
    } catch (err) {
      console.error('Fatal error saving document:', err);
    }
  },

  async saveDocuments(docs: PastQuestion[]) {
    try {
      const dbDocs = docs.map(doc => {
        const { universityId, courseCode, courseTitle, fileUrl, uploadedBy, createdAt, ...rest } = doc;
        return {
          ...rest,
          university_id: universityId,
          course_code: courseCode,
          course_title: courseTitle,
          file_url: fileUrl,
          uploaded_by: uploadedBy,
          created_at: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString()
        };
      });
      const { error } = await supabase.from('documents').upsert(dbDocs);
      if (error) console.error('Error saving documents:', error);
    } catch (err) {
      console.error('Fatal error saving documents:', err);
    }
  },

  async deleteDocument(id: string) {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  async updateDocumentStatus(id: string, status: 'approved' | 'rejected' | 'archived') {
    const { error } = await supabase.from('documents').update({ status }).eq('id', id);
    if (error) console.error('Error updating document status:', error);
  },

  async updateStudentPastQuestionStatus(id: string, status: 'approved' | 'rejected' | 'archived') {
    const { error } = await supabase.from('student_past_questions').update({ status }).eq('id', id);
    if (error) console.error('Error updating student past question status:', error);
  },

  // Advertisements
  async getAds(): Promise<any[]> {
    const { data, error } = await supabase.from('advertisements').select('*');
    if (error) {
      console.error('Error fetching ads:', error);
      return [];
    }
    return (data || []).map(a => this.mapAd(a));
  },

  mapAd(a: any): any {
    return {
      ...a,
      userId: a.user_id,
      mediaUrl: a.media_url,
      type: a.media_type,
      adType: Array.isArray(a.ad_type) ? a.ad_type[0] : a.ad_type,
      adTypes: Array.isArray(a.ad_type) ? a.ad_type : (a.ad_type ? [a.ad_type] : []),
      placement: Array.isArray(a.placement) ? a.placement[0] : a.placement,
      placements: Array.isArray(a.placement) ? a.placement : (a.placement ? [a.placement] : []),
      targetLocation: a.target_location,
      campaignDuration: a.campaign_duration,
      campaignUnit: a.campaign_unit,
      timesPerDay: a.times_per_day,
      targetReach: a.target_reach,
      timeFrames: a.time_frames,
      expiryDate: a.expiry_date,
      isSponsored: a.is_sponsored ?? true,
      analytics: a.analytics || []
    };
  },

  subscribeToAds(callback: (payload: any) => void) {
    return supabase
      .channel('realtime-ads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'advertisements' }, (payload: any) => {
        if (payload.new) {
          payload.new = this.mapAd(payload.new);
        }
        callback(payload);
      })
      .subscribe();
  },

  async saveAd(ad: any) {
    const { userId, mediaUrl, type, adType, adTypes, placement, placements, targetLocation, campaignDuration, campaignUnit, timesPerDay, targetReach, timeFrames, isSponsored, expiryDate, createdAt, analytics, ...rest } = ad;
    const dbAd = {
      ...rest,
      user_id: userId,
      media_url: mediaUrl,
      media_type: type,
      ad_type: adTypes || (adType ? [adType] : []),
      placement: placements || (placement ? [placement] : []),
      target_location: targetLocation,
      campaign_duration: campaignDuration,
      campaign_unit: campaignUnit,
      times_per_day: timesPerDay,
      target_reach: targetReach,
      time_frames: timeFrames,
      expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null,
      created_at: (createdAt ? (isNaN(Number(createdAt)) ? new Date(createdAt) : new Date(Number(createdAt))) : new Date()).toISOString(),
      is_sponsored: isSponsored !== undefined ? isSponsored : true,
      analytics: analytics || []
    };
    const { error } = await supabase.from('advertisements').upsert(dbAd);
    if (error) console.error('Error saving ad:', error);
  },

  async deleteAd(adId: string) {
    const { error } = await supabase.from('advertisements').delete().eq('id', adId);
    if (error) console.error('Error deleting ad:', error);
  },

  // Config
  async getConfig(): Promise<SystemConfig | null> {
    const { data, error } = await supabase.from('system_config').select('config').eq('id', 'default').single();
    if (error) {
      console.error('Error fetching config:', error);
      return null;
    }
    return data?.config || null;
  },

  async saveConfig(config: SystemConfig) {
    const { error } = await supabase.from('system_config').upsert({ id: 'default', config: config });
    if (error) console.error('Error saving config:', error);
  },

  // Payment Verification
  mapPayment(v: any): PaymentVerification {
    return {
      ...v,
      userId: v.user_id,
      userName: v.user_name,
      userEmail: v.user_email,
      createdAt: new Date(v.created_at).getTime()
    };
  },

  toDbPayment(verification: PaymentVerification): any {
    const { userId, userName, userEmail, createdAt, ...rest } = verification;
    return {
      ...rest,
      user_id: userId,
      user_name: userName,
      user_email: userEmail,
      created_at: (createdAt ? (isNaN(Number(createdAt)) ? new Date(createdAt) : new Date(Number(createdAt))) : new Date()).toISOString()
    };
  },

  async getPaymentVerifications(): Promise<PaymentVerification[]> {
    try {
      const { data, error } = await supabase
        .from('payment_verifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('not found')) {
          console.warn('payment_verifications table missing, returning mock data');
          return [];
        }
        console.error('Error fetching payment verifications:', error);
        return [];
      }
      return (data || []).map(v => this.mapPayment(v));
    } catch (err) {
      console.warn('Payment verifications table might be missing:', err);
      return [];
    }
  },

  async savePaymentVerification(verification: PaymentVerification) {
    try {
      const dbVerification = this.toDbPayment(verification);
      const { error } = await supabase.from('payment_verifications').upsert(dbVerification);
      if (error) console.error('Error saving payment verification:', error);
    } catch (err) {
      console.error('Fatal error saving payment verification:', err);
    }
  },

  async updatePaymentVerificationStatus(id: string, status: 'approved' | 'rejected') {
    const { error } = await supabase.from('payment_verifications').update({ status }).eq('id', id);
    if (error) console.error('Error updating payment verification status:', error);
  },

  // Messages
  async getAllConversations() {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user1:user1_id(id, nickname, name),
        user2:user2_id(id, nickname, name)
      `)
      .order('last_message_time', { ascending: false });

    if (error) {
      console.error('Error fetching all conversations:', error);
      return [];
    }
    return data;
  },

  async getGlobalMessages(): Promise<any[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, nickname, name)
      `)
      .is('receiver_id', null)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching global messages:', error);
      return [];
    }
    return data.map(msg => ({
      ...msg,
      createdAt: msg.created_at
    }));
  },

  async getConversationMessages(user1Id: string, user2Id: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user1Id},receiver_id.eq.${user2Id}),and(sender_id.eq.${user2Id},receiver_id.eq.${user1Id})`)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching conversation messages:', error);
      return [];
    }
    return data.map(msg => ({
      ...msg,
      createdAt: msg.created_at
    }));
  },

  async getMessages(userId: string): Promise<Message[]> {
    // 1. Get direct messages and group messages
    const { data: directMsgs, error: dErr } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId},receiver_id.is.null`)
      .order('created_at', { ascending: true });
    
    if (dErr) {
      console.error('Error fetching direct messages:', dErr);
    }

    // 2. Get messages for conversations where user is an invited third party
    const { data: invites, error: iErr } = await supabase
      .from('chat_invites')
      .select('*')
      .eq('invitee_id', userId)
      .eq('status', 'accepted')
      .eq('target_type', 'conversation');

    let thirdPartyMsgs: any[] = [];
    if (!iErr && invites && invites.length > 0) {
      for (const invite of invites) {
        const [u1, u2] = invite.target_id.split(':');
        const { data: msgs, error: mErr } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${u1},receiver_id.eq.${u2}),and(sender_id.eq.${u2},receiver_id.eq.${u1})`)
          .gt('created_at', invite.created_at) // Only see new messages
          .order('created_at', { ascending: true });
        
        if (!mErr && msgs) {
          thirdPartyMsgs = [...thirdPartyMsgs, ...msgs];
        }
      }
    }

    const allMsgs = [...(directMsgs || []), ...thirdPartyMsgs];
    // Remove duplicates and sort
    const uniqueMsgs = Array.from(new Map(allMsgs.map(m => [m.id, m])).values());
    uniqueMsgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return uniqueMsgs.map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      groupId: msg.group_id,
      text: msg.content,
      mediaUrl: msg.media_url,
      mediaType: msg.media_type,
      expiresAt: msg.expires_at ? new Date(msg.expires_at).getTime() : undefined,
      createdAt: new Date(msg.created_at).getTime(),
      replyTo: msg.reply_to,
      replyToContent: msg.reply_to_content,
      isSeen: msg.is_seen,
      seenAt: msg.seen_at ? new Date(msg.seen_at).getTime() : undefined
    }));
  },

  async sendMessage(message: Partial<Message>) {
    const dbMsg = {
      sender_id: message.senderId,
      receiver_id: message.receiverId,
      group_id: message.groupId,
      content: message.text,
      media_url: message.mediaUrl,
      media_type: message.mediaType,
      expires_at: message.expiresAt ? new Date(message.expiresAt).toISOString() : null,
      created_at: new Date().toISOString(),
      reply_to: message.replyTo,
      reply_to_content: message.replyToContent,
      is_seen: false
    };
    const { data, error } = await supabase.from('messages').insert(dbMsg).select().single();
    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    // Update conversation last message
    if (message.receiverId && !message.groupId) {
      const convId = [message.senderId, message.receiverId].sort().join(':');
      await supabase.from('conversations').upsert({
        id: convId,
        user1_id: message.senderId < message.receiverId ? message.senderId : message.receiverId,
        user2_id: message.senderId < message.receiverId ? message.receiverId : message.senderId,
        last_message: message.text || `Sent a ${message.mediaType}`,
        last_message_at: new Date().toISOString()
      });
    }

    return data;
  },

  async markMessageAsSeen(messageId: string) {
    const { error } = await supabase.from('messages').update({
      is_seen: true,
      seen_at: new Date().toISOString()
    }).eq('id', messageId);
    if (error) console.error('Error marking message as seen:', error);
  },

  async updateUserStatus(userId: string, isOnline: boolean) {
    const { error } = await supabase.from('users').update({
      is_online: isOnline,
      last_seen: new Date().toISOString()
    }).eq('id', userId);
    if (error) console.error('Error updating user status:', error);
  },

  // Groups
  async getGroups(): Promise<Group[]> {
    const { data, error } = await supabase.from('groups').select('*');
    if (error) throw error;
    return (data || []).map(g => ({
      id: g.id,
      name: g.name,
      description: g.description,
      avatar: g.avatar,
      creatorId: g.creator_id,
      isMonetized: g.is_monetized,
      createdAt: new Date(g.created_at).getTime()
    }));
  },

  async createGroup(group: Partial<Group>) {
    const { data, error } = await supabase.from('groups').insert({
      name: group.name,
      description: group.description,
      avatar: group.avatar,
      creator_id: group.creatorId,
      is_monetized: group.isMonetized,
      created_at: new Date().toISOString()
    }).select().single();
    if (error) throw error;
    return data;
  },

  async joinGroup(groupId: string, userId: string, role: 'admin' | 'member' = 'member') {
    const { error } = await supabase.from('group_members').insert({
      group_id: groupId,
      user_id: userId,
      role: role,
      joined_at: new Date().toISOString()
    });
    if (error) throw error;
  },

  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const { data, error } = await supabase.from('group_members').select('*').eq('group_id', groupId);
    if (error) throw error;
    return (data || []).map(m => ({
      groupId: m.group_id,
      userId: m.user_id,
      role: m.role,
      joinedAt: new Date(m.joined_at).getTime()
    }));
  },

  async getRecentConversations(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user1:user1_id(id, name, nickname, avatar, profile_picture),
        user2:user2_id(id, name, nickname, avatar, profile_picture)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching recent conversations:', error);
      return [];
    }

    return data.map(conv => {
      const otherUser = conv.user1_id === userId ? conv.user2 : conv.user1;
      return {
        id: conv.id,
        otherUser: this.mapUser(otherUser),
        lastMessage: conv.last_message,
        lastMessageAt: conv.last_message_at,
        engagementScore: conv.engagement_score,
        messageCount: conv.message_count
      };
    });
  },

  async upgradeUserToPremium(userId: string, tier: 'weekly' | 'monthly' | 'yearly'): Promise<User | null> {
    const durations = {
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000,
      yearly: 365 * 24 * 60 * 60 * 1000
    };

    const expiry = Date.now() + durations[tier];
    
    const { data, error } = await supabase
      .from('users')
      .update({ 
        is_premium: true, 
        premium_until: expiry 
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Failed to upgrade user:', error);
      return null;
    }

    return this.mapUser(data);
  },

  async getTopEngagedChats(): Promise<any[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user1:user1_id(id, name, nickname, avatar, profile_picture),
        user2:user2_id(id, name, nickname, avatar, profile_picture)
      `)
      .order('engagement_score', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching top engaged chats:', error);
      return [];
    }

    return data.map(conv => ({
      id: conv.id,
      user1: this.mapUser(conv.user1),
      user2: this.mapUser(conv.user2),
      lastMessage: conv.last_message,
      lastMessageAt: conv.last_message_at,
      engagementScore: conv.engagement_score,
      messageCount: conv.message_count
    }));
  },

  async searchUsersByNickname(query: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('nickname', `%${query}%`)
      .limit(10);
    if (error) {
      // Fallback to users
      const { data: uData } = await supabase.from('users').select('*').ilike('nickname', `%${query}%`).limit(10);
      return (uData || []).map(u => this.mapUser(u));
    }
    return (data || []).map(u => this.mapUser(u));
  },

  subscribeToMessages(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`realtime:messages:${userId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages'
      }, (payload) => {
        const msg = payload.new;
        if (msg && (msg.sender_id === userId || msg.receiver_id === userId || msg.receiver_id === null)) {
          callback({
            id: msg.id,
            senderId: msg.sender_id,
            receiverId: msg.receiver_id,
            content: msg.content,
            createdAt: msg.created_at
          });
        }
      })
      .subscribe();
  },

  // Blocking & Reporting
  async blockUser(userId: string, targetId: string) {
    try {
      const { data: user, error: fErr } = await supabase.from('users').select('blocked_users').eq('id', userId).single();
      if (fErr) throw fErr;

      const blockedUsers = user.blocked_users || [];
      if (blockedUsers.includes(targetId)) return { success: true };

      const { error: uErr } = await supabase.from('users').update({ 
        blocked_users: [...blockedUsers, targetId] 
      }).eq('id', userId);
      
      if (uErr) throw uErr;
      return { success: true };
    } catch (error) {
      console.error('Error blocking user:', error);
      return { success: false, error };
    }
  },

  async unblockUser(userId: string, targetId: string) {
    try {
      const { data: user, error: fErr } = await supabase.from('users').select('blocked_users').eq('id', userId).single();
      if (fErr) throw fErr;

      const blockedUsers = user.blocked_users || [];
      const newBlockedUsers = blockedUsers.filter((id: string) => id !== targetId);

      const { error: uErr } = await supabase.from('users').update({ 
        blocked_users: newBlockedUsers 
      }).eq('id', userId);
      
      if (uErr) throw uErr;
      return { success: true };
    } catch (error) {
      console.error('Error unblocking user:', error);
      return { success: false, error };
    }
  },

  async submitReport(report: any) {
    try {
      const { error } = await supabase.from('reports').insert({
        reporter_id: report.reporterId,
        target_id: report.targetId,
        target_type: report.targetType,
        reason: report.reason,
        details: report.details,
        status: 'pending'
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error submitting report:', error);
      return { success: false, error };
    }
  },

  async getReports() {
    try {
      const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((r: any) => ({
        id: r.id,
        reporterId: r.reporter_id,
        targetId: r.target_id,
        targetType: r.target_type,
        reason: r.reason,
        details: r.details,
        status: r.status,
        createdAt: new Date(r.created_at).getTime()
      }));
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  },

  async updateReportStatus(reportId: string, status: 'resolved' | 'dismissed') {
    const { error } = await supabase.from('reports').update({ status }).eq('id', reportId);
    if (error) console.error('Error updating report status:', error);
  },

  async deleteStatus(statusId: string) {
    const { error } = await supabase.from('statuses').delete().eq('id', statusId);
    if (error) console.error('Error deleting status:', error);
  },

  async getStatusPanelData() {
    try {
      const { data, error } = await supabase
        .from('statuses')
        .select(`
          *,
          user:user_id (
            id,
            name,
            nickname,
            profile_picture
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(s => ({
        id: s.id,
        userId: s.user_id,
        userName: s.user?.name || 'Unknown',
        userNickname: s.user?.nickname || 'Unknown',
        userAvatar: s.user?.profile_picture,
        url: s.url,
        renewalCount: s.renewal_count || 0,
        viewCount: s.view_count || 0,
        expiresAt: new Date(s.expires_at).getTime(),
        createdAt: new Date(s.created_at).getTime()
      }));
    } catch (error) {
      console.error('Error fetching status panel data:', error);
      return [];
    }
  },

  async saveStatusPanelItem(userId: string, url: string) {
    try {
      const { data, error } = await supabase.rpc('handle_status_update', {
        p_url: url
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving status panel item:', error);
      return { success: false, error };
    }
  },

  async renewStatusPanelItem(id: string, currentExpiresAt: number) {
    try {
      const newExpiresAt = new Date(currentExpiresAt + 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase
        .from('statuses')
        .update({ 
          expires_at: newExpiresAt,
          renewal_count: 1 
        })
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error renewing status panel item:', error);
      return { success: false };
    }
  },

  async incrementStatusViewCount(id: string) {
    try {
      const { error } = await supabase.rpc('increment_status_view_count', { status_id: id });
      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing status view count:', error);
    }
  },

  // Secure Reply
  async createPostV2(content: string, mediaUrl?: string, mediaType?: string, parentId?: string) {
    try {
      const { data, error } = await supabase.rpc('create_post_v2', {
        p_content: content,
        p_media_url: mediaUrl,
        p_media_type: mediaType,
        p_parent_id: parentId
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in createPostV2:', error);
      throw error;
    }
  },

  async handlePostReply(postId: string, content: string, mediaUrl?: string, mediaType?: string) {
    try {
      const { data, error } = await supabase.rpc('handle_post_reply', {
        p_post_id: postId,
        p_reply_content: content,
        p_media_url: mediaUrl,
        p_media_type: mediaType
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in handlePostReply:', error);
      throw error;
    }
  },

  // Gladiator Hub
  async getGladiatorVault(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('gladiator_vault')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching gladiator vault:', error);
      return null;
    }
    return data;
  },

  async saveGladiatorVault(userId: string, vaultData: any[], arenaData: any = {}) {
    const { error } = await supabase
      .from('gladiator_vault')
      .upsert({
        user_id: userId,
        vault_data: vaultData,
        arena_data: arenaData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    if (error) console.error('Error saving gladiator vault:', error);
  },

  // Withdrawal Requests
  mapWithdrawal(r: any): any {
    return {
      ...r,
      userId: r.user_id,
      userName: r.user_name,
      bankDetails: {
        bankName: r.bank_name,
        accountNumber: r.account_number,
        accountName: r.account_name
      },
      createdAt: new Date(r.created_at).getTime()
    };
  },

  toDbWithdrawal(req: WithdrawalRequest): any {
    const { userId, userName, bankDetails, createdAt, ...rest } = req;
    return {
      ...rest,
      user_id: userId,
      user_name: userName,
      bank_name: bankDetails.bankName,
      account_number: bankDetails.accountNumber,
      account_name: bankDetails.accountName,
      created_at: (createdAt ? (isNaN(Number(createdAt)) ? new Date(createdAt) : new Date(Number(createdAt))) : new Date()).toISOString()
    };
  },

  async getWithdrawalRequests(): Promise<any[]> {
    const { data, error } = await supabase.from('withdrawal_requests').select('*');
    if (error) {
      console.error('Error fetching withdrawal requests:', error);
      return [];
    }
    return (data || []).map(r => this.mapWithdrawal(r));
  },

  async saveWithdrawalRequest(req: WithdrawalRequest) {
    try {
      const { data, error } = await supabase.rpc('create_withdrawal_request', {
        p_amount: req.amount,
        p_bank_name: req.bankDetails.bankName,
        p_account_number: req.bankDetails.accountNumber,
        p_account_name: req.bankDetails.accountName
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error saving withdrawal request:', error);
      return { success: false, error: error.message };
    }
  },

  async updateWithdrawalStatus(id: string, status: string) {
    const { error } = await supabase.from('withdrawal_requests').update({ status }).eq('id', id);
    if (error) console.error('Error updating withdrawal status:', error);
  },

  // Notifications
  async getNotifications(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    return data || [];
  },

  async sendNotification(userId: string, notification: any) {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      ...notification,
      created_at: new Date().toISOString()
    });
    if (error) console.error('Error sending notification:', error);
  },

  async markNotificationAsRead(notificationId: string) {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
    if (error) console.error('Error marking notification as read:', error);
  },

  // Tasks
  mapTask(t: any): any {
    return {
      ...t,
      completedBy: t.completed_by,
      createdAt: new Date(t.created_at).getTime(),
      expiryDate: t.expiry_date ? new Date(t.expiry_date).getTime() : undefined
    };
  },

  toDbTask(task: any): any {
    const { completedBy, expiryDate, createdAt, ...rest } = task;
    return {
      ...rest,
      completed_by: completedBy,
      expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null,
      created_at: (createdAt ? (isNaN(Number(createdAt)) ? new Date(createdAt) : new Date(Number(createdAt))) : new Date()).toISOString()
    };
  },

  async getTasks(): Promise<any[]> {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
    return (data || []).map(t => this.mapTask(t));
  },

  async saveTask(task: any) {
    const dbTask = this.toDbTask(task);
    const { error } = await supabase.from('tasks').upsert(dbTask);
    if (error) console.error('Error saving task:', error);
  },

  async deleteTask(taskId: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) console.error('Error deleting task:', error);
  },

  mapUniversity(u: any): University {
    return {
      ...u,
      logoUrl: u.logo_url,
      studentCount: u.student_count,
      isVerified: u.is_verified,
      createdAt: new Date(u.created_at).getTime()
    };
  },

  toDbUniversity(uni: University): any {
    const { logoUrl, studentCount, isVerified, createdAt, ...rest } = uni;
    return {
      ...rest,
      logo_url: logoUrl,
      student_count: studentCount,
      is_verified: isVerified,
      created_at: createdAt ? new Date(createdAt).toISOString() : undefined
    };
  },

  // Universities
  async getUniversities(): Promise<University[]> {
    const { data, error } = await supabase.from('universities').select('*');
    if (error) {
      console.error('Error fetching universities:', error);
      return [];
    }
    return (data || []).map(u => this.mapUniversity(u));
  },

  async saveUniversity(uni: University) {
    const dbUni = this.toDbUniversity(uni);
    const { error } = await supabase.from('universities').upsert(dbUni);
    if (error) console.error('Error saving university:', error);
  },

  async deleteUniversity(uniId: string) {
    const { error } = await supabase.from('universities').delete().eq('id', uniId);
    if (error) console.error('Error deleting university:', error);
  },

  // Colleges & Departments
  async getColleges(): Promise<any[]> {
    const { data, error } = await supabase.from('university_colleges').select('*');
    if (error) {
      console.error('Error fetching colleges:', error);
      return [];
    }
    return data || [];
  },

  async saveCollege(universityId: string, name: string) {
    const { error } = await supabase.from('university_colleges').upsert({ university_id: universityId, name });
    if (error) console.error('Error saving college:', error);
  },

  async deleteCollege(universityId: string, name: string) {
    const { error } = await supabase.from('university_colleges').delete().match({ university_id: universityId, name });
    if (error) console.error('Error deleting college:', error);
  },

  async getDepartments(): Promise<any[]> {
    const { data, error } = await supabase.from('college_departments').select('*, university_colleges(name, university_id)');
    if (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
    return data || [];
  },

  async saveDepartment(collegeId: string, name: string) {
    const { error } = await supabase.from('college_departments').upsert({ college_id: collegeId, name });
    if (error) console.error('Error saving department:', error);
  },

  async deleteDepartment(collegeId: string, name: string) {
    const { error } = await supabase.from('college_departments').delete().match({ college_id: collegeId, name });
    if (error) console.error('Error deleting department:', error);
  },

  async getTopEngagedUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('engagement_score', { ascending: false })
      .limit(10);
    if (error) {
      console.error('Error fetching top engaged users:', error);
      return [];
    }
    return (data || []).map(u => this.mapUser(u));
  },

  subscribeToTable(table: string, callback: (payload: any) => void) {
    return supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: table 
      }, (payload) => {
        callback(payload);
      })
      .subscribe((status) => {
        console.log(`Realtime status for ${table}:`, status);
      });
  }
};
