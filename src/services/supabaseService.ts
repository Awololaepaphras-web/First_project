
import { supabase } from '../lib/supabase';
import { User, Post, PastQuestion, SystemConfig, PaymentVerification, WithdrawalRequest, University, Advertisement, EarnTask as Task, StudyDocument as Document } from '../../types';

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
      bankDetails: u.bank_details,
      gladiatorEarnings: u.gladiator_earnings,
      isVerified: u.is_verified,
      verificationCode: u.verification_code,
      referredBy: u.referred_by,
      engagementStats: u.engagement_stats,
      createdAt: new Date(u.created_at).getTime()
    };
  },

  toDbUser(user: User): any {
    const { 
      themePreference, isSugVerified, staffPermissions, isPremium, 
      premiumExpiry, referralCode, referralStats, bankDetails, 
      gladiatorEarnings, isVerified, verificationCode, referredBy,
      engagementStats, createdAt, ...rest 
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
      bank_details: bankDetails,
      gladiator_earnings: gladiatorEarnings,
      is_verified: isVerified,
      verification_code: verificationCode,
      referred_by: referredBy,
      engagement_stats: engagementStats,
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
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching feed:', error);
        return [];
      }
      return (data || []).map(p => this.mapPost(p));
    } catch (err) {
      console.error('Fatal error fetching feed:', err);
      return [];
    }
  },

  mapPost(p: any): Post {
    return {
      ...p,
      userId: p.user_id,
      userName: p.user_name,
      userNickname: p.user_nickname,
      userUniversity: p.user_university,
      userAvatar: p.user_avatar,
      mediaUrl: p.media_url,
      mediaType: p.media_type,
      tags: p.tags,
      visibility: p.visibility,
      isEdited: p.is_edited,
      adId: p.ad_id,
      createdAt: p.created_at ? new Date(p.created_at).getTime() : Date.now()
    };
  },

  toDbPost(post: Post): any {
    const { userId, userName, userNickname, userUniversity, userAvatar, mediaUrl, mediaType, tags, visibility, isEdited, adId, createdAt, ...rest } = post as any;
    return {
      ...rest,
      user_id: userId,
      user_name: userName,
      user_nickname: userNickname,
      user_university: userUniversity,
      user_avatar: userAvatar,
      media_url: mediaUrl,
      media_type: mediaType,
      tags: tags || [],
      visibility: visibility || 'public',
      is_edited: isEdited || false,
      ad_id: adId,
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
      createdAt: d.created_at ? new Date(d.created_at).getTime() : Date.now()
    };
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
      adType: a.ad_type,
      targetLocation: a.target_location,
      campaignDuration: a.campaign_duration,
      campaignUnit: a.campaign_unit,
      timesPerDay: a.times_per_day,
      targetReach: a.target_reach,
      timeFrames: a.time_frames
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
    const { data, error } = await supabase
      .from('payment_verifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching payment verifications:', error);
      return [];
    }
    return (data || []).map(v => this.mapPayment(v));
  },

  async savePaymentVerification(verification: PaymentVerification) {
    const dbVerification = this.toDbPayment(verification);
    const { error } = await supabase.from('payment_verifications').upsert(dbVerification);
    if (error) console.error('Error saving payment verification:', error);
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

  async getMessages(userId: string): Promise<any[]> {
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
      content: msg.content,
      createdAt: msg.created_at
    }));
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

  async sendMessage(message: any) {
    const { error } = await supabase.from('messages').insert({
      sender_id: message.senderId,
      receiver_id: message.receiverId,
      content: message.content
    });
    if (error) console.error('Error sending message:', error);
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
