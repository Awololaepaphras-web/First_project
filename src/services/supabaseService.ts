
import { supabase } from '../lib/supabase';
import { User, Post, PostComment, PastQuestion, SystemConfig, PaymentVerification, WithdrawalRequest, University, Advertisement, Message, EarnTask as Task, StudyDocument as Document, ArchiveIntel } from '../../types';

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
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        if (error.message.includes('relation "public.users" does not exist')) {
          console.error('CRITICAL: Supabase "users" table not found. Please run the setup SQL script.');
        } else {
          console.error('Error fetching users:', error);
        }
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
      premiumExpiry: u.premium_until,
      referralCode: u.referral_code,
      referralStats: u.referral_stats,
      referralCount: u.referral_count,
      aiAppUnlockedUntil: u.ai_app_unlocked_until ? new Date(u.ai_app_unlocked_until).getTime() : undefined,
      engagementScore: u.engagement_score,
      registrationIp: u.registration_ip,
      bankDetails: u.bank_details,
      gladiatorEarnings: u.gladiator_earnings,
      isVerified: u.is_verified,
      verificationCode: u.verification_code,
      referredBy: u.referred_by,
      engagementStats: u.engagement_stats,
      blockedUsers: u.blocked_users || [],
      hasSeenOnboarding: u.has_seen_onboarding || false,
      status: u.status || 'active',
      createdAt: new Date(u.created_at).getTime()
    };
  },

  toDbUser(user: User): any {
    const { 
      themePreference, isSugVerified, staffPermissions, isPremium, 
      premiumExpiry, referralCode, referralStats, referralCount,
      aiAppUnlockedUntil, engagementScore, registrationIp, bankDetails, 
      gladiatorEarnings, isVerified, verificationCode, referredBy,
      engagementStats, blockedUsers, hasSeenOnboarding, createdAt, ...rest 
    } = user;
    
    return { 
      ...rest, 
      theme_preference: themePreference,
      is_sug_verified: isSugVerified,
      staff_permissions: staffPermissions,
      is_premium: isPremium,
      premium_until: premiumExpiry,
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
    const { error } = await supabase.from('users').update({ points }).eq('id', userId);
    if (error) console.error('Error updating user points:', error);
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
      const config = await this.getConfig();
      if (!config) return;

      // Points mapping from config or defaults
      const pointsMap = {
        like: config.earnRates.likeReward || 0.1,
        comment: config.earnRates.replyReward || 0.5,
        repost: config.earnRates.repostReward || 1.0,
        link: 0.05,
        profile: 0.05,
        media: 0.05
      };
      const pointsToAdd = pointsMap[type];

      const { data: user, error: fErr } = await supabase.from('users').select('points').eq('id', authorId).single();
      if (fErr) throw fErr;

      const newPoints = (user.points || 0) + pointsToAdd;
      await supabase.from('users').update({ points: newPoints }).eq('id', authorId);
    } catch (error) {
      console.error('Error rewarding engagement:', error);
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
        if (type === 'ad_click') {
          const config = await this.getConfig();
          if (config) {
            const rewardPoints = config.earnRates.adClick / 100;
            await this.updateUserPoints(post.user_id, rewardPoints);
          }
        } else {
          await this.rewardEngagement(post.user_id, type as any);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error tracking post engagement:', error);
      return { success: false, error };
    }
  },

  // Feed
  async getFeed(limit: number = 20, offset: number = 0): Promise<Post[]> {
    try {
      const { data, error } = await supabase.rpc('fetch_secure_feed', {
        limit_count: limit,
        offset_count: offset
      });
      
      if (error) {
        if (error.message.includes('429')) {
          throw new Error('Rate limit exceeded. Please wait a minute.');
        }
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
      throw err;
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
      stats: p.stats || { linkClicks: 0, profileClicks: 0, mediaViews: 0, detailsExpanded: 0, impressions: 0 },
      createdAt: p.created_at ? new Date(p.created_at).getTime() : Date.now()
    };
  },

  toDbPost(post: Post): any {
    const { userId, userName, userNickname, userUniversity, userAvatar, mediaUrl, mediaType, tags, visibility, isEdited, adId, stats, createdAt, ...rest } = post as any;
    return {
      ...rest,
      user_id: userId,
      user_name: userName,
      user_nickname: userNickname,
      user_university: userUniversity, // Keep as user_university but we'll also handle the query
      user_avatar: userAvatar,
      media_url: mediaUrl,
      media_type: mediaType,
      tags: tags || [],
      visibility: visibility || 'public',
      is_edited: isEdited || false,
      ad_id: adId,
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
    const { error } = await supabase.from('posts').update({ content }).eq('id', postId);
    if (error) console.error('Error updating post:', error);
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
    const { data, error } = await supabase.from('archive_intel').select('*');
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

  async updateDocumentStatus(id: string, status: 'approved' | 'rejected') {
    const { error } = await supabase.from('documents').update({ status }).eq('id', id);
    if (error) console.error('Error updating document status:', error);
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
    const { userId, mediaUrl, type, adType, adTypes, placement, placements, targetLocation, campaignDuration, campaignUnit, timesPerDay, targetReach, timeFrames, isSponsored, expiryDate, analytics, ...rest } = ad;
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
      expiry_date: expiryDate,
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
      created_at: new Date(createdAt).toISOString()
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
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId},receiver_id.is.null`)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    return (data || []).map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      text: msg.content,
      mediaUrl: msg.media_url,
      mediaType: msg.media_type,
      expiresAt: msg.expires_at ? new Date(msg.expires_at).getTime() : undefined,
      createdAt: new Date(msg.created_at).getTime(),
      replyTo: msg.reply_to,
      replyToContent: msg.reply_to_content
    }));
  },

  async sendMessage(message: Partial<Message>) {
    const dbMsg = {
      sender_id: message.senderId,
      receiver_id: message.receiverId,
      content: message.text,
      media_url: message.mediaUrl,
      media_type: message.mediaType,
      expires_at: message.expiresAt ? new Date(message.expiresAt).toISOString() : null,
      created_at: new Date().toISOString(),
      reply_to: message.replyTo,
      reply_to_content: message.replyToContent
    };
    const { data, error } = await supabase.from('messages').insert(dbMsg).select().single();
    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    // Update conversation last message
    if (message.receiverId) {
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
      .from('users')
      .select('*')
      .ilike('nickname', `%${query}%`)
      .limit(10);
    if (error) {
      console.error('Error searching users:', error);
      return [];
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

  // Statuses (Stories)
  async getStatuses(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('statuses')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(s => ({
        id: s.id,
        userId: s.user_id,
        userName: s.user_name,
        userAvatar: s.user_avatar,
        mediaUrl: s.media_url,
        mediaType: s.media_type,
        caption: s.caption,
        renewed: s.renewed,
        expiresAt: new Date(s.expires_at).getTime(),
        createdAt: new Date(s.created_at).getTime()
      }));
    } catch (error) {
      console.error('Error fetching statuses:', error);
      return [];
    }
  },

  async saveStatus(status: any) {
    try {
      const { error } = await supabase.from('statuses').insert({
        user_id: status.userId,
        user_name: status.userName,
        user_avatar: status.userAvatar,
        media_url: status.mediaUrl,
        media_type: status.mediaType,
        caption: status.caption,
        expires_at: new Date(status.expiresAt).toISOString()
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error saving status:', error);
      return { success: false, error };
    }
  },

  async deleteStatus(statusId: string) {
    const { error } = await supabase.from('statuses').delete().eq('id', statusId);
    if (error) console.error('Error deleting status:', error);
  },

  async renewStatus(id: string, newExpiresAt: number) {
    try {
      const { error } = await supabase
        .from('statuses')
        .update({ 
          expires_at: new Date(newExpiresAt).toISOString(),
          renewed: true 
        })
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error renewing status:', error);
      return { success: false };
    }
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
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase.from('statuses').insert({
        user_id: userId,
        url: url,
        expires_at: expiresAt,
        renewal_count: 0,
        view_count: 0
      });
      if (error) throw error;
      return { success: true };
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
      created_at: new Date(createdAt).toISOString()
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
    const dbReq = this.toDbWithdrawal(req);
    const { error } = await supabase.from('withdrawal_requests').upsert(dbReq);
    if (error) console.error('Error saving withdrawal request:', error);
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
    const { completedBy, expiryDate, ...rest } = task;
    return {
      ...rest,
      completed_by: completedBy,
      expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null
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
