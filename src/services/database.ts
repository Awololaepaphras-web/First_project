
import { PastQuestion, Post, User, SystemConfig, PaymentVerification } from '../../types';
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
  updateDocumentStatus: async (id: string, status: 'approved' | 'rejected') => {
    await SupabaseService.updateDocumentStatus(id, status);
    const current = await Database.getDocuments();
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(current.map(d => d.id === id ? { ...d, status } : d)));
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

  // Gladiator Hub
  getGladiatorData: async () => {
    const remoteVault = await SupabaseService.getGladiatorVault();
    const data = localStorage.getItem(KEYS.GLADIATOR);
    const local = data ? JSON.parse(data) : { vault: [], history: [], stats: {} };
    return { ...local, vault: remoteVault.length > 0 ? remoteVault : local.vault };
  },
  saveGladiatorData: async (data: any) => {
    localStorage.setItem(KEYS.GLADIATOR, JSON.stringify(data));
    if (data.vault && data.vault.length > 0) {
      // Save the latest item as an example or sync all
      await SupabaseService.saveGladiatorItem(data.vault[0]);
    }
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
    // Sync all users to remote
    for (const user of users) {
      await SupabaseService.saveUser(user);
    }
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

  // Advertisements
  getAds: async (): Promise<any[]> => {
    return await SupabaseService.getAds();
  },
  saveAd: async (ad: any) => {
    await SupabaseService.saveAd(ad);
  },
  deleteAd: async (id: string) => {
    await SupabaseService.deleteAd(id);
  },

  // Withdrawal Requests
  getWithdrawalRequests: async (): Promise<any[]> => {
    return await SupabaseService.getWithdrawalRequests();
  },
  saveWithdrawalRequest: async (req: any) => {
    await SupabaseService.saveWithdrawalRequest(req);
  },
  updateWithdrawalStatus: async (id: string, status: string) => {
    await SupabaseService.updateWithdrawalStatus(id, status);
  },

  // Tasks
  getTasks: async (): Promise<any[]> => {
    return await SupabaseService.getTasks();
  },
  saveTask: async (task: any) => {
    await SupabaseService.saveTask(task);
  },
  deleteTask: async (id: string) => {
    await SupabaseService.deleteTask(id);
  },

  // Universities
  getUniversities: async (): Promise<any[]> => {
    return await SupabaseService.getUniversities();
  },
  saveUniversity: async (uni: any) => {
    await SupabaseService.saveUniversity(uni);
  },
  deleteUniversity: async (id: string) => {
    await SupabaseService.deleteUniversity(id);
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
