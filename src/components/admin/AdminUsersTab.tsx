"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Filter,
  DollarSign,
  RotateCcw,
  Shield,
  CreditCard,
  ExternalLink,
  Flame,
  Award,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  searchLearners,
  manualUpdateUserSubscription,
  issueRefundForUser,
  getCurrentAdminUser,
} from "@/lib/adminService";
import type { AdminLearnerUser } from "@/types/admin";

export function AdminUsersTab() {
  const { toast } = useToast();
  const currentAdmin = getCurrentAdminUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const [learners, setLearners] = useState<AdminLearnerUser[]>(() =>
    searchLearners()
  );

  // Active Modals
  const [selectedUser, setSelectedUser] = useState<AdminLearnerUser | null>(null);
  const [planModalUser, setPlanModalUser] = useState<AdminLearnerUser | null>(null);
  const [refundModalUser, setRefundModalUser] = useState<AdminLearnerUser | null>(null);

  // Form states
  const [newPlan, setNewPlan] = useState<"free" | "pro" | "pro_plus">("pro");
  const [newStatus, setNewStatus] = useState<
    "active" | "trialing" | "past_due" | "paused" | "canceled"
  >("active");
  const [planChangeReason, setPlanChangeReason] = useState("");

  const [refundAmount, setRefundAmount] = useState<number>(12);
  const [refundReason, setRefundReason] = useState("Accidental duplicate subscription payment");

  const refreshLearners = () => {
    setLearners(
      searchLearners(searchQuery, {
        plan: planFilter,
        status: statusFilter,
        level: levelFilter,
      })
    );
  };

  const handleSearch = (q: string, plan: string, status: string, level: string) => {
    setSearchQuery(q);
    setPlanFilter(plan);
    setStatusFilter(status);
    setLevelFilter(level);
    setLearners(searchLearners(q, { plan, status, level }));
  };

  const handleExecutePlanChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planModalUser || !planChangeReason.trim()) return;

    const updated = manualUpdateUserSubscription(
      planModalUser.id,
      newPlan,
      newStatus,
      planChangeReason
    );

    if (updated) {
      toast({
        title: "Plan Modified",
        message: `Updated ${updated.fullName} to ${newPlan.toUpperCase()} (${newStatus}).`,
        type: "success",
      });
      setPlanModalUser(null);
      setPlanChangeReason("");
      refreshLearners();
    }
  };

  const handleExecuteRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalUser) return;

    const result = issueRefundForUser(
      refundModalUser.id,
      refundAmount,
      refundModalUser.currency,
      refundReason
    );

    if (result.success) {
      toast({
        title: "Refund Processed",
        message: result.message,
        type: "success",
      });
      setRefundModalUser(null);
      refreshLearners();
    }
  };

  const renderStatusBadge = (status: AdminLearnerUser["subscriptionStatus"]) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "trialing":
        return <Badge variant="brand">Trialing</Badge>;
      case "past_due":
        return <Badge variant="error">Past Due</Badge>;
      case "paused":
        return <Badge variant="warning">Paused</Badge>;
      case "canceled":
      default:
        return <Badge variant="default">Canceled</Badge>;
    }
  };

  const renderPlanBadge = (plan: AdminLearnerUser["subscriptionPlan"]) => {
    switch (plan) {
      case "pro_plus":
        return <Badge variant="brand">Pro Plus</Badge>;
      case "pro":
        return <Badge variant="brand">Pro</Badge>;
      case "free":
      default:
        return <Badge variant="default">Free</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Learner Accounts &amp; Subscription Operations
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Search learners, inspect subscriptions, execute manual tier upgrades/scholarships, and issue provider refunds.
          </p>
        </div>

        <div className="text-xs text-[var(--color-text-muted)] font-medium">
          Showing <strong>{learners.length}</strong> active learners
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[var(--color-surface)] p-3.5 rounded-xl border border-[var(--color-border)]">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) =>
              handleSearch(e.target.value, planFilter, statusFilter, levelFilter)
            }
            placeholder="Search learner name, email, ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
          />
        </div>

        {/* Plan Filter */}
        <select
          value={planFilter}
          onChange={(e) =>
            handleSearch(searchQuery, e.target.value, statusFilter, levelFilter)
          }
          className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
        >
          <option value="all">All Plans</option>
          <option value="free">Free Tier</option>
          <option value="pro">Pro ($12/mo)</option>
          <option value="pro_plus">Pro Plus ($18/mo)</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) =>
            handleSearch(searchQuery, planFilter, e.target.value, levelFilter)
          }
          className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
        >
          <option value="all">All Subscription States</option>
          <option value="active">Active</option>
          <option value="trialing">7-Day Trial</option>
          <option value="past_due">Past Due (Fix Needed)</option>
          <option value="paused">Paused</option>
          <option value="canceled">Canceled</option>
        </select>

        {/* Level Filter */}
        <select
          value={levelFilter}
          onChange={(e) =>
            handleSearch(searchQuery, planFilter, statusFilter, e.target.value)
          }
          className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
        >
          <option value="all">All CEFR Levels</option>
          <option value="A1">A1 · Beginner</option>
          <option value="A2">A2 · Elementary</option>
          <option value="B1">B1 · Intermediate</option>
          <option value="B2">B2 · Vantage</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] font-semibold border-b border-[var(--color-border)] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Learner</th>
                <th className="py-3 px-4">CEFR &amp; XP</th>
                <th className="py-3 px-4">Plan &amp; Cycle</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Gateway &amp; Country</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {learners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--color-text-muted)]">
                    No learners match the given filters.
                  </td>
                </tr>
              ) : (
                learners.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[var(--color-bg-subtle)]/60 transition-colors group"
                  >
                    {/* Learner Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-[var(--color-border)]"
                        />
                        <div>
                          <div className="font-bold text-[var(--color-text-primary)]">
                            {user.fullName}
                          </div>
                          <div className="text-[11px] text-[var(--color-text-secondary)]">
                            {user.email}
                          </div>
                          <div className="text-[10px] text-[var(--color-text-muted)] font-mono">
                            {user.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* CEFR & XP */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{user.cefrLevel}</Badge>
                        <span className="font-bold text-[var(--color-text-primary)]">
                          {user.totalXp.toLocaleString()} XP
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{user.streakDays} day streak</span>
                      </div>
                    </td>

                    {/* Plan & Cycle */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {renderPlanBadge(user.subscriptionPlan)}
                        <span className="text-[11px] text-[var(--color-text-secondary)] capitalize">
                          ({user.billingCycle})
                        </span>
                      </div>
                      {user.renewalDate && (
                        <div className="text-[10px] text-[var(--color-text-muted)] mt-1">
                          Renews: {new Date(user.renewalDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {renderStatusBadge(user.subscriptionStatus)}
                      {user.trialEndsAt && (
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">
                          Trial ends {new Date(user.trialEndsAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    {/* Gateway & Country */}
                    <td className="py-3.5 px-4 text-[var(--color-text-secondary)]">
                      <div className="font-medium text-[var(--color-text-primary)] uppercase">
                        {user.paymentProvider} · {user.currency}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-muted)]">
                        {user.country}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Change Plan Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPlanModalUser(user);
                            setNewPlan(user.subscriptionPlan);
                            setNewStatus(user.subscriptionStatus);
                            setPlanChangeReason("");
                          }}
                          title="Manually Change Plan or Grant Scholarship"
                        >
                          Change Plan
                        </Button>

                        {/* Refund Link / Modal */}
                        {user.subscriptionPlan !== "free" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setRefundModalUser(user);
                              setRefundAmount(user.currency === "INR" ? 499 : 12);
                            }}
                            title="Issue Refund & Open Provider Portal"
                          >
                            <DollarSign className="w-3.5 h-3.5 text-rose-500" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL 1: Manual Plan Change ──────────────────────────────────── */}
      {planModalUser && (
        <Modal
          open={Boolean(planModalUser)}
          onClose={() => setPlanModalUser(null)}
          title={`Manual Plan Change: ${planModalUser.fullName}`}
          description="Grant scholarship comps, extend trial periods, or execute administrative tier overrides."
          size="md"
        >
          <form onSubmit={handleExecutePlanChange} className="space-y-4 py-2">
            <div className="p-3 bg-[var(--color-bg-subtle)] rounded-xl text-xs space-y-1">
              <div>
                Learner: <strong>{planModalUser.email}</strong>
              </div>
              <div>
                Current Plan: <strong>{planModalUser.subscriptionPlan.toUpperCase()}</strong> ({planModalUser.subscriptionStatus})
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Target Plan Tier
              </label>
              <select
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
              >
                <option value="free">Free Tier</option>
                <option value="pro">Pro Plan</option>
                <option value="pro_plus">Pro Plus Plan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Subscription Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
              >
                <option value="active">Active</option>
                <option value="trialing">Trialing (7-Day Free Trial)</option>
                <option value="paused">Paused</option>
                <option value="past_due">Past Due</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Reason for Change (Required for Audit Trail)
              </label>
              <textarea
                required
                rows={3}
                value={planChangeReason}
                onChange={(e) => setPlanChangeReason(e.target.value)}
                placeholder="e.g. Academic scholarship grant, courtesy trial extension, test account..."
                className="w-full p-2.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
              <Button type="button" variant="outline" size="sm" onClick={() => setPlanModalUser(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={!planChangeReason.trim()}>
                Apply Plan Modification
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL 2: Issue Refund & Provider Links ────────────────────────── */}
      {refundModalUser && (
        <Modal
          open={Boolean(refundModalUser)}
          onClose={() => setRefundModalUser(null)}
          title={`Issue Refund: ${refundModalUser.fullName}`}
          description="Execute payment refund and inspect original invoice in gateway dashboard."
          size="md"
        >
          <form onSubmit={handleExecuteRefund} className="space-y-4 py-2">
            <div className="p-3 bg-[var(--color-bg-subtle)] rounded-xl text-xs space-y-1">
              <div>Customer: <strong>{refundModalUser.email}</strong></div>
              <div>Gateway: <strong className="uppercase">{refundModalUser.paymentProvider}</strong></div>
              <div>Currency: <strong>{refundModalUser.currency}</strong></div>
            </div>

            {/* Direct Gateway Deep Link */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
              <span>View Invoice in Provider Portal:</span>
              <a
                href={
                  refundModalUser.paymentProvider === "stripe"
                    ? `https://dashboard.stripe.com/test/customers`
                    : `https://dashboard.razorpay.com/app/payments`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-[var(--color-brand-600)] hover:underline"
              >
                <span>Open {refundModalUser.paymentProvider.toUpperCase()} Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Refund Amount ({refundModalUser.currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                required
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Refund Justification
              </label>
              <input
                type="text"
                required
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
              <Button type="button" variant="outline" size="sm" onClick={() => setRefundModalUser(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" size="sm">
                Confirm &amp; Issue Refund
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
