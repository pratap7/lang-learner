/**
 * DeutschPfad Admin System Type Definitions
 * Role-Based Access Control (RBAC), Content Authoring, Audit Logging,
 * User & Subscription Management, Support Inbox, and Business KPIs.
 */

export type AdminRole = 'super_admin' | 'admin' | 'curator' | 'support_agent';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface AdminPermissions {
  canManageContent: boolean;
  canPublishContent: boolean;
  canManageUsers: boolean;
  canModifySubscriptions: boolean;
  canIssueRefunds: boolean;
  canManageFeatureFlags: boolean;
  canViewAnalytics: boolean;
  canViewAuditLogs: boolean;
  canManageAdmins: boolean;
}

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  super_admin: {
    canManageContent: true,
    canPublishContent: true,
    canManageUsers: true,
    canModifySubscriptions: true,
    canIssueRefunds: true,
    canManageFeatureFlags: true,
    canViewAnalytics: true,
    canViewAuditLogs: true,
    canManageAdmins: true,
  },
  admin: {
    canManageContent: true,
    canPublishContent: true,
    canManageUsers: true,
    canModifySubscriptions: true,
    canIssueRefunds: true,
    canManageFeatureFlags: true,
    canViewAnalytics: true,
    canViewAuditLogs: true,
    canManageAdmins: false,
  },
  curator: {
    canManageContent: true,
    canPublishContent: true,
    canManageUsers: false,
    canModifySubscriptions: false,
    canIssueRefunds: false,
    canManageFeatureFlags: false,
    canViewAnalytics: false,
    canViewAuditLogs: true,
    canManageAdmins: false,
  },
  support_agent: {
    canManageContent: false,
    canPublishContent: false,
    canManageUsers: true,
    canModifySubscriptions: false,
    canIssueRefunds: false,
    canManageFeatureFlags: false,
    canViewAnalytics: false,
    canViewAuditLogs: true,
    canManageAdmins: false,
  },
};

export type ContentReviewStatus = 'draft' | 'needs_review' | 'approved' | 'published';

export type ContentEntityType = 'unit' | 'lesson' | 'exercise' | 'graded_text';

export interface ReviewerNote {
  id: string;
  contentId: string;
  authorId: string;
  authorName: string;
  authorRole: AdminRole;
  note: string;
  statusTag?: ContentReviewStatus;
  createdAt: string;
}

export interface AdminContentItem {
  id: string;
  entityType: ContentEntityType;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'all';
  slug: string;
  title: string;
  titleDe: string;
  reviewStatus: ContentReviewStatus;
  parentId?: string; // Unit ID for lessons, Lesson ID for exercises
  orderIndex: number;
  contentPayload: Record<string, any>;
  reviewerNotes: ReviewerNote[];
  createdBy: string;
  lastModifiedBy: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetAudiences: string[];
  isKillswitch: boolean;
  updatedBy: string;
  updatedAt: string;
}

export type SupportTicketStatus = 'open' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed';
export type SupportTicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type SupportTicketCategory = 'billing' | 'content_feedback' | 'technical_bug' | 'account_access' | 'feature_request';

export interface SupportTicketMessage {
  id: string;
  ticketId: string;
  senderType: 'customer' | 'agent' | 'system_event' | 'internal_note';
  senderName: string;
  senderEmail: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId?: string;
  userEmail: string;
  userName: string;
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  assignedTo?: string;
  lastMessageAt: string;
  messages: SupportTicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminRole: AdminRole;
  action: string;
  targetEntityType: string;
  targetEntityId: string;
  description: string;
  changesDiff?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AdminAnalyticsKPIs {
  period: '7d' | '30d' | '90d' | '1y' | 'all';
  signups: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    growthRateMonth: number; // percentage
  };
  activeUsers: {
    dau: number;
    mau: number;
    stickinessRatio: number; // DAU/MAU in %
    avgDailyMinutes: number;
  };
  conversion: {
    freeToPaidRate: number; // percentage e.g. 8.4%
    trialToPaidRate: number; // percentage e.g. 68.2%
    totalPaidSubscribers: number;
    activeTrials: number;
  };
  mrr: {
    totalMrr: number; // e.g. 42650
    mrrPro: number;
    mrrProPlus: number;
    arpu: number; // Average Revenue Per User
    arr: number; // Annualized Run Rate
    mrrGrowthMoM: number; // %
  };
  churn: {
    monthlyChurnRate: number; // % e.g. 2.1%
    cancellationsCount: number;
    pauseRate: number;
    winbackSuccessRate: number; // % e.g. 22.4%
  };
  aiCostPerUser: {
    monthlyAiTotalCost: number; // e.g. 2140
    costPerActiveUser: number; // e.g. $0.42
    grossMarginPercent: number; // e.g. 96.5%
    tokenVolumeMillions: number; // e.g. 84.5M
    audioHoursSynthesized: number; // e.g. 320 hrs
    costByProvider: {
      openaiGpt4oMini: number;
      whisperSpeechToText: number;
      elevenLabsTts: number;
    };
  };
  revenueHistory: {
    date: string;
    mrr: number;
    signups: number;
    paidUsers: number;
    aiCost: number;
  }[];
}

export interface AdminLearnerUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  cefrLevel: string;
  streakDays: number;
  totalXp: number;
  subscriptionPlan: 'free' | 'pro' | 'pro_plus';
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'paused' | 'canceled';
  billingCycle: 'monthly' | 'annual';
  currency: string;
  paymentProvider: 'stripe' | 'razorpay' | 'paddle' | 'lemonsqueezy';
  trialEndsAt?: string;
  renewalDate?: string;
  isPaused: boolean;
  country: string;
  createdAt: string;
  lastActiveAt: string;
}
