"use client";

import { useState } from "react";
import {
  FileText,
  BookOpen,
  HelpCircle,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  MessageSquare,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit3,
  Layers,
  ArrowRight,
  ExternalLink,
  Save,
  Trash2,
  Check,
  AlertCircle,
  Send,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  getAdminContentItems,
  saveContentItem,
  updateContentReviewStatus,
  addContentReviewerNote,
  bulkExportContent,
  bulkImportContent,
  getCurrentAdminUser,
} from "@/lib/adminService";
import type {
  AdminContentItem,
  ContentEntityType,
  ContentReviewStatus,
  ReviewerNote,
} from "@/types/admin";

export function AdminContentTab() {
  const { toast } = useToast();
  const currentAdmin = getCurrentAdminUser();

  const [entityFilter, setEntityFilter] = useState<ContentEntityType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ContentReviewStatus | "all">("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [items, setItems] = useState<AdminContentItem[]>(() =>
    getAdminContentItems()
  );

  // Active Modals
  const [previewItem, setPreviewItem] = useState<AdminContentItem | null>(null);
  const [notesItem, setNotesItem] = useState<AdminContentItem | null>(null);
  const [editingItem, setEditingItem] = useState<AdminContentItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form states
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteStatus, setNewNoteStatus] = useState<ContentReviewStatus>("needs_review");
  const [importText, setImportText] = useState("");
  const [importFormat, setImportFormat] = useState<"json" | "csv">("json");
  const [importErrors, setImportErrors] = useState<string[]>([]);

  // Interactive preview state for exercises
  const [selectedPreviewAnswer, setSelectedPreviewAnswer] = useState<string | null>(null);
  const [previewFeedback, setPreviewFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  const refreshItems = () => {
    setItems(
      getAdminContentItems({
        entityType: entityFilter === "all" ? undefined : entityFilter,
        reviewStatus: statusFilter === "all" ? undefined : statusFilter,
        level: levelFilter === "all" ? undefined : levelFilter,
        search: searchQuery || undefined,
      })
    );
  };

  const handleFilterChange = (
    entity: ContentEntityType | "all",
    status: ContentReviewStatus | "all",
    level: string,
    query: string
  ) => {
    setEntityFilter(entity);
    setStatusFilter(status);
    setLevelFilter(level);
    setSearchQuery(query);
    setItems(
      getAdminContentItems({
        entityType: entity === "all" ? undefined : entity,
        reviewStatus: status === "all" ? undefined : status,
        level: level === "all" ? undefined : level,
        search: query || undefined,
      })
    );
  };

  const handleQuickStatusChange = (contentId: string, newStatus: ContentReviewStatus) => {
    const updated = updateContentReviewStatus(contentId, newStatus);
    if (updated) {
      toast({
        title: "Status Updated",
        message: `Content "${updated.title}" is now ${newStatus.replace("_", " ").toUpperCase()}.`,
        type: "success",
      });
      refreshItems();
    }
  };

  const handleAddReviewerNote = () => {
    if (!notesItem || !newNoteText.trim()) return;
    addContentReviewerNote(notesItem.id, newNoteText, newNoteStatus);
    if (newNoteStatus !== notesItem.reviewStatus) {
      updateContentReviewStatus(notesItem.id, newNoteStatus);
    }
    setNewNoteText("");
    toast({
      title: "Note Recorded",
      message: "Reviewer feedback saved and logged to audit trail.",
      type: "success",
    });
    refreshItems();
    // Refresh modal item
    const refreshed = getAdminContentItems().find((i) => i.id === notesItem.id);
    if (refreshed) setNotesItem(refreshed);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    saveContentItem(editingItem);
    toast({
      title: "Saved Successfully",
      message: `"${editingItem.title}" has been saved.`,
      type: "success",
    });
    setEditingItem(null);
    refreshItems();
  };

  const handleExport = (format: "json" | "csv") => {
    const data = bulkExportContent(entityFilter, format);
    const blob = new Blob([data], {
      type: format === "json" ? "application/json" : "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `deutschpfad-content-${entityFilter}-${new Date().toISOString().slice(0, 10)}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Export Ready",
      message: `Downloaded ${format.toUpperCase()} archive.`,
      type: "success",
    });
  };

  const handleRunBulkImport = () => {
    if (!importText.trim()) return;
    const { count, errors } = bulkImportContent(importText, importFormat);
    setImportErrors(errors);
    if (count > 0) {
      toast({
        title: "Bulk Import Successful",
        message: `Imported ${count} items into curriculum catalog.`,
        type: "success",
      });
      refreshItems();
      if (errors.length === 0) {
        setIsImportModalOpen(false);
        setImportText("");
      }
    }
  };

  const renderStatusBadge = (status: ContentReviewStatus) => {
    switch (status) {
      case "published":
        return <Badge variant="success">Published</Badge>;
      case "approved":
        return <Badge variant="brand">Approved</Badge>;
      case "needs_review":
        return <Badge variant="warning">Needs Native Review</Badge>;
      case "draft":
      default:
        return <Badge variant="default">Draft</Badge>;
    }
  };

  const renderEntityIcon = (type: ContentEntityType) => {
    switch (type) {
      case "unit":
        return <Layers className="w-4 h-4 text-emerald-500" />;
      case "lesson":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "exercise":
        return <HelpCircle className="w-4 h-4 text-purple-500" />;
      case "graded_text":
        return <FileText className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Primary Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Curriculum &amp; Content Studio
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Author, review, preview, and publish units, lessons, exercises, and graded stories without code changes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Bulk Export Trigger */}
          <div className="flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <button
              onClick={() => handleExport("json")}
              className="px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] border-r border-[var(--color-border)] flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> JSON
            </button>
            <button
              onClick={() => handleExport("csv")}
              className="px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>

          {/* Bulk Import Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setImportErrors([]);
              setIsImportModalOpen(true);
            }}
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" /> Bulk Import
          </Button>

          {/* New Item Trigger */}
          <Button
            size="sm"
            onClick={() => {
              const newItem: AdminContentItem = {
                id: `item-${Date.now()}`,
                entityType: "exercise",
                level: "A1",
                slug: "new-exercise",
                title: "New Interactive Exercise",
                titleDe: "Neue interaktive Übung",
                reviewStatus: "draft",
                orderIndex: items.length + 1,
                contentPayload: {
                  exerciseType: "multiple_choice",
                  prompt: "Enter instruction for learner...",
                  promptDe: "German context sentence...",
                  options: ["Option A", "Option B", "Option C"],
                  correctAnswer: "Option A",
                  explanation: "Grammar explanation here.",
                  xpReward: 15,
                },
                reviewerNotes: [],
                createdBy: currentAdmin.email,
                lastModifiedBy: currentAdmin.email,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              setEditingItem(newItem);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Item
          </Button>
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
              handleFilterChange(entityFilter, statusFilter, levelFilter, e.target.value)
            }
            placeholder="Search titles, slugs, IDs..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
          />
        </div>

        {/* Entity Type Filter */}
        <select
          value={entityFilter}
          onChange={(e) =>
            handleFilterChange(e.target.value as any, statusFilter, levelFilter, searchQuery)
          }
          className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
        >
          <option value="all">All Content Types</option>
          <option value="unit">Units (Curriculum)</option>
          <option value="lesson">Lessons</option>
          <option value="exercise">Exercises</option>
          <option value="graded_text">Graded Stories</option>
        </select>

        {/* Review Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) =>
            handleFilterChange(entityFilter, e.target.value as any, levelFilter, searchQuery)
          }
          className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
        >
          <option value="all">All Review Statuses</option>
          <option value="draft">Draft</option>
          <option value="needs_review">Needs Native Review</option>
          <option value="approved">Approved</option>
          <option value="published">Published</option>
        </select>

        {/* CEFR Level Filter */}
        <select
          value={levelFilter}
          onChange={(e) =>
            handleFilterChange(entityFilter, statusFilter, e.target.value, searchQuery)
          }
          className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
        >
          <option value="all">All CEFR Levels</option>
          <option value="A1">A1 · Beginner</option>
          <option value="A2">A2 · Elementary</option>
          <option value="B1">B1 · Intermediate</option>
          <option value="B2">B2 · Vantage</option>
          <option value="C1">C1 · Advanced</option>
        </select>
      </div>

      {/* Content Table */}
      <div className="border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] font-semibold border-b border-[var(--color-border)] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Entity &amp; Title</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Review Status</th>
                <th className="py-3 px-4">Reviewer Notes</th>
                <th className="py-3 px-4">Last Modified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--color-text-muted)]">
                    No content items match your current filter criteria.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[var(--color-bg-subtle)]/60 transition-colors group"
                  >
                    {/* Entity & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[var(--color-bg-subtle)] shrink-0 mt-0.5">
                          {renderEntityIcon(item.entityType)}
                        </div>
                        <div>
                          <div className="font-bold text-[var(--color-text-primary)]">
                            {item.title}
                          </div>
                          <div className="text-[var(--color-text-secondary)] font-medium text-[11px] mt-0.5">
                            {item.titleDe}
                          </div>
                          <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-mono">
                            {item.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Level */}
                    <td className="py-3.5 px-4">
                      <Badge variant="default">{item.level}</Badge>
                    </td>

                    {/* Review Status */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {renderStatusBadge(item.reviewStatus)}
                      </div>
                    </td>

                    {/* Reviewer Notes */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setNotesItem(item)}
                        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors p-1 rounded-md hover:bg-[var(--color-bg-subtle)]"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="font-semibold">{item.reviewerNotes?.length || 0}</span>
                      </button>
                    </td>

                    {/* Last Modified */}
                    <td className="py-3.5 px-4 text-[var(--color-text-secondary)]">
                      <div>{item.lastModifiedBy.split("@")[0]}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Live Preview */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPreviewItem(item);
                            setSelectedPreviewAnswer(null);
                            setPreviewFeedback(null);
                          }}
                          title="Interactive Live Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>

                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingItem({ ...item })}
                          title="Edit Content Item"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>

                        {/* Quick Status Advance */}
                        {item.reviewStatus === "draft" && (
                          <button
                            onClick={() => handleQuickStatusChange(item.id, "needs_review")}
                            className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline px-2 py-1 rounded"
                          >
                            Submit
                          </button>
                        )}
                        {item.reviewStatus === "needs_review" && (
                          <button
                            onClick={() => handleQuickStatusChange(item.id, "approved")}
                            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 rounded"
                          >
                            Approve
                          </button>
                        )}
                        {item.reviewStatus === "approved" && (
                          <button
                            onClick={() => handleQuickStatusChange(item.id, "published")}
                            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-1 rounded"
                          >
                            Publish
                          </button>
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

      {/* ─── MODAL 1: Interactive Live Preview ────────────────────────────── */}
      {previewItem && (
        <Modal
          open={Boolean(previewItem)}
          onClose={() => setPreviewItem(null)}
          title={`Live Interactive Preview: ${previewItem.title}`}
          description={`Testing how ${previewItem.entityType} looks and behaves for learners.`}
          size="lg"
        >
          <div className="space-y-6 py-2">
            {/* Top metadata pill */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="default">{previewItem.level}</Badge>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {previewItem.titleDe}
                </span>
              </div>
              {renderStatusBadge(previewItem.reviewStatus)}
            </div>

            {/* If Exercise: Interactive Answer Testing */}
            {previewItem.entityType === "exercise" && (
              <div className="p-6 rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <div className="text-xs uppercase tracking-wider font-bold text-[var(--color-brand-600)]">
                  Learner View Experience
                </div>

                <div className="text-base font-bold text-[var(--color-text-primary)]">
                  {previewItem.contentPayload?.prompt}
                </div>

                {previewItem.contentPayload?.promptDe && (
                  <div className="p-4 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-primary)]">
                    {previewItem.contentPayload.promptDe}
                  </div>
                )}

                {/* Exercise Options */}
                {Array.isArray(previewItem.contentPayload?.options) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {previewItem.contentPayload.options.map((opt: string) => {
                      const isSelected = selectedPreviewAnswer === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            setSelectedPreviewAnswer(opt);
                            const isCorrect = opt === previewItem.contentPayload.correctAnswer;
                            setPreviewFeedback({
                              isCorrect,
                              text: isCorrect
                                ? `Richtig! ${previewItem.contentPayload.explanation || ""}`
                                : `Nicht ganz. The correct answer is "${previewItem.contentPayload.correctAnswer}".`,
                            });
                          }}
                          className={`p-3 rounded-xl text-left text-xs font-semibold border transition-all ${
                            isSelected
                              ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-950)] text-[var(--color-brand-700)] dark:text-[var(--color-brand-300)]"
                              : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-300)]"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Instant validation result */}
                {previewFeedback && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-medium border flex items-start gap-2.5 ${
                      previewFeedback.isCorrect
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                        : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200"
                    }`}
                  >
                    {previewFeedback.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mt-0.5 text-rose-600 dark:text-rose-400 shrink-0" />
                    )}
                    <div>
                      <div>{previewFeedback.text}</div>
                      {previewItem.contentPayload?.grammarTip && (
                        <div className="mt-1.5 text-[11px] opacity-90">
                          <strong>Grammar Rule: </strong>
                          {previewItem.contentPayload.grammarTip}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* If Graded Story */}
            {previewItem.entityType === "graded_text" && (
              <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {previewItem.contentPayload?.coverEmoji || "📖"}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--color-text-primary)]">
                      {previewItem.titleDe}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {previewItem.title}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[var(--color-bg-subtle)] rounded-xl text-xs text-[var(--color-text-secondary)]">
                  {previewItem.contentPayload?.summary}
                </div>

                {previewItem.contentPayload?.sampleSentenceDe && (
                  <div className="border-l-2 border-[var(--color-brand-500)] pl-3 py-1 space-y-1">
                    <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                      „{previewItem.contentPayload.sampleSentenceDe}“
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      {previewItem.contentPayload.sampleSentenceEn}
                    </div>
                  </div>
                )}

                {previewItem.contentPayload?.culturalTip && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                    <strong>Cultural Context: </strong>
                    {previewItem.contentPayload.culturalTip}
                  </div>
                )}
              </div>
            )}

            {/* If Unit or Lesson */}
            {(previewItem.entityType === "unit" || previewItem.entityType === "lesson") && (
              <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
                <div className="text-xs text-[var(--color-text-secondary)]">
                  {previewItem.contentPayload?.description || previewItem.contentPayload?.summary}
                </div>
                {previewItem.contentPayload?.grammarRule && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-200">
                    <strong>Pedagogical Objective: </strong>
                    {previewItem.contentPayload.grammarRule}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ─── MODAL 2: Reviewer Notes & Feedback Thread ────────────────────── */}
      {notesItem && (
        <Modal
          open={Boolean(notesItem)}
          onClose={() => setNotesItem(null)}
          title={`Reviewer Feedback: ${notesItem.title}`}
          description="Threaded editorial dialogue between native German reviewers and content authors."
          size="lg"
        >
          <div className="space-y-5 py-2">
            {/* Status overview */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-xs">
              <span>Current Status: {renderStatusBadge(notesItem.reviewStatus)}</span>
              <span className="text-[var(--color-text-muted)]">
                {notesItem.reviewerNotes?.length || 0} Comments
              </span>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {!notesItem.reviewerNotes || notesItem.reviewerNotes.length === 0 ? (
                <div className="text-center py-8 text-xs text-[var(--color-text-muted)]">
                  No feedback recorded yet. Add the first reviewer note below.
                </div>
              ) : (
                notesItem.reviewerNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--color-text-primary)]">
                          {note.authorName}
                        </span>
                        <Badge variant="default" className="text-[10px] py-0 px-1.5">
                          {note.authorRole.replace("_", " ")}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--color-text-primary)] leading-relaxed">
                      {note.note}
                    </div>
                    {note.statusTag && (
                      <div className="pt-1">
                        <span className="text-[10px] text-[var(--color-text-muted)]">
                          Tagged: <strong>{note.statusTag}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add note input form */}
            <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] space-y-3">
              <div className="text-xs font-bold text-[var(--color-text-primary)]">
                Add Reviewer Feedback
              </div>
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Write feedback, dialect corrections, or pedagogical suggestions..."
                rows={3}
                className="w-full p-2.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
              />

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    Transition to:
                  </span>
                  <select
                    value={newNoteStatus}
                    onChange={(e) => setNewNoteStatus(e.target.value as any)}
                    className="px-2.5 py-1 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                  >
                    <option value="draft">Draft</option>
                    <option value="needs_review">Needs Native Review</option>
                    <option value="approved">Approved</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <Button size="sm" onClick={handleAddReviewerNote} disabled={!newNoteText.trim()}>
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Submit Feedback
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── MODAL 3: Edit / Create Content Item ─────────────────────────── */}
      {editingItem && (
        <Modal
          open={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          title={`Edit Content: ${editingItem.title}`}
          size="lg"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Title (English)
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Title (German)
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.titleDe}
                  onChange={(e) => setEditingItem({ ...editingItem, titleDe: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Entity Type
                </label>
                <select
                  value={editingItem.entityType}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, entityType: e.target.value as any })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                >
                  <option value="unit">Unit</option>
                  <option value="lesson">Lesson</option>
                  <option value="exercise">Exercise</option>
                  <option value="graded_text">Graded Story</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  CEFR Level
                </label>
                <select
                  value={editingItem.level}
                  onChange={(e) => setEditingItem({ ...editingItem, level: e.target.value as any })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                >
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.slug}
                  onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Review Status
                </label>
                <select
                  value={editingItem.reviewStatus}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, reviewStatus: e.target.value as any })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                >
                  <option value="draft">Draft</option>
                  <option value="needs_review">Needs Native Review</option>
                  <option value="approved">Approved</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Content Payload (JSON)
              </label>
              <textarea
                rows={6}
                value={JSON.stringify(editingItem.contentPayload, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setEditingItem({ ...editingItem, contentPayload: parsed });
                  } catch {
                    // let user finish typing
                  }
                }}
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL 4: Bulk Import JSON / CSV ─────────────────────────────── */}
      {isImportModalOpen && (
        <Modal
          open={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title="Bulk Import Content Catalog"
          description="Import multiple lessons, units, or exercises at once via JSON or CSV."
          size="lg"
        >
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Format:
              </span>
              <button
                onClick={() => setImportFormat("json")}
                className={`px-3 py-1 text-xs rounded-md font-semibold ${
                  importFormat === "json"
                    ? "bg-[var(--color-brand-500)] text-white"
                    : "bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]"
                }`}
              >
                JSON
              </button>
              <button
                onClick={() => setImportFormat("csv")}
                className={`px-3 py-1 text-xs rounded-md font-semibold ${
                  importFormat === "csv"
                    ? "bg-[var(--color-brand-500)] text-white"
                    : "bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]"
                }`}
              >
                CSV
              </button>
            </div>

            <textarea
              rows={8}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={
                importFormat === "json"
                  ? '[\n  {\n    "id": "ex-001",\n    "entityType": "exercise",\n    "level": "A1",\n    "title": "Sample Exercise",\n    "titleDe": "Beispielübung"\n  }\n]'
                  : 'id,entityType,level,title,titleDe,slug,reviewStatus\nex-002,exercise,A1,Sample Exercise,Beispielübung,sample-ex,draft'
              }
              className="w-full p-3 text-xs font-mono rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
            />

            {importErrors.length > 0 && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                <div className="font-bold">Validation Issues:</div>
                <ul className="list-disc pl-4 space-y-0.5">
                  {importErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportModalOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleRunBulkImport} disabled={!importText.trim()}>
                <Upload className="w-3.5 h-3.5 mr-1.5" /> Execute Import
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
