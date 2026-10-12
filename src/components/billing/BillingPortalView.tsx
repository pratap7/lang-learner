"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard, ShieldCheck, Calendar, Clock,
  ArrowRight, Download, AlertCircle, CheckCircle2,
  RefreshCw, Pause, Play, Sparkles, Receipt, X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DeutschMascot } from "@/components/mascot/DeutschMascot";
import {
  UserSubscription,
  BillingInvoice,
  getUserSubscription,
  getSubscriptionInvoices,
  getPlanDefinition,
  pauseSubscription,
  resumeSubscription,
  formatPrice,
  detectUserCurrency,
  isTrialActive,
  getRemainingTrialDays,
} from "@/lib/billingService";
import { CancellationSurveyModal } from "@/components/billing/CancellationSurveyModal";
import { ContextualPaywallModal } from "@/components/billing/ContextualPaywallModal";
import { playSuccessChime, triggerHaptic } from "@/lib/soundEffects";
import { useToast } from "@/components/ui/Toast";

export function BillingPortalView() {
  const { addToast } = useToast();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isPausing, setIsPausing] = useState(false);

  useEffect(() => {
    const sub = getUserSubscription("demo-user");
    setSubscription(sub);
    setInvoices(getSubscriptionInvoices(sub.id));
  }, []);

  if (!subscription) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-8 h-8 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-[var(--color-text-muted)]">Loading billing portal...</p>
      </div>
    );
  }

  const planDef = getPlanDefinition(subscription.planId);
  const trialing = isTrialActive(subscription);
  const trialDaysLeft = getRemainingTrialDays(subscription);

  const handlePauseToggle = () => {
    setIsPausing(true);
    triggerHaptic("medium");

    setTimeout(() => {
      let updated: UserSubscription;
      if (subscription.isPaused) {
        updated = resumeSubscription(subscription);
        addToast({ message: "Subscription resumed! Full access restored.", type: "success" });
      } else {
        updated = pauseSubscription(subscription, 1);
        addToast({ message: "Subscription paused for 1 month. You will not be billed.", type: "info" });
      }
      playSuccessChime();
      setSubscription(updated);
      setIsPausing(false);
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
              Subscription & Billing
            </h1>
            <Badge variant="primary" size="sm">
              {subscription.provider.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Manage your DeutschPfad plan, invoices, regional currency, and payment preferences.
          </p>
        </div>

        <Link href="/pricing">
          <Button
            variant="outline"
            size="sm"
            rightIcon={<ArrowRight size={14} />}
          >
            View All Plans
          </Button>
        </Link>
      </div>

      {/* Active Plan Card */}
      <div className="p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)] relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-l from-[var(--color-brand-500)]/15 to-transparent blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <DeutschMascot
              state={trialing ? "happy" : subscription.isPaused ? "sleeping" : "idle"}
              size="md"
              speechBubble={
                trialing
                  ? { de: `Noch ${trialDaysLeft} Testtage!`, en: `${trialDaysLeft} trial days left!` }
                  : subscription.isPaused
                  ? { de: "Pause aktiv", en: "Subscription paused" }
                  : { de: "Viel Spaß beim Lernen!", en: "Enjoy your learning!" }
              }
            />

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                  {planDef.name}
                </h2>
                {trialing ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--color-accent-500)]/20 text-[var(--color-accent-400)] border border-[var(--color-accent-500)]/30">
                    7-Day Free Trial ({trialDaysLeft}d remaining)
                  </span>
                ) : subscription.isPaused ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--color-warning)]/20 text-[var(--color-warning)] border border-[var(--color-warning)]/30">
                    Paused
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/30">
                    Active
                  </span>
                )}
              </div>

              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                {planDef.tagline}
              </p>

              <div className="flex items-center gap-4 mt-3 text-xs text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1.5">
                  <CreditCard size={14} />
                  {formatPrice(subscription.currentPrice, subscription.currency)} /{" "}
                  {subscription.billingCycle}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  Renews:{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Plan Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            {subscription.planId === "free" ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsUpgradeModalOpen(true)}
                rightIcon={<Sparkles size={16} />}
                className="shadow-[var(--shadow-glow)]"
              >
                Upgrade to Pro (7 Days Free)
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  loading={isPausing}
                  onClick={handlePauseToggle}
                  leftIcon={subscription.isPaused ? <Play size={14} /> : <Pause size={14} />}
                >
                  {subscription.isPaused ? "Resume Plan" : "Pause Plan (1 Mo)"}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsUpgradeModalOpen(true)}
                >
                  Switch Tier
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Win back discount pill if applied */}
        {subscription.winBackDiscountPercent && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center gap-2 text-xs text-[var(--color-accent-400)]">
            <Sparkles size={14} />
            <span>
              Win-Back Discount Active: <strong>50% OFF</strong> applied to your monthly renewal!
            </span>
          </div>
        )}

        {/* Cancellation warning pill if scheduled */}
        {subscription.cancelAtPeriodEnd && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center gap-2 text-xs text-[var(--color-warning)]">
            <AlertCircle size={14} />
            <span>
              Cancellation Scheduled: Your access will remain active until{" "}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
            </span>
          </div>
        )}
      </div>

      {/* Plan Entitlements Summary */}
      <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
        <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
          Included Entitlements & Usage
        </h3>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[var(--color-text-muted)]">AI Conversation</span>
              <span className="text-[11px] font-bold text-[var(--color-brand-400)]">
                {planDef.entitlements.aiConversationMinutesPerMonth === 99999
                  ? "Unlimited"
                  : `${planDef.entitlements.aiConversationMinutesPerMonth} min/mo`}
              </span>
            </div>
            <div className="h-1.5 w-full bg-[var(--color-surface)] rounded-full overflow-hidden mt-2">
              <div className="h-full bg-[var(--color-brand-500)] rounded-full w-1/4" />
            </div>
          </div>

          <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[var(--color-text-muted)]">Writing Feedback</span>
              <span className="text-[11px] font-bold text-[var(--color-accent-400)]">
                {planDef.entitlements.writingSubmissionsPerMonth === 99999
                  ? "Unlimited"
                  : `${planDef.entitlements.writingSubmissionsPerMonth} tasks/mo`}
              </span>
            </div>
            <div className="h-1.5 w-full bg-[var(--color-surface)] rounded-full overflow-hidden mt-2">
              <div className="h-full bg-[var(--color-accent-500)] rounded-full w-1/3" />
            </div>
          </div>

          <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[var(--color-text-muted)]">Goethe/telc Mocks</span>
              <span className="text-[11px] font-bold text-[var(--color-success)]">
                {planDef.entitlements.mockExamsIncluded ? "Unlocked" : "Locked (Pro)"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-[var(--color-surface)] rounded-full overflow-hidden mt-2">
              <div className="h-full bg-[var(--color-success)] rounded-full w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Invoices & Receipts Table */}
      <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-[var(--color-brand-400)]" />
            <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
              Payment Invoices & Receipts
            </h3>
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">
            {invoices.length} Invoices available
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--color-text-secondary)]">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Invoice</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[var(--color-surface-2)]/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-[var(--color-text-primary)]">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-3">{inv.billingDate}</td>
                  <td className="py-3 px-3 font-semibold">
                    {formatPrice(inv.amount, inv.currency)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-success)]/15 text-[var(--color-success)]">
                      <CheckCircle2 size={10} /> Paid
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("selection");
                        addToast({ message: `Downloading receipt ${inv.invoiceNumber}...`, type: "info" });
                      }}
                      className="inline-flex items-center gap-1 text-[var(--color-brand-400)] hover:underline font-semibold"
                    >
                      <Download size={12} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone: Cancellation */}
      {subscription.planId !== "free" && !subscription.cancelAtPeriodEnd && (
        <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-danger)]/25 bg-[var(--color-danger)]/5 space-y-3">
          <h3 className="font-heading text-sm font-bold text-[var(--color-danger)]">
            Cancel Subscription
          </h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            Cancelling your plan will keep your benefits active until the end of the current billing period ({new Date(subscription.currentPeriodEnd).toLocaleDateString()}). You will lose priority AI tutoring and mock exam simulations upon expiration.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCancelModalOpen(true)}
            className="text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 text-xs font-semibold"
          >
            Cancel Subscription...
          </Button>
        </div>
      )}

      {/* Cancellation Survey Modal */}
      <CancellationSurveyModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        subscription={subscription}
        onSubscriptionUpdated={(updated) => setSubscription(updated)}
      />

      {/* Upgrade / Switch Plan Modal */}
      <ContextualPaywallModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        triggerMoment="general"
        onSuccess={() => {
          setSubscription(getUserSubscription("demo-user"));
          addToast({ message: "Plan updated successfully!", type: "success" });
        }}
      />
    </div>
  );
}
