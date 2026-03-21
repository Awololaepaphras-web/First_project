
import { supabase } from '../lib/supabase';
import { User, Post, PastQuestion, SystemConfig, PaymentVerification, WithdrawalRequest } from '../../types';

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

  // Users
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    return (data || []).map(u => ({
      ...u,
      themePreference: u.theme_preference,
      isSugVerified: u.is_sug_verified,
      staffPermissions: u.staff_permissions,
      isPremium: u.is_premium,
      premiumExpiry: u.premium_until,
      referralCode: u.referral_code,
      referralStats: u.referral_stats,
      bankDetails: u.bank_details,
      gladiatorEarnings: u.gladiator_earnings,
      isVerified: u.is_verified,
      verificationCode: u.verification_code,
      referredBy: u.referred_by,
      engagementStats: u.engagement_stats,
      createdAt: new Date(u.created_at).getTime()
    }));
  },

  async saveUser(user: User) {
    const { 
      themePreference, isSugVerified, staffPermissions, isPremium, 
      premiumExpiry, referralCode, referralStats, bankDetails, 
      gladiatorEarnings, isVerified, verificationCode, referredBy,
      engagementStats, ...rest 
    } = user;
    
    const dbUser = { 
      ...rest, 
      theme_preference: themePreference,
      is_sug_verified: isSugVerified,
      staff_permissions: staffPermissions,
      is_premium: isPremium,
      premium_until: premiumExpiry,
      referral_code: referralCode,
      referral_stats: referralStats,
      bank_details: bankDetails,
      gladiator_earnings: gladiatorEarnings,
      is_verified: isVerified,
      verification_code: verificationCode,
      referred_by: referredBy,
      engagement_stats: engagementStats
    };
    const { error } = await supabase.from('users').upsert(dbUser);
    if (error) console.error('Error saving user:', error);
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

  async transferPoints(senderId: string, receiverId: string, amount: number) {
    try {
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
    } catch (error) {
      console.error('Error in transferPoints:', error);
      return { success: false, error };
    }
  },

  // Feed
  async getFeed(): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching feed:', error);
      return [];
    }
    return (data || []).map(p => ({
      ...p,
      userId: p.user_id,
      userName: p.user_name,
      userNickname: p.user_nickname,
      userAvatar: p.user_avatar,
      mediaUrl: p.media_url,
      mediaType: p.media_type,
      createdAt: Number(p.created_at)
    }));
  },

  subscribeToFeed(callback: (payload: any) => void) {
    return supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload: any) => {
        if (payload.new) {
          const p = payload.new;
          payload.new = {
            ...p,
            userId: p.user_id,
            userName: p.user_name,
            userNickname: p.user_nickname,
            userAvatar: p.user_avatar,
            mediaUrl: p.media_url,
            mediaType: p.media_type,
            createdAt: Number(p.created_at)
          };
        }
        callback(payload);
      })
      .subscribe();
  },

  async savePost(post: Post) {
    const { userId, userName, userNickname, userAvatar, mediaUrl, mediaType, createdAt, ...rest } = post as any;
    const dbPost = {
      ...rest,
      user_id: userId,
      user_name: userName,
      user_nickname: userNickname,
      user_avatar: userAvatar,
      media_url: mediaUrl,
      media_type: mediaType,
      created_at: createdAt
    };
    const { error } = await supabase.from('posts').upsert(dbPost);
    if (error) {
      console.error('Error saving post:', error);
      throw error;
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
    return (data || []).map(d => ({
      ...d,
      universityId: d.university_id,
      courseCode: d.course_code,
      courseTitle: d.course_title,
      fileUrl: d.file_url,
      uploadedBy: d.uploaded_by,
      createdAt: Number(d.created_at)
    }));
  },

  async saveDocument(doc: PastQuestion) {
    const { universityId, courseCode, courseTitle, fileUrl, uploadedBy, createdAt, ...rest } = doc as any;
    const dbDoc = {
      ...rest,
      university_id: universityId,
      course_code: courseCode,
      course_title: courseTitle,
      file_url: fileUrl,
      uploaded_by: uploadedBy,
      created_at: createdAt
    };
    const { error } = await supabase.from('documents').upsert(dbDoc);
    if (error) console.error('Error saving document:', error);
  },
  async saveDocuments(docs: PastQuestion[]) {
    const dbDocs = docs.map(doc => {
      const { universityId, courseCode, courseTitle, fileUrl, uploadedBy, createdAt, ...rest } = doc;
      return {
        ...rest,
        university_id: universityId,
        course_code: courseCode,
        course_title: courseTitle,
        file_url: fileUrl,
        uploaded_by: uploadedBy,
        created_at: new Date(createdAt).toISOString()
      };
    });
    const { error } = await supabase.from('documents').upsert(dbDocs);
    if (error) console.error('Error saving documents:', error);
  },

  async updateDocumentStatus(id: string, status: 'approved' | 'rejected') {
    const { error } = await supabase.from('documents').update({ status }).eq('id', id);
    if (error) console.error('Error updating document status:', error);
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
  async getPaymentVerifications(): Promise<PaymentVerification[]> {
    const { data, error } = await supabase
      .from('payment_verifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching payment verifications:', error);
      return [];
    }
    return (data || []).map(v => ({
      ...v,
      userId: v.user_id,
      userName: v.user_name,
      userEmail: v.user_email,
      createdAt: new Date(v.created_at).getTime()
    }));
  },

  async savePaymentVerification(verification: PaymentVerification) {
    const { userId, userName, userEmail, createdAt, ...rest } = verification;
    const dbVerification = {
      ...rest,
      user_id: userId,
      user_name: userName,
      user_email: userEmail,
      created_at: new Date(createdAt).toISOString()
    };
    const { error } = await supabase.from('payment_verifications').upsert(dbVerification);
    if (error) console.error('Error saving payment verification:', error);
  },

  async updatePaymentVerificationStatus(id: string, status: 'approved' | 'rejected') {
    const { error } = await supabase.from('payment_verifications').update({ status }).eq('id', id);
    if (error) console.error('Error updating payment verification status:', error);
  },

  // Messages
  async getMessages(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    return data || [];
  },

  subscribeToMessages(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`public:messages:${userId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      }, callback)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `sender_id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  async sendMessage(message: any) {
    const { error } = await supabase.from('messages').insert(message);
    if (error) console.error('Error sending message:', error);
  },

  // Gladiator Hub
  async getGladiatorVault(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('gladiator_vault')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
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

  // Advertisements
  async getAds(): Promise<any[]> {
    const { data, error } = await supabase.from('advertisements').select('*');
    if (error) {
      console.error('Error fetching ads:', error);
      return [];
    }
    return (data || []).map(a => ({
      ...a,
      userId: a.user_id,
      mediaUrl: a.media_url,
      type: a.media_type,
      adType: a.ad_type,
      targetLocation: a.target_location,
      campaignDuration: a.campaign_duration,
      campaignUnit: a.campaign_unit,
      timesPerDay: a.times_per_day,
      targetReach: a.target_reach,
      timeFrames: a.time_frames
    }));
  },

  async saveAd(ad: any) {
    const { userId, mediaUrl, type, adType, targetLocation, campaignDuration, campaignUnit, timesPerDay, targetReach, timeFrames, ...rest } = ad;
    const dbAd = {
      ...rest,
      user_id: userId,
      media_url: mediaUrl,
      media_type: type,
      ad_type: adType,
      target_location: targetLocation,
      campaign_duration: campaignDuration,
      campaign_unit: campaignUnit,
      times_per_day: timesPerDay,
      target_reach: targetReach,
      time_frames: timeFrames
    };
    const { error } = await supabase.from('advertisements').upsert(dbAd);
    if (error) console.error('Error saving ad:', error);
  },

  async deleteAd(adId: string) {
    const { error } = await supabase.from('advertisements').delete().eq('id', adId);
    if (error) console.error('Error deleting ad:', error);
  },

  // Withdrawal Requests
  async getWithdrawalRequests(): Promise<any[]> {
    const { data, error } = await supabase.from('withdrawal_requests').select('*');
    if (error) {
      console.error('Error fetching withdrawal requests:', error);
      return [];
    }
    return (data || []).map(r => ({
      ...r,
      userId: r.user_id,
      userName: r.user_name,
      bankDetails: {
        bankName: r.bank_name,
        accountNumber: r.account_number,
        accountName: r.account_name
      },
      createdAt: new Date(r.created_at).getTime()
    }));
  },

  async saveWithdrawalRequest(req: WithdrawalRequest) {
    const { userId, userName, bankDetails, createdAt, ...rest } = req;
    const dbReq = {
      ...rest,
      user_id: userId,
      user_name: userName,
      bank_name: bankDetails.bankName,
      account_number: bankDetails.accountNumber,
      account_name: bankDetails.accountName,
      created_at: new Date(createdAt).toISOString()
    };
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
  async getTasks(): Promise<any[]> {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
    return (data || []).map(t => ({
      ...t,
      completedBy: t.completed_by,
      createdAt: new Date(t.created_at).getTime(),
      expiryDate: t.expiry_date ? new Date(t.expiry_date).getTime() : undefined
    }));
  },

  async saveTask(task: any) {
    const { completedBy, expiryDate, ...rest } = task;
    const dbTask = {
      ...rest,
      completed_by: completedBy,
      expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null
    };
    const { error } = await supabase.from('tasks').upsert(dbTask);
    if (error) console.error('Error saving task:', error);
  },

  async deleteTask(taskId: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) console.error('Error deleting task:', error);
  },

  // Universities
  async getUniversities(): Promise<any[]> {
    const { data, error } = await supabase.from('universities').select('*');
    if (error) {
      console.error('Error fetching universities:', error);
      return [];
    }
    return data || [];
  },

  async saveUniversity(uni: any) {
    const { error } = await supabase.from('universities').upsert(uni);
    if (error) console.error('Error saving university:', error);
  },

  async deleteUniversity(uniId: string) {
    const { error } = await supabase.from('universities').delete().eq('id', uniId);
    if (error) console.error('Error deleting university:', error);
  },

  subscribeToTable(table: string, callback: (payload: any) => void) {
    return supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: table
      }, callback)
      .subscribe();
  }
};
