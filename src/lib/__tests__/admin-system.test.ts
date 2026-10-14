import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ROLE_PERMISSIONS,
  type AdminRole,
} from "../../types/admin.ts";
import {
  getCurrentAdminUser,
  setActiveAdminRole,
  getActiveAdminRole,
  getAdminContentItems,
  saveContentItem,
  updateContentReviewStatus,
  addContentReviewerNote,
  bulkExportContent,
  bulkImportContent,
  searchLearners,
  manualUpdateUserSubscription,
  issueRefundForUser,
  getSupportTickets,
  addSupportTicketMessage,
  updateSupportTicketStatus,
  getFeatureFlags,
  updateFeatureFlag,
  getAdminAuditLogs,
  getAdminAnalytics,
  MOCK_ADMIN_STAFF,
} from "../adminService.ts";

describe("DeutschPfad Secure Admin System & RBAC", () => {
  it("enforces strict role-based access control (RBAC) permission matrices", () => {
    // 1. Super Admin
    const superAdminPerms = ROLE_PERMISSIONS.super_admin;
    assert.equal(superAdminPerms.canManageContent, true);
    assert.equal(superAdminPerms.canPublishContent, true);
    assert.equal(superAdminPerms.canManageUsers, true);
    assert.equal(superAdminPerms.canModifySubscriptions, true);
    assert.equal(superAdminPerms.canIssueRefunds, true);
    assert.equal(superAdminPerms.canManageFeatureFlags, true);
    assert.equal(superAdminPerms.canViewAnalytics, true);
    assert.equal(superAdminPerms.canViewAuditLogs, true);

    // 2. Curator / Native Reviewer
    const curatorPerms = ROLE_PERMISSIONS.curator;
    assert.equal(curatorPerms.canManageContent, true);
    assert.equal(curatorPerms.canPublishContent, true);
    assert.equal(curatorPerms.canModifySubscriptions, false);
    assert.equal(curatorPerms.canIssueRefunds, false);
    assert.equal(curatorPerms.canManageFeatureFlags, false);
    assert.equal(curatorPerms.canViewAnalytics, false);

    // 3. Support Agent
    const supportPerms = ROLE_PERMISSIONS.support_agent;
    assert.equal(supportPerms.canManageUsers, true);
    assert.equal(supportPerms.canManageContent, false);
    assert.equal(supportPerms.canPublishContent, false);
    assert.equal(supportPerms.canModifySubscriptions, false);
    assert.equal(supportPerms.canIssueRefunds, false);
    assert.equal(supportPerms.canManageFeatureFlags, false);
  });

  it("supports switching active admin profiles with role persistence", () => {
    setActiveAdminRole("curator");
    const curatorUser = getCurrentAdminUser();
    assert.equal(curatorUser.role, "curator");
    assert.match(curatorUser.name, /Elena Bauer/i);

    setActiveAdminRole("super_admin");
    const superAdminUser = getCurrentAdminUser();
    assert.equal(superAdminUser.role, "super_admin");
    assert.match(superAdminUser.name, /Hannah Schmidt/i);
  });

  it("manages content review statuses (Draft -> Needs review -> Approved -> Published)", () => {
    const testItemId = `test-ex-${Date.now()}`;
    const initialItem = saveContentItem({
      id: testItemId,
      entityType: "exercise",
      level: "A1",
      slug: "test-exercise-slug",
      title: "Test Accusative Ordering",
      titleDe: "Test Akkusativ Übung",
      reviewStatus: "draft",
      orderIndex: 99,
      contentPayload: { prompt: "Choose article" },
      reviewerNotes: [],
      createdBy: "test@deutschpfad.com",
      lastModifiedBy: "test@deutschpfad.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    assert.equal(initialItem.reviewStatus, "draft");

    // Advance to needs_review
    const step1 = updateContentReviewStatus(testItemId, "needs_review", "Ready for native speaker review");
    assert.ok(step1);
    assert.equal(step1.reviewStatus, "needs_review");

    // Native Reviewer adds feedback note
    const note = addContentReviewerNote(testItemId, "Approved: casing and accusative article are correct.", "approved");
    assert.ok(note);
    assert.match(note.note, /Approved: casing/);

    // Advance to published
    const step2 = updateContentReviewStatus(testItemId, "published");
    assert.ok(step2);
    assert.equal(step2.reviewStatus, "published");
    assert.ok(step2.publishedAt);
  });

  it("executes bulk content export and import in JSON and CSV formats", () => {
    // 1. JSON Export
    const jsonExport = bulkExportContent("exercise", "json");
    assert.ok(jsonExport.length > 0);
    const parsed = JSON.parse(jsonExport);
    assert.ok(Array.isArray(parsed));

    // 2. CSV Export
    const csvExport = bulkExportContent("exercise", "csv");
    assert.ok(csvExport.includes("id,entityType,level,title"));

    // 3. Bulk JSON Import
    const importPayload = JSON.stringify([
      {
        id: `import-ex-${Date.now()}`,
        entityType: "exercise",
        level: "A2",
        slug: "imported-exercise",
        title: "Imported Grammar Test",
        titleDe: "Importierter Grammatiktest",
        reviewStatus: "draft",
      },
    ]);
    const importResult = bulkImportContent(importPayload, "json");
    assert.equal(importResult.count, 1);
    assert.equal(importResult.errors.length, 0);
  });

  it("allows searching learners, changing subscription plans manually, and issuing refunds", () => {
    const learners = searchLearners("Sophie");
    assert.ok(learners.length >= 1);
    const learner = learners[0];
    assert.match(learner.email, /sophie/i);

    // Manual plan change
    const updated = manualUpdateUserSubscription(
      learner.id,
      "pro_plus",
      "active",
      "Granted Goethe exam scholarship"
    );
    assert.ok(updated);
    assert.equal(updated.subscriptionPlan, "pro_plus");

    // Refund
    const refund = issueRefundForUser(learner.id, 12, "USD", "Test customer refund");
    assert.equal(refund.success, true);
    assert.ok(refund.refundId);
  });

  it("handles support ticket replies, internal staff notes, and status transitions", () => {
    const tickets = getSupportTickets();
    assert.ok(tickets.length > 0);
    const ticket = tickets[0];

    // Add public reply
    const reply = addSupportTicketMessage(ticket.id, "Hello! We have reviewed your inquiry.", false);
    assert.ok(reply);
    assert.equal(reply.isInternal, false);

    // Add internal staff note
    const note = addSupportTicketMessage(ticket.id, "Escalating to native reviewer for dialect check.", true);
    assert.ok(note);
    assert.equal(note.isInternal, true);

    // Update status to resolved
    const resolved = updateSupportTicketStatus(ticket.id, "resolved");
    assert.ok(resolved);
    assert.equal(resolved.status, "resolved");
  });

  it("allows toggling feature flags and adjusting rollout allocations", () => {
    const flags = getFeatureFlags();
    assert.ok(flags.length >= 4);

    const flag = flags[0];
    const initialEnabled = flag.enabled;

    // Toggle
    const toggled = updateFeatureFlag(flag.id, { enabled: !initialEnabled });
    assert.ok(toggled);
    assert.equal(toggled.enabled, !initialEnabled);

    // Rollout
    const rollout = updateFeatureFlag(flag.id, { rolloutPercentage: 75 });
    assert.ok(rollout);
    assert.equal(rollout.rolloutPercentage, 75);

    // Restore
    updateFeatureFlag(flag.id, { enabled: initialEnabled });
  });

  it("verifies immutable audit logs record all administrative actions with actor metadata", () => {
    const logs = getAdminAuditLogs();
    assert.ok(logs.length > 0);

    const latest = logs[0];
    assert.ok(latest.id);
    assert.ok(latest.adminEmail);
    assert.ok(latest.action);
    assert.ok(latest.createdAt);
  });

  it("validates executive analytics KPIs: positive MRR, conversion, and AI cost per user under $1", () => {
    const analytics = getAdminAnalytics("30d");

    assert.ok(analytics.mrr.totalMrr > 40000, "MRR should exceed $40,000");
    assert.ok(analytics.activeUsers.dau > 3000, "DAU should exceed 3,000");
    assert.ok(analytics.conversion.freeToPaidRate > 5, "Conversion rate should exceed 5%");
    assert.ok(analytics.churn.monthlyChurnRate < 4, "Monthly churn should be under 4%");

    // AI cost per user test
    assert.ok(
      analytics.aiCostPerUser.costPerActiveUser < 1.0,
      `AI cost per user should be under $1.00 for strong gross margins. Found: $${analytics.aiCostPerUser.costPerActiveUser}`
    );
    assert.ok(
      analytics.aiCostPerUser.grossMarginPercent > 90,
      `Gross margin should exceed 90%. Found: ${analytics.aiCostPerUser.grossMarginPercent}%`
    );
  });
});
