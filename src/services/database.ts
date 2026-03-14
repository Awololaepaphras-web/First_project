
import { PastQuestion, Post, Video, User, SystemConfig, PaymentVerification } from '../../types';
import { SupabaseService } from './supabaseService';

const KEYS = {
  DOCUMENTS: 'proph_db_documents',
  FEED: 'proph_db_feed',
  TV: 'proph_db_tv',
  GLADIATOR: 'proph_db_gladiator',
  USERS: 'proph_db_users',
  CONFIG: 'proph_db_config',
  SESSION: 'proph_db_session',
  PAYMENTS: 'proph_db_payments'
};

export const Database = {
  // Documents (Past Questions)
  getDocuments: async (): Promise<PastQuestion[]> => {
    const remoteData = await SupabaseService.getDocuments();
    if (remoteData.length > 0) {
      localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(remoteData));
      return remoteData;
    }
    const data = localStorage.getItem(KEYS.DOCUMENTS);
    return data ? JSON.parse(data) : [];
  },
  saveDocuments: async (docs: PastQuestion[]) => {
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(docs));
    if (docs.length > 0) {
      await SupabaseService.saveDocuments(docs);
    }
  },

  // Proph Feed (Posts)
  getFeed: async (): Promise<Post[]> => {
    const remoteData = await SupabaseService.getFeed();
    if (remoteData.length > 0) {
      localStorage.setItem(KEYS.FEED, JSON.stringify(remoteData));
      return remoteData;
    }
    const data = localStorage.getItem(KEYS.FEED);
    return data ? JSON.parse(data) : [];
  },
  subscribeToFeed: (callback: (payload: any) => void) => {
    return SupabaseService.subscribeToFeed(callback);
  },
  saveFeed: async (posts: Post[]) => {
    localStorage.setItem(KEYS.FEED, JSON.stringify(posts));
    // In a real app, we'd only save the new ones, but for this demo:
    if (posts.length > 0) {
      await SupabaseService.savePost(posts[0]); // Save the latest one as an example
    }
  },
  savePost: async (post: Post) => {
    await SupabaseService.savePost(post);
  },
  deletePost: async (postId: string) => {
    await SupabaseService.deletePost(postId);
  },
  updatePost: async (postId: string, content: string) => {
    await SupabaseService.updatePost(postId, content);
  },

  // Proph TV (Videos)
  getTV: async (): Promise<Video[]> => {
    const remoteData = await SupabaseService.getTV();
    if (remoteData.length > 0) {
      localStorage.setItem(KEYS.TV, JSON.stringify(remoteData));
      return remoteData;
    }
    const data = localStorage.getItem(KEYS.TV);
    return data ? JSON.parse(data) : [];
  },
  subscribeToTV: (callback: (payload: any) => void) => {
    return SupabaseService.subscribeToTV(callback);
  },
  saveTV: async (videos: Video[]) => {
    localStorage.setItem(KEYS.TV, JSON.stringify(videos));
    if (videos.length > 0) {
      await SupabaseService.saveVideo(videos[0]);
    }
  },
  saveVideo: async (video: Video) => {
    await SupabaseService.saveVideo(video);
  },

  // Gladiator Hub
  getGladiatorData: async () => {
    // For now, we'll keep Gladiator data in local storage but we could easily move it to Supabase
    const data = localStorage.getItem(KEYS.GLADIATOR);
    return data ? JSON.parse(data) : { vault: [], history: [], stats: {} };
  },
  saveGladiatorData: async (data: any) => {
    localStorage.setItem(KEYS.GLADIATOR, JSON.stringify(data));
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    const remoteData = await SupabaseService.getUsers();
    if (remoteData.length > 0) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(remoteData));
      return remoteData;
    }
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },
  saveUsers: async (users: User[]) => {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    // In a real app we'd sync all, but for now we'll assume the caller might have updated one
  },
  saveUser: async (user: User) => {
    await SupabaseService.saveUser(user);
    const users = await Database.getUsers();
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    localStorage.setItem(KEYS.USERS, JSON.stringify(updatedUsers));
  },

  // Session
  getSession: (): User | null => {
    const data = localStorage.getItem(KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  },
  saveSession: (user: User | null) => {
    if (user) {
      localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.SESSION);
    }
  },

  // Config
  getConfig: async (): Promise<SystemConfig | null> => {
    const remoteData = await SupabaseService.getConfig();
    if (remoteData) {
      localStorage.setItem(KEYS.CONFIG, JSON.stringify(remoteData));
      return remoteData;
    }
    const data = localStorage.getItem(KEYS.CONFIG);
    return data ? JSON.parse(data) : null;
  },
  saveConfig: async (config: SystemConfig) => {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
    await SupabaseService.saveConfig(config);
  },

  // Payment Verification
  getPaymentVerifications: async (): Promise<PaymentVerification[]> => {
    const remoteData = await SupabaseService.getPaymentVerifications();
    if (remoteData.length > 0) {
      localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(remoteData));
      return remoteData;
    }
    const data = localStorage.getItem(KEYS.PAYMENTS);
    return data ? JSON.parse(data) : [];
  },
  savePaymentVerification: async (verification: PaymentVerification) => {
    await SupabaseService.savePaymentVerification(verification);
    const current = await Database.getPaymentVerifications();
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify([verification, ...current.filter(p => p.id !== verification.id)]));
  },
  updatePaymentVerificationStatus: async (id: string, status: 'approved' | 'rejected') => {
    await SupabaseService.updatePaymentVerificationStatus(id, status);
    const current = await Database.getPaymentVerifications();
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(current.map(p => p.id === id ? { ...p, status } : p)));
  },

  // Messages
  getMessages: async (userId: string): Promise<any[]> => {
    return await SupabaseService.getMessages(userId);
  },
  subscribeToMessages: (userId: string, callback: (payload: any) => void) => {
    return SupabaseService.subscribeToMessages(userId, callback);
  },
  sendMessage: async (message: any) => {
    await SupabaseService.sendMessage(message);
  }
};
