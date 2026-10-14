"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell, Clock, ShieldCheck, Mail, Send, Eye,
  CheckCircle2, Laptop, Smartphone, FileText, Check, AlertCircle, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { EmailTemplateId, UserNotificationPreferences } from "@/lib/email/types";
import { getMockEmailPayload, renderEmailTemplate } from "@/lib/email/renderer";

const TEMPLATE_LIST: Array<{ id: EmailTemplateId; name: string; category: "transactional" | "engagement"; desc: string }> = [
  { id: "welcome", name: "Welcome to Deutsch Pfad", category: "transactional", desc: "First-day onboarding & study roadmap" },
  { id: "email_verification", name: "Email Verification", category: "transactional", desc: "Verification button + 6-digit backup code" },
  { id: "password_reset", name: "Password Reset", category: "transactional", desc: "Secure 60-min link with IP telemetry" },
  { id: "receipt_invoice", name: "Payment Receipt / Invoice", category: "transactional", desc: "Itemized tax receipt & PDF download" },
  { id: "trial_ending", name: "Trial Ending Reminder", category: "transactional", desc: "3-day transparent notice, zero surprises" },
  { id: "payment_failed", name: "Payment Failed", category: "transactional", desc: "Helpful fix & 3-day grace period" },
  { id: "subscription_cancelled", name: "Subscription Cancelled", category: "transactional", desc: "Clean exit & data preservation notice" },
  { id: "win_back", name: "Win-Back Offer", category: "transactional", desc: "Gentle, non-guilt invitation with 20% discount" },
  { id: "weekly_progress", name: "Weekly Progress Report", category: "engagement", desc: "XP, minutes, top words, and next lesson" },
  { id: "streak_at_risk", name: "Streak-at-Risk Reminder", category: "engagement", desc: "Supportive 3-min drill, ZERO guilt" },
  { id: "milestone_congratulations", name: "Milestone Level-Up", category: "engagement", desc: "CEFR completion & achievement certificate" },
];

export default function NotificationsSettingsPage() {
  const { addToast } = useToast();

  // Notification Preferences State
  const [preferences, setPreferences] = useState<UserNotificationPreferences>({
    userId: "demo-user",
    email: "learner@example.com",
    transactional: true,
    weeklyProgress: true,
    streakReminders: true,
    milestoneAlerts: true,
    productUpdates: true,
    quietHours: {
      enabled: true,
      startHour: 22,
      endHour: 8,
      timezone: "Europe/Berlin",
    },
    unsubscribedAllMarketing: false,
    updatedAt: new Date().toISOString(),
  });

  const [savingPrefs, setSavingPrefs] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  // Email Previewer State
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateId>("welcome");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [viewFormat, setViewFormat] = useState<"html" | "text">("html");
  const [testEmailRecipient, setTestEmailRecipient] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  // Load preferences from API
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/notifications/preferences");
        if (res.ok) {
          const data = await res.json();
          setPreferences(data);
          if (data.email) setTestEmailRecipient(data.email);
        }
      } catch (e) {
        console.warn("Could not load preferences:", e);
      } finally {
        setLoadingPrefs(false);
      }
    }
    load();
  }, []);

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (res.ok) {
        addToast({
          type: "success",
          title: "Preferences Saved",
          message: "Your notification settings and quiet hours have been updated.",
        });
      } else {
        throw new Error("Failed to save");
      }
    } catch {
      addToast({
        type: "error",
        title: "Save Failed",
        message: "Could not save your notification settings.",
      });
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleSendTestEmail = async () => {
    setSendingTest(true);
    try {
      const res = await fetch("/api/notifications/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate,
          recipientEmail: testEmailRecipient || preferences.email,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        addToast({
          type: "success",
          title: "Test Email Dispatched",
          message: `Sent '${selectedTemplate}' to ${testEmailRecipient || preferences.email}. Status: ${data.status}`,
        });
      } else {
        throw new Error(data.message || "Dispatch failed");
      }
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Test Send Error",
        message: err.message || "Failed to send test email.",
      });
    } finally {
      setSendingTest(false);
    }
  };

  // Render current selected template
  const currentPayload = getMockEmailPayload(selectedTemplate, testEmailRecipient || preferences.email);
  const rendered = renderEmailTemplate(currentPayload);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-10">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
        <div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-500)] hover:underline mb-2"
          >
            <ArrowLeft size={13} /> Back to Profile Settings
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[var(--color-brand-500)]/15 text-[var(--color-brand-500)] flex items-center justify-center">
              <Mail size={18} />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-extrabold tracking-tight">
                Lifecycle Messaging &amp; Notification Studio
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Manage your notification rules, quiet hours, and preview all 11 branded email templates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            <ShieldCheck size={12} className="mr-1 inline" /> 100% Guilt-Free Copy
          </Badge>
          <Badge variant="default" size="sm">
            RFC 8058 1-Click Unsubscribe
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: User Notification Preferences & Quiet Hours (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-[var(--radius-2xl)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-6">
            
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-border)]">
              <Bell size={18} className="text-[var(--color-brand-500)]" />
              <h2 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                Notification Preferences
              </h2>
            </div>

            {/* Email Channels */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Engagement &amp; Study Emails
              </p>

              {/* Weekly Progress */}
              <label className="flex items-start justify-between gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)] cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">Weekly Progress Report</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    Summary of XP earned, study minutes, accuracy, and next lesson.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.weeklyProgress && !preferences.unsubscribedAllMarketing}
                  disabled={preferences.unsubscribedAllMarketing}
                  onChange={(e) => setPreferences((p) => ({ ...p, weeklyProgress: e.target.checked }))}
                  className="mt-1 h-4 w-4 rounded accent-[var(--color-brand-500)]"
                />
              </label>

              {/* Streak Reminders */}
              <label className="flex items-start justify-between gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)] cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">Streak-at-Risk Reminders</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    Supportive evening nudge for a 3-minute quick drill before midnight.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.streakReminders && !preferences.unsubscribedAllMarketing}
                  disabled={preferences.unsubscribedAllMarketing}
                  onChange={(e) => setPreferences((p) => ({ ...p, streakReminders: e.target.checked }))}
                  className="mt-1 h-4 w-4 rounded accent-[var(--color-brand-500)]"
                />
              </label>

              {/* Milestones */}
              <label className="flex items-start justify-between gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)] cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">Milestone &amp; Level-Up Honors</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    Celebration notes upon finishing CEFR levels or major vocabulary goals.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.milestoneAlerts && !preferences.unsubscribedAllMarketing}
                  disabled={preferences.unsubscribedAllMarketing}
                  onChange={(e) => setPreferences((p) => ({ ...p, milestoneAlerts: e.target.checked }))}
                  className="mt-1 h-4 w-4 rounded accent-[var(--color-brand-500)]"
                />
              </label>

              {/* Product Updates */}
              <label className="flex items-start justify-between gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)] cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">Curriculum &amp; Feature Updates</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    Notices when new graded stories, CEFR mock tests, or features launch.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.productUpdates && !preferences.unsubscribedAllMarketing}
                  disabled={preferences.unsubscribedAllMarketing}
                  onChange={(e) => setPreferences((p) => ({ ...p, productUpdates: e.target.checked }))}
                  className="mt-1 h-4 w-4 rounded accent-[var(--color-brand-500)]"
                />
              </label>

              {/* Transactional (Locked) */}
              <div className="flex items-start justify-between gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)] opacity-80">
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">
                    Transactional &amp; Account Security
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    Password resets, email verification, invoices, and billing notices.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]">
                  Required
                </span>
              </div>
            </div>

            {/* Quiet Hours Section */}
            <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock size={16} className="text-[var(--color-accent-500)]" />
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">Quiet Hours</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.quietHours.enabled}
                    onChange={(e) =>
                      setPreferences((p) => ({
                        ...p,
                        quietHours: { ...p.quietHours, enabled: e.target.checked },
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[var(--color-surface-3)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-brand-500)]" />
                </label>
              </div>

              <p className="text-[11px] text-[var(--color-text-muted)]">
                During quiet hours, engagement emails and streak nudges are withheld until your morning window.
              </p>

              {preferences.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Start Time
                    </label>
                    <select
                      value={preferences.quietHours.startHour}
                      onChange={(e) =>
                        setPreferences((p) => ({
                          ...p,
                          quietHours: { ...p.quietHours, startHour: parseInt(e.target.value, 10) },
                        }))
                      }
                      className="w-full text-xs p-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)]"
                    >
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, "0")}:00 ({i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      End Time (Resume)
                    </label>
                    <select
                      value={preferences.quietHours.endHour}
                      onChange={(e) =>
                        setPreferences((p) => ({
                          ...p,
                          quietHours: { ...p.quietHours, endHour: parseInt(e.target.value, 10) },
                        }))
                      }
                      className="w-full text-xs p-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)]"
                    >
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, "0")}:00 ({i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Global Unsubscribe Toggle */}
            <div className="pt-4 border-t border-[var(--color-border)]">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.unsubscribedAllMarketing}
                  onChange={(e) =>
                    setPreferences((p) => ({
                      ...p,
                      unsubscribedAllMarketing: e.target.checked,
                    }))
                  }
                  className="rounded text-[var(--color-error)]"
                />
                <span className="text-xs text-[var(--color-text-secondary)]">
                  Mute all engagement and progress emails (1-Click Global Opt-Out)
                </span>
              </label>
            </div>

            <Button
              variant="primary"
              size="md"
              loading={savingPrefs}
              onClick={handleSavePreferences}
              className="w-full"
              leftIcon={<Check size={14} />}
            >
              Save Notification Preferences
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Template Studio & Interactive Previewer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-[var(--radius-2xl)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-5">
            
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
              <div>
                <h2 className="font-heading text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <Eye size={17} className="text-[var(--color-brand-500)]" />
                  Template Gallery &amp; Live Inspector
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Select any of the 11 lifecycle emails to preview rendered HTML and plain-text.
                </p>
              </div>

              {/* Viewport & Format Toggles */}
              <div className="flex items-center gap-1.5 p-1 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                <button
                  onClick={() => setViewFormat("html")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    viewFormat === "html"
                      ? "bg-[var(--color-surface)] shadow-xs text-[var(--color-brand-500)]"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  HTML View
                </button>
                <button
                  onClick={() => setViewFormat("text")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    viewFormat === "text"
                      ? "bg-[var(--color-surface)] shadow-xs text-[var(--color-brand-500)]"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  Plain Text
                </button>

                {viewFormat === "html" && (
                  <div className="flex items-center pl-1 border-l border-[var(--color-border)] ml-1">
                    <button
                      onClick={() => setPreviewMode("desktop")}
                      className={`p-1 rounded ${
                        previewMode === "desktop" ? "text-[var(--color-brand-500)] bg-[var(--color-surface)]" : "text-[var(--color-text-muted)]"
                      }`}
                      title="Desktop Width (580px)"
                    >
                      <Laptop size={14} />
                    </button>
                    <button
                      onClick={() => setPreviewMode("mobile")}
                      className={`p-1 rounded ${
                        previewMode === "mobile" ? "text-[var(--color-brand-500)] bg-[var(--color-surface)]" : "text-[var(--color-text-muted)]"
                      }`}
                      title="Mobile Width (360px)"
                    >
                      <Smartphone size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Template Selector Dropdown */}
            <div className="grid sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                  Lifecycle Email Template ({TEMPLATE_LIST.length} Available)
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value as EmailTemplateId)}
                  className="w-full text-xs p-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] font-semibold"
                >
                  <optgroup label="Transactional Emails">
                    {TEMPLATE_LIST.filter((t) => t.category === "transactional").map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Engagement & Study Emails">
                    {TEMPLATE_LIST.filter((t) => t.category === "engagement").map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Send Test Action */}
              <div className="sm:col-span-4 flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  loading={sendingTest}
                  onClick={handleSendTestEmail}
                  className="w-full"
                  leftIcon={<Send size={13} />}
                >
                  Test Send
                </Button>
              </div>
            </div>

            {/* Subject & Preheader Card */}
            <div className="p-3.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--color-text-secondary)]">Subject:</span>
                <span className="font-semibold text-[var(--color-text-primary)] truncate max-w-sm">
                  {rendered.subject}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--color-border)]/60 pt-1.5">
                <span className="text-[var(--color-text-muted)]">Preheader:</span>
                <span className="text-[var(--color-text-secondary)] italic truncate max-w-sm">
                  {rendered.preheader}
                </span>
              </div>
            </div>

            {/* Live Preview Canvas */}
            <div className="p-4 rounded-[var(--radius-xl)] bg-[#0f172a]/5 border border-[var(--color-border)] flex justify-center overflow-x-auto min-h-[460px]">
              {viewFormat === "html" ? (
                <div
                  style={{
                    width: previewMode === "desktop" ? "100%" : "360px",
                    maxWidth: previewMode === "desktop" ? "580px" : "360px",
                    transition: "all 0.2s ease-in-out",
                  }}
                  className="rounded-xl overflow-hidden shadow-md bg-white text-black"
                >
                  <iframe
                    title="Email Preview"
                    srcDoc={rendered.html}
                    className="w-full h-[520px] border-0"
                  />
                </div>
              ) : (
                <pre className="w-full max-w-xl p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-mono text-[var(--color-text-primary)] whitespace-pre-wrap overflow-y-auto max-h-[520px] leading-relaxed">
                  {rendered.text}
                </pre>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
