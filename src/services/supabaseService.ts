
import { supabase } from '../lib/supabase';
import { User, Post, Video, PastQuestion, SystemConfig, PaymentVerification } from '../../types';

export const SupabaseService = {
  // Auth
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
    return data || [];
  },

  async saveUser(user: User) {
    const { error } = await supabase.from('users').upsert(user);
    if (error) console.error('Error saving user:', error);
  },

  // Feed
  async getFeed(): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) {
      console.error('Error fetching feed:', error);
      return [];
    }
    return data || [];
  },

  subscribeToFeed(callback: (payload: any) => void) {
    return supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, callback)
      .subscribe();
  },

  async savePost(post: Post) {
    const { error } = await supabase.from('posts').upsert(post);
    if (error) console.error('Error saving post:', error);
  },

  async deletePost(postId: string) {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) console.error('Error deleting post:', error);
  },

  async updatePost(postId: string, content: string) {
    const { error } = await supabase.from('posts').update({ content }).eq('id', postId);
    if (error) console.error('Error updating post:', error);
  },

  // TV
  async getTV(): Promise<Video[]> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) {
      console.error('Error fetching TV:', error);
      return [];
    }
    return data || [];
  },

  subscribeToTV(callback: (payload: any) => void) {
    return supabase
      .channel('public:videos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, callback)
      .subscribe();
  },

  async saveVideo(video: Video) {
    const { error } = await supabase.from('videos').upsert(video);
    if (error) console.error('Error saving video:', error);
  },

  // Documents
  async getDocuments(): Promise<PastQuestion[]> {
    const { data, error } = await supabase.from('documents').select('*');
    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
    return data || [];
  },

  async saveDocument(doc: PastQuestion) {
    const { error } = await supabase.from('documents').upsert(doc);
    if (error) console.error('Error saving document:', error);
  },
  async saveDocuments(docs: PastQuestion[]) {
    const { error } = await supabase.from('documents').upsert(docs);
    if (error) console.error('Error saving documents:', error);
  },

  // Config
  async getConfig(): Promise<SystemConfig | null> {
    const { data, error } = await supabase.from('system_config').select('data').eq('id', 'default').single();
    if (error) {
      console.error('Error fetching config:', error);
      return null;
    }
    return data?.data || null;
  },

  async saveConfig(config: SystemConfig) {
    const { error } = await supabase.from('system_config').upsert({ id: 'default', data: config });
    if (error) console.error('Error saving config:', error);
  },

  // Payment Verification
  async getPaymentVerifications(): Promise<PaymentVerification[]> {
    const { data, error } = await supabase
      .from('payment_verifications')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) {
      console.error('Error fetching payment verifications:', error);
      return [];
    }
    return data || [];
  },

  async savePaymentVerification(verification: PaymentVerification) {
    const { error } = await supabase.from('payment_verifications').upsert(verification);
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
      .subscribe();
  },

  async sendMessage(message: any) {
    const { error } = await supabase.from('messages').insert(message);
    if (error) console.error('Error sending message:', error);
  }
};
