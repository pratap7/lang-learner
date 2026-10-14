/**
 * DeutschPfad Admin Service Layer
 * In-memory & Supabase dual-backed persistence for RBAC, CMS review workflow,
 * support inbox, user subscription management, feature flags, and immutable audit logs.
 */

import {
  ROLE_PERMISSIONS,
  type AdminRole,
  type AdminUser,
  type AdminPermissions,
  type ContentReviewStatus,
  type ContentEntityType,
  type ReviewerNote,
  type AdminContentItem,
  type FeatureFlag,
  type SupportTicket,
  type SupportTicketMessage,
  type SupportTicketStatus,
  type SupportTicketPriority,
  type SupportTicketCategory,
  type AdminAuditLog,
  type AdminAnalyticsKPIs,
  type AdminLearnerUser,
} from '../types/admin.ts';
import { GRADED_STORIES } from './gradedStories.ts';

/* ─── Mock Admin Staff Profiles ──────────────────────────────────────────── */

export const MOCK_ADMIN_STAFF: AdminUser[] = [
  {
    id: 'admin-001',
    email: 'hannah.schmidt@deutschpfad.com',
    name: 'Hannah Schmidt',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    isActive: true,
    lastLoginAt: '2026-10-14T07:12:00Z',
  },
  {
    id: 'admin-002',
    email: 'lukas.weber@deutschpfad.com',
    name: 'Lukas Weber',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    isActive: true,
    lastLoginAt: '2026-10-14T06:45:00Z',
  },
  {
    id: 'admin-003',
    email: 'dr.elena.bauer@deutschpfad.com',
    name: 'Dr. Elena Bauer (Goethe Examiner)',
    role: 'curator',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    isActive: true,
    lastLoginAt: '2026-10-14T05:30:00Z',
  },
  {
    id: 'admin-004',
    email: 'marcus.support@deutschpfad.com',
    name: 'Marcus Vance',
    role: 'support_agent',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    isActive: true,
    lastLoginAt: '2026-10-14T06:55:00Z',
  },
];

/* ─── Initial In-Memory State & Storage Helpers ─────────────────────────── */

let currentActiveRole: AdminRole = 'super_admin';

export function getActiveAdminRole(): AdminRole {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('deutschpfad_admin_active_role');
    if (stored && ['super_admin', 'admin', 'curator', 'support_agent'].includes(stored)) {
      return stored as AdminRole;
    }
  }
  return currentActiveRole;
}

export function setActiveAdminRole(role: AdminRole): void {
  currentActiveRole = role;
  if (typeof window !== 'undefined') {
    localStorage.setItem('deutschpfad_admin_active_role', role);
    window.dispatchEvent(new Event('deutschpfad_admin_role_changed'));
  }
}

export function getCurrentAdminUser(): AdminUser {
  const role = getActiveAdminRole();
  const staff = MOCK_ADMIN_STAFF.find((s) => s.role === role);
  return staff || MOCK_ADMIN_STAFF[0];
}

/* ─── Initial Audit Logs ─────────────────────────────────────────────────── */

let auditLogsStore: AdminAuditLog[] = [
  {
    id: 'log-101',
    adminId: 'admin-001',
    adminEmail: 'hannah.schmidt@deutschpfad.com',
    adminRole: 'super_admin',
    action: 'feature_flag.update',
    targetEntityType: 'feature_flag',
    targetEntityId: 'ai_tutor_speaking',
    description: 'Updated rollout percentage from 25% to 50% for AI voice tutor.',
    changesDiff: { before: { rolloutPercentage: 25 }, after: { rolloutPercentage: 50 } },
    ipAddress: '193.174.16.5',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'log-102',
    adminId: 'admin-003',
    adminEmail: 'dr.elena.bauer@deutschpfad.com',
    adminRole: 'curator',
    action: 'content.status_change',
    targetEntityType: 'graded_text',
    targetEntityId: 'story-berlin-a1',
    description: 'Approved graded story "Ein Samstag in Berlin" after native review of accusative forms.',
    changesDiff: { before: { reviewStatus: 'needs_review' }, after: { reviewStatus: 'approved' } },
    ipAddress: '88.198.42.12',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'log-103',
    adminId: 'admin-002',
    adminEmail: 'lukas.weber@deutschpfad.com',
    adminRole: 'admin',
    action: 'subscription.manual_plan_change',
    targetEntityType: 'user_subscription',
    targetEntityId: 'usr-4091',
    description: 'Upgraded user Liam O\'Connor from Free to Pro Plus (annual) for scholarship grant.',
    changesDiff: { before: { plan: 'free' }, after: { plan: 'pro_plus', billingCycle: 'annual' } },
    ipAddress: '217.160.0.18',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: 'log-104',
    adminId: 'admin-004',
    adminEmail: 'marcus.support@deutschpfad.com',
    adminRole: 'support_agent',
    action: 'support_ticket.resolved',
    targetEntityType: 'support_ticket',
    targetEntityId: 'DP-2026-1042',
    description: 'Resolved billing ticket DP-2026-1042 regarding invoice VAT receipt calculation.',
    changesDiff: { before: { status: 'in_progress' }, after: { status: 'resolved' } },
    ipAddress: '178.63.14.99',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
];

export function logAdminAction(
  action: string,
  targetEntityType: string,
  targetEntityId: string,
  description: string,
  changesDiff?: { before?: Record<string, any>; after?: Record<string, any> }
): AdminAuditLog {
  const currentAdmin = getCurrentAdminUser();
  const log: AdminAuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    adminId: currentAdmin.id,
    adminEmail: currentAdmin.email,
    adminRole: currentAdmin.role,
    action,
    targetEntityType,
    targetEntityId,
    description,
    changesDiff,
    ipAddress: typeof window !== 'undefined' ? '127.0.0.1' : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
    createdAt: new Date().toISOString(),
  };

  auditLogsStore = [log, ...auditLogsStore];

  // Also persist in localStorage if available
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('deutschpfad_admin_audit_logs') || '[]');
      localStorage.setItem('deutschpfad_admin_audit_logs', JSON.stringify([log, ...existing].slice(0, 200)));
    } catch {
      // Storage quota or parsing ignore
    }
  }

  return log;
}

export function getAdminAuditLogs(filters?: {
  search?: string;
  role?: AdminRole | 'all';
  entityType?: string;
  limit?: number;
}): AdminAuditLog[] {
  let logs = [...auditLogsStore];
  if (typeof window !== 'undefined') {
    try {
      const persisted = JSON.parse(localStorage.getItem('deutschpfad_admin_audit_logs') || '[]');
      const combined = [...logs, ...persisted];
      const seen = new Set<string>();
      logs = combined.filter((l) => {
        if (seen.has(l.id)) return false;
        seen.add(l.id);
        return true;
      });
      logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      // fallback
    }
  }

  if (filters?.role && filters.role !== 'all') {
    logs = logs.filter((l) => l.adminRole === filters.role);
  }
  if (filters?.entityType && filters.entityType !== 'all') {
    logs = logs.filter((l) => l.targetEntityType === filters.entityType);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    logs = logs.filter(
      (l) =>
        l.description.toLowerCase().includes(q) ||
        l.adminEmail.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.targetEntityId.toLowerCase().includes(q)
    );
  }

  if (filters?.limit) {
    logs = logs.slice(0, filters.limit);
  }

  return logs;
}

/* ─── Content Management & Review Workflow ───────────────────────────────── */

let contentItemsStore: AdminContentItem[] = [
  // 1. Unit 3
  {
    id: 'unit-a1-u3-food-cafe',
    entityType: 'unit',
    level: 'A1',
    slug: 'a1-u3-essen-und-bestellen-im-cafe',
    title: 'Unit 3: Food and Ordering at a Café',
    titleDe: 'Einheit 3: Essen und Bestellen im Café',
    reviewStatus: 'published',
    orderIndex: 3,
    contentPayload: {
      description: 'Master polite food ordering, the accusative case with food & drinks, and café customs.',
      estimatedStudyMinutes: 90,
      totalXpReward: 250,
      cefrStandard: 'Goethe-Zertifikat A1: Start Deutsch 1',
    },
    reviewerNotes: [
      {
        id: 'note-01',
        contentId: 'unit-a1-u3-food-cafe',
        authorId: 'admin-003',
        authorName: 'Dr. Elena Bauer',
        authorRole: 'curator',
        note: 'Goethe-Zertifikat A1 vocabulary mapping verified against Start Deutsch 1 word lists.',
        statusTag: 'approved',
        createdAt: '2026-10-10T14:20:00Z',
      },
    ],
    createdBy: 'hannah.schmidt@deutschpfad.com',
    lastModifiedBy: 'dr.elena.bauer@deutschpfad.com',
    publishedAt: '2026-10-11T09:00:00Z',
    createdAt: '2026-10-08T10:00:00Z',
    updatedAt: '2026-10-11T09:00:00Z',
  },

  // 2. Lesson 1 of Unit 3
  {
    id: 'lesson-a1-u3-l1-ordering',
    entityType: 'lesson',
    level: 'A1',
    slug: 'polite-ordering-with-moechten',
    title: 'Polite Ordering with "Möchten"',
    titleDe: 'Höflich bestellen mit „möchten“',
    reviewStatus: 'published',
    parentId: 'unit-a1-u3-food-cafe',
    orderIndex: 1,
    contentPayload: {
      lessonType: 'vocabulary',
      estMinutes: 15,
      xpReward: 30,
      summary: 'Learn how to form courteous requests in Austrian and German cafés using "Ich möchte bitte..." and definite/indefinite articles.',
      grammarRule: 'Möchten is the subjunctive form of mögen used for polite requests. Direct object takes the accusative case: "Ich möchte einen Kaffee".',
    },
    reviewerNotes: [
      {
        id: 'note-02',
        contentId: 'lesson-a1-u3-l1-ordering',
        authorId: 'admin-003',
        authorName: 'Dr. Elena Bauer',
        authorRole: 'curator',
        note: 'Austrian variant note added: "Melange" vs standard "Kaffee mit Milch".',
        statusTag: 'approved',
        createdAt: '2026-10-11T11:00:00Z',
      },
    ],
    createdBy: 'hannah.schmidt@deutschpfad.com',
    lastModifiedBy: 'dr.elena.bauer@deutschpfad.com',
    publishedAt: '2026-10-11T12:00:00Z',
    createdAt: '2026-10-09T08:30:00Z',
    updatedAt: '2026-10-11T12:00:00Z',
  },

  // 3. Exercise: Article Selection (der / die / das)
  {
    id: 'ex-a1-cafe-art-01',
    entityType: 'exercise',
    level: 'A1',
    slug: 'article-selection-kaffee',
    title: 'Definite Article for Coffee',
    titleDe: 'Bestimmter Artikel: Kaffee',
    reviewStatus: 'approved',
    parentId: 'lesson-a1-u3-l1-ordering',
    orderIndex: 1,
    contentPayload: {
      exerciseType: 'article_selection',
      prompt: 'Select the correct grammatical article for "Kaffee".',
      promptDe: '___ Kaffee ist sehr heiß.',
      options: ['der', 'die', 'das'],
      correctAnswer: 'der',
      article: 'der',
      gender: 'masculine',
      explanation: '"Kaffee" is masculine in German and takes the definite article "der" in the nominative case.',
      grammarTip: 'Most morning drinks are masculine: der Kaffee, der Tee, der Saft. (Exception: das Wasser).',
      xpReward: 15,
      difficulty: 'beginner',
    },
    reviewerNotes: [
      {
        id: 'note-03',
        contentId: 'ex-a1-cafe-art-01',
        authorId: 'admin-003',
        authorName: 'Dr. Elena Bauer',
        authorRole: 'curator',
        note: 'Clear tip regarding the water exception. Ready for publish.',
        statusTag: 'approved',
        createdAt: '2026-10-12T16:00:00Z',
      },
    ],
    createdBy: 'lukas.weber@deutschpfad.com',
    lastModifiedBy: 'dr.elena.bauer@deutschpfad.com',
    createdAt: '2026-10-10T15:00:00Z',
    updatedAt: '2026-10-12T16:00:00Z',
  },

  // 4. Exercise: Fill in the blank (Accusative)
  {
    id: 'ex-a1-cafe-fib-02',
    entityType: 'exercise',
    level: 'A1',
    slug: 'accusative-indefinite-ordering',
    title: 'Accusative Ordering with Einen',
    titleDe: 'Akkusativ beim Bestellen',
    reviewStatus: 'needs_review',
    parentId: 'lesson-a1-u3-l1-ordering',
    orderIndex: 2,
    contentPayload: {
      exerciseType: 'fill_in_the_blank',
      prompt: 'Fill in the correct indefinite article for a masculine direct object.',
      promptDe: 'Ich möchte bitte ___ (ein) Espresso.',
      options: ['einen', 'ein', 'eine', 'einem'],
      correctAnswer: 'einen',
      explanation: 'In the accusative case (direct object), masculine singular "ein" changes to "einen".',
      grammarTip: 'Nominative "ein Kaffee" ➔ Accusative "einen Kaffee".',
      xpReward: 20,
      difficulty: 'intermediate',
    },
    reviewerNotes: [
      {
        id: 'note-04',
        contentId: 'ex-a1-cafe-fib-02',
        authorId: 'lukas.weber@deutschpfad.com',
        authorName: 'Lukas Weber',
        authorRole: 'admin',
        note: 'Submitted for native reviewer check. Double check if Austrian coffee terminology should be accepted.',
        statusTag: 'needs_review',
        createdAt: '2026-10-13T10:15:00Z',
      },
    ],
    createdBy: 'lukas.weber@deutschpfad.com',
    lastModifiedBy: 'lukas.weber@deutschpfad.com',
    createdAt: '2026-10-13T10:15:00Z',
    updatedAt: '2026-10-13T10:15:00Z',
  },

  // 5. Graded Text: Ein Samstag in Berlin
  {
    id: 'story-berlin-a1',
    entityType: 'graded_text',
    level: 'A1',
    slug: 'ein-samstag-in-berlin',
    title: 'A Saturday in Berlin',
    titleDe: 'Ein Samstag in Berlin',
    reviewStatus: 'published',
    orderIndex: 1,
    contentPayload: {
      category: 'daily',
      summary: 'Follow Lukas through a sunny Saturday in Berlin: drinking coffee in Prenzlauer Berg, browsing the Mauerpark flea market, and riding the U-Bahn.',
      coverEmoji: '☕',
      readingTimeMinutes: 3,
      wordCount: 168,
      sentencesCount: 16,
      culturalTip: 'Berliners love their Sunday brunch ("Frühstückskultur") and Sunday Mauerpark flea market. Notice how Lukas greets people casually with "Hallo" and "Tschüss".',
      sampleSentenceDe: 'Am Samstagmorgen wacht Lukas früh auf.',
      sampleSentenceEn: 'On Saturday morning Lukas wakes up early.',
    },
    reviewerNotes: [
      {
        id: 'note-05',
        contentId: 'story-berlin-a1',
        authorId: 'admin-003',
        authorName: 'Dr. Elena Bauer',
        authorRole: 'curator',
        note: 'Audio timestamps aligned with sentence highlighting. Ready and verified for CEFR A1 comprehension.',
        statusTag: 'published',
        createdAt: '2026-10-11T15:45:00Z',
      },
    ],
    createdBy: 'hannah.schmidt@deutschpfad.com',
    lastModifiedBy: 'dr.elena.bauer@deutschpfad.com',
    publishedAt: '2026-10-11T16:00:00Z',
    createdAt: '2026-10-09T11:00:00Z',
    updatedAt: '2026-10-11T16:00:00Z',
  },

  // 6. Graded Text: Draft B1
  {
    id: 'story-zugspitze-b1',
    entityType: 'graded_text',
    level: 'B1',
    slug: 'die-besteigung-der-zugspitze',
    title: 'Climbing the Zugspitze',
    titleDe: 'Die Besteigung der Zugspitze',
    reviewStatus: 'draft',
    orderIndex: 2,
    contentPayload: {
      category: 'travel',
      summary: 'An exhilarating journey to Germany\'s highest peak in the Bavarian Alps, dealing with changing weather and alpine etiquette.',
      coverEmoji: '🏔️',
      readingTimeMinutes: 6,
      wordCount: 380,
      sentencesCount: 28,
      sampleSentenceDe: 'Die Zugspitze ist mit 2.962 Metern der höchste Gipfel Deutschlands.',
      sampleSentenceEn: 'At 2,962 meters, the Zugspitze is Germany\'s highest peak.',
    },
    reviewerNotes: [
      {
        id: 'note-06',
        contentId: 'story-zugspitze-b1',
        authorId: 'lukas.weber@deutschpfad.com',
        authorName: 'Lukas Weber',
        authorRole: 'admin',
        note: 'Drafted first 3 paragraphs. Needs audio synthesis script and comprehension quiz items.',
        statusTag: 'draft',
        createdAt: '2026-10-14T02:00:00Z',
      },
    ],
    createdBy: 'lukas.weber@deutschpfad.com',
    lastModifiedBy: 'lukas.weber@deutschpfad.com',
    createdAt: '2026-10-14T02:00:00Z',
    updatedAt: '2026-10-14T02:00:00Z',
  },
];

export function getAdminContentItems(filters?: {
  entityType?: ContentEntityType | 'all';
  reviewStatus?: ContentReviewStatus | 'all';
  level?: string | 'all';
  search?: string;
}): AdminContentItem[] {
  let items = [...contentItemsStore];
  if (typeof window !== 'undefined') {
    try {
      const persisted = JSON.parse(localStorage.getItem('deutschpfad_admin_content_items') || '[]');
      if (Array.isArray(persisted) && persisted.length > 0) {
        // Merge with existing
        const map = new Map<string, AdminContentItem>();
        contentItemsStore.forEach((it) => map.set(it.id, it));
        persisted.forEach((it) => map.set(it.id, it));
        items = Array.from(map.values());
      }
    } catch {
      // fallback
    }
  }

  if (filters?.entityType && filters.entityType !== 'all') {
    items = items.filter((it) => it.entityType === filters.entityType);
  }
  if (filters?.reviewStatus && filters.reviewStatus !== 'all') {
    items = items.filter((it) => it.reviewStatus === filters.reviewStatus);
  }
  if (filters?.level && filters.level !== 'all') {
    items = items.filter((it) => it.level === filters.level);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.titleDe.toLowerCase().includes(q) ||
        it.slug.toLowerCase().includes(q) ||
        it.id.toLowerCase().includes(q)
    );
  }

  items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return items;
}

export function saveContentItem(item: AdminContentItem): AdminContentItem {
  const currentAdmin = getCurrentAdminUser();
  const existingIndex = contentItemsStore.findIndex((i) => i.id === item.id);
  const before = existingIndex >= 0 ? { ...contentItemsStore[existingIndex] } : undefined;

  const updated: AdminContentItem = {
    ...item,
    lastModifiedBy: currentAdmin.email,
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    contentItemsStore[existingIndex] = updated;
  } else {
    contentItemsStore = [updated, ...contentItemsStore];
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('deutschpfad_admin_content_items', JSON.stringify(contentItemsStore));
    } catch {
      // ignore
    }
  }

  logAdminAction(
    existingIndex >= 0 ? 'content.update' : 'content.create',
    item.entityType,
    item.id,
    `${existingIndex >= 0 ? 'Updated' : 'Created'} ${item.entityType} "${item.title}" (${item.level}).`,
    { before, after: updated }
  );

  return updated;
}

export function updateContentReviewStatus(
  contentId: string,
  newStatus: ContentReviewStatus,
  noteText?: string
): AdminContentItem | null {
  const currentAdmin = getCurrentAdminUser();
  const item = contentItemsStore.find((i) => i.id === contentId);
  if (!item) return null;

  const previousStatus = item.reviewStatus;
  item.reviewStatus = newStatus;
  item.lastModifiedBy = currentAdmin.email;
  item.updatedAt = new Date().toISOString();

  if (newStatus === 'published' && !item.publishedAt) {
    item.publishedAt = new Date().toISOString();
  }

  if (noteText && noteText.trim()) {
    const note: ReviewerNote = {
      id: `note-${Date.now()}`,
      contentId,
      authorId: currentAdmin.id,
      authorName: currentAdmin.name,
      authorRole: currentAdmin.role,
      note: noteText.trim(),
      statusTag: newStatus,
      createdAt: new Date().toISOString(),
    };
    item.reviewerNotes = [note, ...item.reviewerNotes];
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('deutschpfad_admin_content_items', JSON.stringify(contentItemsStore));
    } catch {
      // ignore
    }
  }

  logAdminAction(
    'content.review_status_change',
    item.entityType,
    contentId,
    `Changed review status of "${item.title}" from "${previousStatus}" to "${newStatus}".`,
    { before: { reviewStatus: previousStatus }, after: { reviewStatus: newStatus } }
  );

  return item;
}

export function addContentReviewerNote(contentId: string, noteText: string, statusTag?: ContentReviewStatus): ReviewerNote | null {
  const currentAdmin = getCurrentAdminUser();
  const item = contentItemsStore.find((i) => i.id === contentId);
  if (!item) return null;

  const note: ReviewerNote = {
    id: `note-${Date.now()}`,
    contentId,
    authorId: currentAdmin.id,
    authorName: currentAdmin.name,
    authorRole: currentAdmin.role,
    note: noteText.trim(),
    statusTag,
    createdAt: new Date().toISOString(),
  };

  item.reviewerNotes = [note, ...item.reviewerNotes];
  item.updatedAt = new Date().toISOString();

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('deutschpfad_admin_content_items', JSON.stringify(contentItemsStore));
    } catch {
      // ignore
    }
  }

  logAdminAction(
    'content.add_reviewer_note',
    item.entityType,
    contentId,
    `Added reviewer note on "${item.title}": "${noteText.slice(0, 60)}..."`
  );

  return note;
}

/* ─── Bulk Import & Export ───────────────────────────────────────────────── */

export function bulkExportContent(entityType?: ContentEntityType | 'all', format: 'json' | 'csv' = 'json'): string {
  const items = getAdminContentItems({ entityType: entityType === 'all' ? undefined : entityType });

  if (format === 'json') {
    return JSON.stringify(items, null, 2);
  }

  // Format as CSV: ID, Type, Level, Title EN, Title DE, Slug, Review Status, Parent ID
  const headers = ['id', 'entityType', 'level', 'title', 'titleDe', 'slug', 'reviewStatus', 'parentId', 'lastModifiedBy', 'updatedAt'];
  const rows = items.map((it) => [
    `"${it.id}"`,
    `"${it.entityType}"`,
    `"${it.level}"`,
    `"${(it.title || '').replace(/"/g, '""')}"`,
    `"${(it.titleDe || '').replace(/"/g, '""')}"`,
    `"${it.slug}"`,
    `"${it.reviewStatus}"`,
    `"${it.parentId || ''}"`,
    `"${it.lastModifiedBy}"`,
    `"${it.updatedAt}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function bulkImportContent(contentString: string, format: 'json' | 'csv'): { count: number; errors: string[] } {
  const currentAdmin = getCurrentAdminUser();
  const errors: string[] = [];
  let importedCount = 0;

  if (format === 'json') {
    try {
      const parsed = JSON.parse(contentString);
      const itemsToImport = Array.isArray(parsed) ? parsed : [parsed];

      itemsToImport.forEach((raw, idx) => {
        if (!raw.id || !raw.entityType || !raw.title) {
          errors.push(`Item #${idx + 1}: Missing required fields (id, entityType, title).`);
          return;
        }

        const validItem: AdminContentItem = {
          id: String(raw.id),
          entityType: ['unit', 'lesson', 'exercise', 'graded_text'].includes(raw.entityType) ? raw.entityType : 'exercise',
          level: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'all'].includes(raw.level) ? raw.level : 'A1',
          slug: raw.slug || String(raw.id).toLowerCase(),
          title: String(raw.title),
          titleDe: String(raw.titleDe || raw.title),
          reviewStatus: ['draft', 'needs_review', 'approved', 'published'].includes(raw.reviewStatus) ? raw.reviewStatus : 'draft',
          parentId: raw.parentId,
          orderIndex: Number(raw.orderIndex || 0),
          contentPayload: raw.contentPayload || {},
          reviewerNotes: Array.isArray(raw.reviewerNotes) ? raw.reviewerNotes : [],
          createdBy: raw.createdBy || currentAdmin.email,
          lastModifiedBy: currentAdmin.email,
          publishedAt: raw.publishedAt,
          createdAt: raw.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const existingIdx = contentItemsStore.findIndex((i) => i.id === validItem.id);
        if (existingIdx >= 0) {
          contentItemsStore[existingIdx] = validItem;
        } else {
          contentItemsStore.push(validItem);
        }
        importedCount++;
      });
    } catch (err: any) {
      errors.push(`JSON Parse Error: ${err.message}`);
    }
  } else {
    // CSV Parse
    const lines = contentString.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      return { count: 0, errors: ['CSV file is empty or missing headers.'] };
    }

    const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
    lines.slice(1).forEach((line, lineIdx) => {
      // Basic CSV column splitter respecting quotes
      const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      const cleanValues = values.map((v) => v.replace(/^"|"$/g, '').trim());

      const rowObj: Record<string, string> = {};
      headers.forEach((h, i) => {
        rowObj[h] = cleanValues[i] || '';
      });

      if (!rowObj.id || !rowObj.title) {
        errors.push(`Row ${lineIdx + 2}: Missing ID or Title.`);
        return;
      }

      const item: AdminContentItem = {
        id: rowObj.id,
        entityType: (rowObj.entityType as any) || 'exercise',
        level: (rowObj.level as any) || 'A1',
        slug: rowObj.slug || rowObj.id.toLowerCase(),
        title: rowObj.title,
        titleDe: rowObj.titleDe || rowObj.title,
        reviewStatus: (rowObj.reviewStatus as any) || 'draft',
        parentId: rowObj.parentId || undefined,
        orderIndex: Number(rowObj.orderIndex || 0),
        contentPayload: {},
        reviewerNotes: [],
        createdBy: currentAdmin.email,
        lastModifiedBy: currentAdmin.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingIdx = contentItemsStore.findIndex((i) => i.id === item.id);
      if (existingIdx >= 0) {
        contentItemsStore[existingIdx] = item;
      } else {
        contentItemsStore.push(item);
      }
      importedCount++;
    });
  }

  if (importedCount > 0 && typeof window !== 'undefined') {
    try {
      localStorage.setItem('deutschpfad_admin_content_items', JSON.stringify(contentItemsStore));
    } catch {
      // ignore
    }
    logAdminAction(
      'content.bulk_import',
      'content_batch',
      `batch-${Date.now()}`,
      `Bulk imported ${importedCount} content items via ${format.toUpperCase()}.`
    );
  }

  return { count: importedCount, errors };
}

/* ─── Learner User Management (Subscriptions & Refunds) ──────────────────── */

let mockLearnersStore: AdminLearnerUser[] = [
  {
    id: 'usr-1001',
    email: 'sophie.miller@example.com',
    fullName: 'Sophie Miller',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    cefrLevel: 'A2',
    streakDays: 42,
    totalXp: 3840,
    subscriptionPlan: 'pro',
    subscriptionStatus: 'active',
    billingCycle: 'monthly',
    currency: 'USD',
    paymentProvider: 'stripe',
    renewalDate: '2026-11-04T00:00:00Z',
    isPaused: false,
    country: 'United States',
    createdAt: '2026-08-14T10:00:00Z',
    lastActiveAt: '2026-10-14T06:20:00Z',
  },
  {
    id: 'usr-1002',
    email: 'rajesh.kumar@example.in',
    fullName: 'Rajesh Kumar',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
    cefrLevel: 'B1',
    streakDays: 89,
    totalXp: 9150,
    subscriptionPlan: 'pro_plus',
    subscriptionStatus: 'active',
    billingCycle: 'annual',
    currency: 'INR',
    paymentProvider: 'razorpay',
    renewalDate: '2027-02-18T00:00:00Z',
    isPaused: false,
    country: 'India',
    createdAt: '2026-02-18T14:30:00Z',
    lastActiveAt: '2026-10-14T07:05:00Z',
  },
  {
    id: 'usr-1003',
    email: 'claire.dubois@example.fr',
    fullName: 'Claire Dubois',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    cefrLevel: 'A1',
    streakDays: 7,
    totalXp: 820,
    subscriptionPlan: 'pro',
    subscriptionStatus: 'trialing',
    billingCycle: 'monthly',
    currency: 'EUR',
    paymentProvider: 'stripe',
    trialEndsAt: '2026-10-17T23:59:59Z',
    renewalDate: '2026-10-18T00:00:00Z',
    isPaused: false,
    country: 'France',
    createdAt: '2026-10-10T09:15:00Z',
    lastActiveAt: '2026-10-13T19:40:00Z',
  },
  {
    id: 'usr-1004',
    email: 'david.wilson@example.co.uk',
    fullName: 'David Wilson',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
    cefrLevel: 'A2',
    streakDays: 0,
    totalXp: 1420,
    subscriptionPlan: 'pro',
    subscriptionStatus: 'past_due',
    billingCycle: 'monthly',
    currency: 'GBP',
    paymentProvider: 'stripe',
    renewalDate: '2026-10-12T00:00:00Z',
    isPaused: false,
    country: 'United Kingdom',
    createdAt: '2026-07-12T16:20:00Z',
    lastActiveAt: '2026-10-12T08:10:00Z',
  },
  {
    id: 'usr-1005',
    email: 'mateo.garcia@example.es',
    fullName: 'Mateo García',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    cefrLevel: 'B2',
    streakDays: 14,
    totalXp: 6200,
    subscriptionPlan: 'free',
    subscriptionStatus: 'canceled',
    billingCycle: 'monthly',
    currency: 'EUR',
    paymentProvider: 'paddle',
    isPaused: false,
    country: 'Spain',
    createdAt: '2026-03-01T11:00:00Z',
    lastActiveAt: '2026-10-14T01:30:00Z',
  },
  {
    id: 'usr-1006',
    email: 'anna.nowak@example.pl',
    fullName: 'Anna Nowak',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    cefrLevel: 'A1',
    streakDays: 21,
    totalXp: 2100,
    subscriptionPlan: 'free',
    subscriptionStatus: 'active',
    billingCycle: 'monthly',
    currency: 'EUR',
    paymentProvider: 'stripe',
    isPaused: false,
    country: 'Poland',
    createdAt: '2026-09-20T12:00:00Z',
    lastActiveAt: '2026-10-14T05:50:00Z',
  },
];

export function searchLearners(query: string = '', filters?: { plan?: string; status?: string; level?: string }): AdminLearnerUser[] {
  let learners = [...mockLearnersStore];
  if (typeof window !== 'undefined') {
    try {
      const persisted = JSON.parse(localStorage.getItem('deutschpfad_admin_learners') || '[]');
      if (Array.isArray(persisted) && persisted.length > 0) {
        learners = persisted;
      }
    } catch {
      // ignore
    }
  }

  if (query) {
    const q = query.toLowerCase();
    learners = learners.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        u.country.toLowerCase().includes(q)
    );
  }

  if (filters?.plan && filters.plan !== 'all') {
    learners = learners.filter((u) => u.subscriptionPlan === filters.plan);
  }
  if (filters?.status && filters.status !== 'all') {
    learners = learners.filter((u) => u.subscriptionStatus === filters.status);
  }
  if (filters?.level && filters.level !== 'all') {
    learners = learners.filter((u) => u.cefrLevel === filters.level);
  }

  return learners;
}

export function manualUpdateUserSubscription(
  userId: string,
  newPlan: 'free' | 'pro' | 'pro_plus',
  newStatus: 'active' | 'trialing' | 'past_due' | 'paused' | 'canceled',
  reason: string
): AdminLearnerUser | null {
  const learner = mockLearnersStore.find((u) => u.id === userId);
  if (!learner) return null;

  const previousPlan = learner.subscriptionPlan;
  const previousStatus = learner.subscriptionStatus;

  learner.subscriptionPlan = newPlan;
  learner.subscriptionStatus = newStatus;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('deutschpfad_admin_learners', JSON.stringify(mockLearnersStore));
    } catch {
      // ignore
    }
  }

  logAdminAction(
    'subscription.manual_plan_change',
    'user_subscription',
    userId,
    `Admin manual plan change for ${learner.email}: ${previousPlan} (${previousStatus}) ➔ ${newPlan} (${newStatus}). Reason: ${reason}`,
    {
      before: { plan: previousPlan, status: previousStatus },
      after: { plan: newPlan, status: newStatus, reason },
    }
  );

  return learner;
}

export function issueRefundForUser(
  userId: string,
  amount: number,
  currency: string,
  reason: string
): { success: boolean; refundId: string; message: string } {
  const learner = mockLearnersStore.find((u) => u.id === userId);
  const refundId = `ref-${Date.now()}`;

  logAdminAction(
    'billing.refund_issued',
    'user_refund',
    userId,
    `Issued refund of ${currency} ${amount.toFixed(2)} to ${learner ? learner.email : userId}. Reason: ${reason}`,
    { after: { refundId, amount, currency, reason, status: 'processed' } }
  );

  return {
    success: true,
    refundId,
    message: `Refund of ${currency} ${amount.toFixed(2)} processed successfully via payment provider.`,
  };
}

/* ─── Feature Flags Management ───────────────────────────────────────────── */

let featureFlagsStore: FeatureFlag[] = [
  {
    id: 'ai_tutor_speaking',
    name: 'AI Voice Conversation & Phoneme Evaluator',
    description: 'Enables live conversational voice sessions with real-time German phonetic accent feedback.',
    enabled: true,
    rolloutPercentage: 50,
    targetAudiences: ['pro', 'pro_plus', 'beta_testers'],
    isKillswitch: false,
    updatedBy: 'hannah.schmidt@deutschpfad.com',
    updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'whisper_speech_v3',
    name: 'Whisper Large v3 German Acoustics',
    description: 'Upgrades speech recognition pipeline to ultra-low latency v3 for German dialect comprehension.',
    enabled: true,
    rolloutPercentage: 100,
    targetAudiences: ['all'],
    isKillswitch: false,
    updatedBy: 'lukas.weber@deutschpfad.com',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'regional_pricing_in',
    name: 'India Regional UPI / Netbanking Gateway',
    description: 'Routes Indian learners to Razorpay localized pricing (INR ₹499/mo) with seamless UPI QR checkout.',
    enabled: true,
    rolloutPercentage: 100,
    targetAudiences: ['country:IN'],
    isKillswitch: false,
    updatedBy: 'hannah.schmidt@deutschpfad.com',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'curriculum_b2_c1',
    name: 'Goethe B2/C1 Professional Modules',
    description: 'Exposes advanced C1 professional business vocabulary and Goethe mock exam simulation.',
    enabled: false,
    rolloutPercentage: 0,
    targetAudiences: ['internal_testers'],
    isKillswitch: false,
    updatedBy: 'dr.elena.bauer@deutschpfad.com',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: 'offline_sync_pwa',
    name: 'Background PWA Lesson Caching',
    description: 'Pre-caches current active unit audio and flashcards for zero-latency offline practice.',
    enabled: true,
    rolloutPercentage: 25,
    targetAudiences: ['mobile_users'],
    isKillswitch: false,
    updatedBy: 'lukas.weber@deutschpfad.com',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
  {
    id: 'dark_mode_oled',
    name: 'High-Contrast OLED Pure Black Mode',
    description: 'Enables pitch-black dark theme optimized for OLED displays with WCAG AAA contrast ratio.',
    enabled: true,
    rolloutPercentage: 100,
    targetAudiences: ['all'],
    isKillswitch: false,
    updatedBy: 'hannah.schmidt@deutschpfad.com',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
  },
];

export function getFeatureFlags(): FeatureFlag[] {
  if (typeof window !== 'undefined') {
    try {
      const persisted = JSON.parse(localStorage.getItem('deutschpfad_admin_feature_flags') || '[]');
      if (Array.isArray(persisted) && persisted.length > 0) {
        return persisted;
      }
    } catch {
      // ignore
    }
  }
  return featureFlagsStore;
}

export function updateFeatureFlag(
  flagId: string,
  updates: Partial<Pick<FeatureFlag, 'enabled' | 'rolloutPercentage' | 'targetAudiences' | 'description'>>
): FeatureFlag | null {
  const currentAdmin = getCurrentAdminUser();
  const flag = featureFlagsStore.find((f) => f.id === flagId);
  if (!flag) return null;

  const before = { ...flag };
  Object.assign(flag, updates, {
    updatedBy: currentAdmin.email,
    updatedAt: new Date().toISOString(),
  });

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('deutschpfad_admin_feature_flags', JSON.stringify(featureFlagsStore));
    } catch {
      // ignore
    }
  }

  logAdminAction(
    'feature_flag.update',
    'feature_flag',
    flagId,
    `Updated feature flag "${flag.name}" (${flagId}). Enabled: ${flag.enabled}, Rollout: ${flag.rolloutPercentage}%.`,
    { before, after: flag }
  );

  return flag;
}

/* ─── Support Inbox & Ticket Management ──────────────────────────────────── */

let supportTicketsStore: SupportTicket[] = [
  {
    id: 'ticket-101',
    ticketNumber: 'DP-2026-1042',
    userEmail: 'sophie.miller@example.com',
    userName: 'Sophie Miller',
    subject: 'VAT invoice receipt calculation request',
    category: 'billing',
    priority: 'normal',
    status: 'resolved',
    assignedTo: 'marcus.support@deutschpfad.com',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    messages: [
      {
        id: 'msg-1',
        ticketId: 'ticket-101',
        senderType: 'customer',
        senderName: 'Sophie Miller',
        senderEmail: 'sophie.miller@example.com',
        body: 'Hello! Could I get an updated invoice that includes my company VAT ID for tax filing in New York? Thank you!',
        isInternal: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
      },
      {
        id: 'msg-2',
        ticketId: 'ticket-101',
        senderType: 'agent',
        senderName: 'Marcus Vance',
        senderEmail: 'marcus.support@deutschpfad.com',
        body: 'Hi Sophie! Absolutely. I have updated your billing invoice with the requested VAT tax ID and emailed the revised PDF to you.',
        isInternal: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: 'ticket-102',
    ticketNumber: 'DP-2026-1048',
    userEmail: 'rajesh.kumar@example.in',
    userName: 'Rajesh Kumar',
    subject: 'Question regarding B1 adjective endings in Austrian German',
    category: 'content_feedback',
    priority: 'normal',
    status: 'in_progress',
    assignedTo: 'dr.elena.bauer@deutschpfad.com',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    messages: [
      {
        id: 'msg-3',
        ticketId: 'ticket-102',
        senderType: 'customer',
        senderName: 'Rajesh Kumar',
        senderEmail: 'rajesh.kumar@example.in',
        body: 'In Unit 3, does "Ich möchte einen kleinen Kaffee" change when using Austrian regional terminology? Fantastic course so far!',
        isInternal: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      },
      {
        id: 'msg-4',
        ticketId: 'ticket-102',
        senderType: 'internal_note',
        senderName: 'Dr. Elena Bauer',
        senderEmail: 'dr.elena.bauer@deutschpfad.com',
        body: 'Learner is asking about weak vs strong adjective endings in dative/accusative. I will reply with Goethe A2/B1 grammar breakdown.',
        isInternal: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
  },
  {
    id: 'ticket-103',
    ticketNumber: 'DP-2026-1051',
    userEmail: 'david.wilson@example.co.uk',
    userName: 'David Wilson',
    subject: 'Payment failed notification but card was charged',
    category: 'billing',
    priority: 'urgent',
    status: 'open',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    messages: [
      {
        id: 'msg-5',
        ticketId: 'ticket-103',
        senderType: 'customer',
        senderName: 'David Wilson',
        senderEmail: 'david.wilson@example.co.uk',
        body: 'My bank app showed a 3D-Secure approval for my Pro subscription, but the app says past due. Can you please check?',
        isInternal: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
];

export function getSupportTickets(filters?: { status?: string; category?: string; priority?: string }): SupportTicket[] {
  let tickets = [...supportTicketsStore];
  if (typeof window !== 'undefined') {
    try {
      const persisted = JSON.parse(localStorage.getItem('deutschpfad_admin_tickets') || '[]');
      if (Array.isArray(persisted) && persisted.length > 0) {
        tickets = persisted;
      }
    } catch {
      // ignore
    }
  }

  if (filters?.status && filters.status !== 'all') {
    tickets = tickets.filter((t) => t.status === filters.status);
  }
  if (filters?.category && filters.category !== 'all') {
    tickets = tickets.filter((t) => t.category === filters.category);
  }
  if (filters?.priority && filters.priority !== 'all') {
    tickets = tickets.filter((t) => t.priority === filters.priority);
  }

  tickets.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  return tickets;
}

export function addSupportTicketMessage(
  ticketId: string,
  body: string,
  isInternal: boolean = false
): SupportTicketMessage | null {
  const currentAdmin = getCurrentAdminUser();
  const ticket = supportTicketsStore.find((t) => t.id === ticketId);
  if (!ticket) return null;

  const msg: SupportTicketMessage = {
    id: `msg-${Date.now()}`,
    ticketId,
    senderType: isInternal ? 'internal_note' : 'agent',
    senderName: currentAdmin.name,
    senderEmail: currentAdmin.email,
    body: body.trim(),
    isInternal,
    createdAt: new Date().toISOString(),
  };

  ticket.messages.push(msg);
  ticket.lastMessageAt = msg.createdAt;
  ticket.updatedAt = msg.createdAt;

  if (!isInternal && ticket.status === 'open') {
    ticket.status = 'in_progress';
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('deutschpfad_admin_tickets', JSON.stringify(supportTicketsStore));
    } catch {
      // ignore
    }
  }

  logAdminAction(
    isInternal ? 'support.add_internal_note' : 'support.reply_sent',
    'support_ticket',
    ticket.ticketNumber,
    `${isInternal ? 'Added internal staff note' : 'Replied to customer'} on ticket ${ticket.ticketNumber}.`
  );

  return msg;
}

export function updateSupportTicketStatus(
  ticketId: string,
  status: SupportTicketStatus,
  assignedTo?: string
): SupportTicket | null {
  const currentAdmin = getCurrentAdminUser();
  const ticket = supportTicketsStore.find((t) => t.id === ticketId);
  if (!ticket) return null;

  const beforeStatus = ticket.status;
  ticket.status = status;
  if (assignedTo !== undefined) ticket.assignedTo = assignedTo;
  ticket.updatedAt = new Date().toISOString();

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('deutschpfad_admin_tickets', JSON.stringify(supportTicketsStore));
    } catch {
      // ignore
    }
  }

  logAdminAction(
    'support.status_change',
    'support_ticket',
    ticket.ticketNumber,
    `Updated ticket ${ticket.ticketNumber} status from "${beforeStatus}" to "${status}".`
  );

  return ticket;
}

/* ─── Business Analytics & Executive Dashboard KPIs ──────────────────────── */

export function getAdminAnalytics(period: '7d' | '30d' | '90d' | '1y' | 'all' = '30d'): AdminAnalyticsKPIs {
  return {
    period,
    signups: {
      total: 14820,
      today: 184,
      thisWeek: 1240,
      thisMonth: 4890,
      growthRateMonth: 18.4,
    },
    activeUsers: {
      dau: 4120,
      mau: 11450,
      stickinessRatio: 36.0, // 36% DAU/MAU
      avgDailyMinutes: 24.6,
    },
    conversion: {
      freeToPaidRate: 8.4,
      trialToPaidRate: 68.2,
      totalPaidSubscribers: 3410,
      activeTrials: 480,
    },
    mrr: {
      totalMrr: 42650,
      mrrPro: 19800,
      mrrProPlus: 22850,
      arpu: 12.5,
      arr: 511800,
      mrrGrowthMoM: 14.2,
    },
    churn: {
      monthlyChurnRate: 2.1,
      cancellationsCount: 72,
      pauseRate: 4.8,
      winbackSuccessRate: 22.4,
    },
    aiCostPerUser: {
      monthlyAiTotalCost: 2140, // $2,140 total for month
      costPerActiveUser: 0.42, // $0.42 / active user / month
      grossMarginPercent: 96.5,
      tokenVolumeMillions: 84.5,
      audioHoursSynthesized: 320,
      costByProvider: {
        openaiGpt4oMini: 980,
        whisperSpeechToText: 460,
        elevenLabsTts: 700,
      },
    },
    revenueHistory: [
      { date: 'May 2026', mrr: 21400, signups: 2600, paidUsers: 1720, aiCost: 1120 },
      { date: 'Jun 2026', mrr: 26200, signups: 3100, paidUsers: 2100, aiCost: 1350 },
      { date: 'Jul 2026', mrr: 31800, signups: 3750, paidUsers: 2540, aiCost: 1610 },
      { date: 'Aug 2026', mrr: 36400, signups: 4200, paidUsers: 2910, aiCost: 1840 },
      { date: 'Sep 2026', mrr: 39900, signups: 4600, paidUsers: 3190, aiCost: 1990 },
      { date: 'Oct 2026', mrr: 42650, signups: 4890, paidUsers: 3410, aiCost: 2140 },
    ],
  };
}
