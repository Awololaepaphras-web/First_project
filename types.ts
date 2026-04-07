
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'bounty';
  createdAt: number;
  read: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  level: 'bronze' | 'silver' | 'gold';
  requirementType: 'hours' | 'actions' | 'uploads' | 'referrals';
  requirementValue: number;
  image: string;
}

export interface UserAnalytics {
  date: string;
  timeSpentMinutes: number;
  navigations: number;
  redirectionTimeSpent: number;
  engagement: {
    likes: number;
    replies: number;
    reposts: number;
    linkClicks: number;
    profileClicks: number;
    mediaViews: number;
  }
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userNickname: string;
  userUniversity: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: string[];
  comments: PostComment[];
  reposts: string[];
  parentId?: string;
  tags?: string[];
  visibility?: 'public' | 'node_only' | 'private';
  isEdited?: boolean;
  adId?: string;
  createdAt: number;
  stats: {
    linkClicks: number;
    profileClicks: number;
    mediaViews: number;
    detailsExpanded: number;
    impressions: number;
  }
}

export interface PostComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  likes: string[];
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  nickname: string;
  email?: string;
  password?: string;
  profilePicture?: string;
  university: string;
  level: string;
  role: 'student' | 'admin' | 'moderator' | 'sub-admin' | 'staff';
  status?: 'active' | 'suspended';
  points?: number;
  isPremium?: boolean;
  isSugVerified?: boolean;
  premiumExpiry?: number;
  referralCode: string;
  followers?: string[];
  following?: string[];
  blockedUsers?: string[];
  completedTasks?: string[];
  arenaHistory?: string[];
  isVerified?: boolean;
  verificationCode?: string;
  referredBy?: string;
  hasSeenOnboarding?: boolean;
  referralStats?: { 
    clicks: number; 
    signups: number; 
    withdrawals: number;
    loginStreaks: number;
  };
  referralCount?: number;
  aiAppUnlockedUntil?: number;
  engagementScore?: number;
  registrationIp?: string;
  phone?: string;
  createdAt?: number;
  themePreference?: 'light' | 'dark';
  staffPermissions?: string[];
  lifetimeMinutes?: number;
  lifetimeNavigations?: number;
  engagementStats?: {
    totalLikesGiven: number;
    totalRepliesGiven: number;
    totalRepostsGiven: number;
    totalLinkClicks: number;
    totalProfileClicks: number;
    totalMediaViews: number;
    totalImpressions?: number;
    totalLikesReceived?: number;
    totalRepostsReceived?: number;
  }
  bankDetails?: { accountName: string; accountNumber: string; bankName: string };
  gladiatorEarnings?: number;
  monetization?: {
    isMonetized: boolean;
    isEligibleForPoints: boolean;
    totalEarningsNGN: number;
    pendingBalanceNGN: number;
    lastPayoutDate?: number;
    impressionsLast3Months: number;
    pointsEarned: number;
    engagementEarnings?: {
      repliesWeight: number;
      likesWeight: number;
      repostsWeight: number;
    };
  };
}

export interface PastQuestion {
  id: string;
  universityId?: string;
  courseCode?: string;
  courseTitle?: string;
  year?: number;
  semester?: 'First' | 'Second';
  faculty?: string;
  department?: string;
  level?: string;
  description?: string;
  fileUrl: string;
  data?: string; // Base64 data for Gemini analysis
  visibility?: 'public' | 'private';
  type: 'document' | 'image';
  status: 'pending' | 'approved' | 'rejected';
  uploadedBy: string;
  createdAt: number;
  reviews?: { userId: string; rating: number; comment: string; createdAt: number }[];
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  points: number;
  amount: number;
  bankDetails: { accountName: string; accountNumber: string; bankName: string };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

export interface University {
  id: string;
  name: string;
  acronym: string;
  location: string;
  logo: string;
  logoUrl?: string;
  studentCount?: number;
  isVerified?: boolean;
  createdAt?: number;
  rating?: number;
}

export interface StudyDocument {
  id: string;
  name: string;
  url?: string;
  data?: string;
  type: string;
  uploadedAt: number;
}

export interface AIMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string | null;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  expiresAt?: number;
  createdAt: number;
}

export interface Report {
  id: string;
  reporterId: string;
  targetId: string; // Post ID or User ID
  targetType: 'post' | 'user' | 'comment';
  reason: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: number;
}

export interface Status {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'gif';
  caption?: string;
  renewed: boolean;
  expiresAt: number;
  createdAt: number;
}

export interface AdPricing {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface EarnTask {
  id: string;
  title: string;
  points: number;
  link: string;
  question?: string;
  verificationQuestion?: string;
}

export type AdTimeFrame = '12am-6am' | '6am-12pm' | '12pm-6pm' | '6pm-12am' | 'all-day';

export type AdType = 'banner' | 'popup' | 'native' | 'fullscreen';
export type AdPlacement = 'timeline' | 'search' | 'post' | 'profile' | 'replies' | 'university' | 'study-hub' | 'startup';

export interface Advertisement {
  id: string;
  userId?: string;
  title: string;
  type: 'image' | 'video';
  adType?: AdType; // Deprecated: use adTypes
  adTypes: AdType[];
  placement?: AdPlacement; // Deprecated: use placements
  placements: AdPlacement[];
  mediaUrl: string;
  duration: number;
  link?: string;
  targetLocation: string;
  campaignDuration?: number;
  campaignUnit?: 'days' | 'weeks' | 'months';
  timesPerDay?: number;
  targetReach?: number | 'all';
  timeFrames?: AdTimeFrame[];
  expiryDate?: number;
  isSponsored?: boolean;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'payment_pending' | 'pending_review' | 'rejected';
  analytics?: {
    impressions: number;
    clicks: number;
    ctr: number;
    spend: number;
    date: string;
  }[];
}

export interface GladiatorVaultItem {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadedAt: number;
  category: string;
  textPreview: string;
  arenaHistory: string[];
}

export interface PaymentVerification {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  type: 'premium' | 'ad' | 'other';
  amount: number;
  reference: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  details?: any;
}

export interface SystemConfig {
  isAiEnabled: boolean;
  isUploadEnabled: boolean;
  isWithdrawalEnabled: boolean;
  isMaintenanceMode: boolean;
  isCommunityEnabled: boolean;
  isAdsEnabled: boolean;
  isUserAdsEnabled: boolean;
  isPastQuestionContributionEnabled: boolean;
  isSplashScreenEnabled: boolean;
  isMessagingEnabled: boolean;
  feedWeights: { engagement: number; recency: number; relationship: number; quality: number; eduRelevance: number };
  adWeights: { budget: number; relevance: number; performance: number; targetMatch: number };
  earnRates: {
    contribution: number;
    referral: number;
    adClick: number;
    arena: number;
    likeReward: number;
    replyReward: number;
    repostReward: number;
  };
  nairaPerPoint: number;
  adPricing: AdPricing;
  engagementWeights: {
    replies: number;
    likes: number;
    reposts: number;
  };
  premiumTiers: {
    weekly: number;
    monthly: number;
    yearly: number;
  };
  paymentAccount: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  isCardPaymentEnabled: boolean;
  replyCost: number;
  appLogo?: string;
  appIcon?: string;
  splashScreenUrl?: string;
  globalAnnouncement?: {
    text: string;
    isEnabled: boolean;
    type: 'info' | 'warning' | 'success' | 'error';
  };
}
