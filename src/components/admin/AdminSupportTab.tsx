"use client";

import { useState } from "react";
import {
  Inbox,
  Send,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Shield,
  Tag,
  Paperclip,
  Check,
  ChevronRight,
  HelpCircle,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  getSupportTickets,
  addSupportTicketMessage,
  updateSupportTicketStatus,
  getCurrentAdminUser,
} from "@/lib/adminService";
import type {
  SupportTicket,
  SupportTicketStatus,
  SupportTicketCategory,
  SupportTicketPriority,
} from "@/types/admin";

export function AdminSupportTab() {
  const { toast } = useToast();
  const currentAdmin = getCurrentAdminUser();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [tickets, setTickets] = useState<SupportTicket[]>(() =>
    getSupportTickets()
  );

  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(
    tickets[0] || null
  );

  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);

  const refreshTickets = () => {
    const list = getSupportTickets({
      status: statusFilter,
      category: categoryFilter,
      priority: priorityFilter,
    });
    setTickets(list);
    if (activeTicket) {
      const refreshedActive = list.find((t) => t.id === activeTicket.id);
      if (refreshedActive) setActiveTicket(refreshedActive);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    const message = addSupportTicketMessage(
      activeTicket.id,
      replyText,
      isInternalNote
    );

    if (message) {
      toast({
        title: isInternalNote ? "Staff Note Added" : "Reply Sent",
        message: isInternalNote
          ? "Private internal note saved to ticket thread."
          : `Reply delivered to learner ${activeTicket.userEmail}.`,
        type: "success",
      });
      setReplyText("");
      refreshTickets();
    }
  };

  const handleStatusChange = (newStatus: SupportTicketStatus) => {
    if (!activeTicket) return;
    const updated = updateSupportTicketStatus(activeTicket.id, newStatus);
    if (updated) {
      toast({
        title: "Ticket Status Updated",
        message: `Ticket ${activeTicket.ticketNumber} is now ${newStatus.replace("_", " ").toUpperCase()}.`,
        type: "success",
      });
      refreshTickets();
    }
  };

  const handleCannedResponse = (templateText: string) => {
    setReplyText((prev) => (prev ? `${prev}\n\n${templateText}` : templateText));
  };

  const renderStatusBadge = (status: SupportTicketStatus) => {
    switch (status) {
      case "open":
        return <Badge variant="warning">Open</Badge>;
      case "in_progress":
        return <Badge variant="brand">In Progress</Badge>;
      case "resolved":
        return <Badge variant="success">Resolved</Badge>;
      case "closed":
        return <Badge variant="default">Closed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const renderPriorityBadge = (priority: SupportTicketPriority) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="error">Urgent</Badge>;
      case "high":
        return <Badge variant="warning">High</Badge>;
      case "normal":
      default:
        return <Badge variant="default">Normal</Badge>;
      case "low":
        return <Badge variant="default">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Learner Support &amp; Pedagogical Inquiry Inbox
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Resolve billing questions, respond to native German grammar clarifications, and track learner bug reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="brand">{tickets.filter((t) => t.status === "open").length} Open Tickets</Badge>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)]">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setTickets(
              getSupportTickets({
                status: e.target.value,
                category: categoryFilter,
                priority: priorityFilter,
              })
            );
          }}
          className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
        >
          <option value="all">All Ticket Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setTickets(
              getSupportTickets({
                status: statusFilter,
                category: e.target.value,
                priority: priorityFilter,
              })
            );
          }}
          className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
        >
          <option value="all">All Inquiry Categories</option>
          <option value="billing">Billing &amp; Invoices</option>
          <option value="content_feedback">Grammar / Content Nuance</option>
          <option value="technical_bug">Technical Bug</option>
          <option value="account_access">Account Access</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value);
            setTickets(
              getSupportTickets({
                status: statusFilter,
                category: categoryFilter,
                priority: e.target.value,
              })
            );
          }}
          className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* 2-Column Split: Tickets List (left) + Conversation Thread (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[560px]">
        {/* Left Column: Tickets Queue */}
        <div className="lg:col-span-5 border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] shadow-sm overflow-hidden flex flex-col">
          <div className="p-3.5 bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] font-bold text-xs text-[var(--color-text-primary)] flex items-center justify-between">
            <span>Inquiry Queue ({tickets.length})</span>
            <span className="text-[10px] text-[var(--color-text-muted)]">Click ticket to open</span>
          </div>

          <div className="divide-y divide-[var(--color-border)] overflow-y-auto max-h-[580px]">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
                No tickets matching current filters.
              </div>
            ) : (
              tickets.map((t) => {
                const isSelected = activeTicket?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTicket(t)}
                    className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-950)]/40 border-l-4 border-[var(--color-brand-500)]"
                        : "hover:bg-[var(--color-bg-subtle)]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-[10px] text-[var(--color-text-muted)] font-bold">
                        {t.ticketNumber}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {renderPriorityBadge(t.priority)}
                        {renderStatusBadge(t.status)}
                      </div>
                    </div>

                    <div className="font-bold text-xs text-[var(--color-text-primary)] line-clamp-1">
                      {t.subject}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)] mt-1">
                      <span>{t.userName}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {new Date(t.lastMessageAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Ticket Conversation Thread */}
        <div className="lg:col-span-7 border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] shadow-sm flex flex-col justify-between overflow-hidden">
          {activeTicket ? (
            <>
              {/* Ticket Header */}
              <div className="p-4 bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--color-brand-600)]">
                      {activeTicket.ticketNumber}
                    </span>
                    <Badge variant="default" className="capitalize text-[10px]">
                      {activeTicket.category.replace("_", " ")}
                    </Badge>
                  </div>

                  {/* Status Switcher Buttons */}
                  <div className="flex items-center gap-1.5">
                    {activeTicket.status !== "resolved" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange("resolved")}
                        className="text-xs h-7 text-emerald-600 dark:text-emerald-400"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Resolved
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange("open")}
                        className="text-xs h-7"
                      >
                        Reopen Ticket
                      </Button>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-sm text-[var(--color-text-primary)]">
                  {activeTicket.subject}
                </h3>

                <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-2">
                  <span>From: <strong>{activeTicket.userName}</strong> ({activeTicket.userEmail})</span>
                  {activeTicket.assignedTo && (
                    <span>· Assigned: <strong>{activeTicket.assignedTo.split("@")[0]}</strong></span>
                  )}
                </div>
              </div>

              {/* Message Thread History */}
              <div className="p-4 space-y-3.5 overflow-y-auto max-h-[340px] flex-1">
                {activeTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-xl text-xs space-y-1.5 ${
                      msg.isInternal
                        ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                        : msg.senderType === "customer"
                        ? "bg-[var(--color-bg-subtle)] border border-[var(--color-border)] ml-0 mr-8"
                        : "bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-950)]/40 border border-[var(--color-brand-200)] dark:border-[var(--color-brand-800)] mr-0 ml-8"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold text-[var(--color-text-primary)]">
                        {msg.isInternal && (
                          <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        )}
                        <span>{msg.senderName}</span>
                        <span className="text-[10px] text-[var(--color-text-muted)] font-normal">
                          {msg.isInternal
                            ? "(Internal Staff Note)"
                            : msg.senderType === "agent"
                            ? "(Staff Reply)"
                            : "(Learner)"}
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="text-xs text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed">
                      {msg.body}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <form
                onSubmit={handleSendReply}
                className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)] space-y-3"
              >
                {/* Tabs: Public Customer Reply vs Internal Staff Note */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsInternalNote(false)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                        !isInternalNote
                          ? "bg-[var(--color-surface)] text-[var(--color-brand-600)] shadow-sm font-bold border border-[var(--color-border)]"
                          : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      Reply to Learner
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInternalNote(true)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                        isInternalNote
                          ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 shadow-sm font-bold border border-amber-300 dark:border-amber-700"
                          : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      <Lock className="w-3 h-3" /> Internal Staff Note
                    </button>
                  </div>

                  {/* Canned Responses Dropdown / Quick Links */}
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
                    <span className="font-semibold">Canned:</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCannedResponse(
                          "Thank you for contacting DeutschPfad support! I have verified your account and updated the requested details."
                        )
                      }
                      className="hover:underline text-[var(--color-brand-600)]"
                    >
                      General
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCannedResponse(
                          "In German grammar, this is governed by the accusative case (direct object). Masculine singular nouns take 'den/einen', whereas feminine ('die/eine') and neuter ('das/ein') remain unchanged."
                        )
                      }
                      className="hover:underline text-[var(--color-brand-600)]"
                    >
                      Grammar
                    </button>
                  </div>
                </div>

                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    isInternalNote
                      ? "Add private note visible only to admins and curators..."
                      : `Write response to ${activeTicket.userName}...`
                  }
                  className="w-full p-2.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    Logged in as <strong>{currentAdmin.name}</strong>
                  </span>
                  <Button size="sm" type="submit" disabled={!replyText.trim()}>
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {isInternalNote ? "Save Internal Note" : "Send Reply"}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-[var(--color-text-muted)]">
              Select a ticket from the left queue to view correspondence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
