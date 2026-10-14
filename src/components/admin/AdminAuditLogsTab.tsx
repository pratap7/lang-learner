"use client";

import { useState } from "react";
import {
  FileText,
  Search,
  Filter,
  Shield,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { getAdminAuditLogs } from "@/lib/adminService";
import type { AdminAuditLog, AdminRole } from "@/types/admin";

export function AdminAuditLogsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<AdminRole | "all">("all");
  const [entityFilter, setEntityFilter] = useState("all");

  const [logs, setLogs] = useState<AdminAuditLog[]>(() => getAdminAuditLogs());
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);

  const refreshLogs = () => {
    setLogs(
      getAdminAuditLogs({
        search: searchQuery || undefined,
        role: roleFilter,
        entityType: entityFilter === "all" ? undefined : entityFilter,
      })
    );
  };

  const handleFilterChange = (q: string, role: AdminRole | "all", entity: string) => {
    setSearchQuery(q);
    setRoleFilter(role);
    setEntityFilter(entity);
    setLogs(
      getAdminAuditLogs({
        search: q || undefined,
        role,
        entityType: entity === "all" ? undefined : entity,
      })
    );
  };

  const renderRoleBadge = (role: AdminRole) => {
    switch (role) {
      case "super_admin":
        return <Badge variant="brand">Super Admin</Badge>;
      case "admin":
        return <Badge variant="brand">Admin</Badge>;
      case "curator":
        return <Badge variant="success">Curator</Badge>;
      case "support_agent":
      default:
        return <Badge variant="default">Support Agent</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Immutable Administrative Audit Trail
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Strict append-only logging of every content approval, plan modification, refund, and feature rollout.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={refreshLogs}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Logs
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)]">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) =>
              handleFilterChange(e.target.value, roleFilter, entityFilter)
            }
            placeholder="Search action, email, entity ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) =>
            handleFilterChange(searchQuery, e.target.value as any, entityFilter)
          }
          className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
        >
          <option value="all">All Staff Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Operations Admin</option>
          <option value="curator">Curator / Reviewer</option>
          <option value="support_agent">Support Agent</option>
        </select>

        {/* Entity Type Filter */}
        <select
          value={entityFilter}
          onChange={(e) =>
            handleFilterChange(searchQuery, roleFilter, e.target.value)
          }
          className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
        >
          <option value="all">All Entity Types</option>
          <option value="exercise">Exercises</option>
          <option value="lesson">Lessons</option>
          <option value="unit">Units</option>
          <option value="graded_text">Graded Stories</option>
          <option value="user_subscription">User Subscriptions</option>
          <option value="user_refund">Refunds</option>
          <option value="support_ticket">Support Tickets</option>
          <option value="feature_flag">Feature Flags</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      <div className="border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] font-semibold border-b border-[var(--color-border)] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Admin Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity &amp; Target</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--color-text-muted)]">
                    No audit records match your search query.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-[var(--color-bg-subtle)]/60 transition-colors"
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--color-text-secondary)] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>

                    {/* Admin Actor */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[var(--color-text-primary)]">
                          {log.adminEmail.split("@")[0]}
                        </span>
                        {renderRoleBadge(log.adminRole)}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-brand-600)] font-bold">
                        {log.action}
                      </span>
                    </td>

                    {/* Entity & Target */}
                    <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                      <div className="font-medium text-[var(--color-text-primary)] capitalize">
                        {log.targetEntityType.replace("_", " ")}
                      </div>
                      <div className="font-mono text-[10px] text-[var(--color-text-muted)] truncate max-w-[140px]">
                        {log.targetEntityId}
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 text-[var(--color-text-primary)] max-w-xs truncate">
                      {log.description}
                    </td>

                    {/* Diff button */}
                    <td className="py-3 px-4 text-right">
                      {log.changesDiff && (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-brand-600)] hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" /> Diff
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diff Inspector Modal */}
      {selectedLog && (
        <Modal
          open={Boolean(selectedLog)}
          onClose={() => setSelectedLog(null)}
          title={`Audit Record: ${selectedLog.action}`}
          description={`${selectedLog.adminEmail} on ${new Date(selectedLog.createdAt).toLocaleString()}`}
          size="lg"
        >
          <div className="space-y-4 py-2">
            <div className="p-3 bg-[var(--color-bg-subtle)] rounded-xl text-xs space-y-1">
              <div>Description: <strong>{selectedLog.description}</strong></div>
              <div>Entity: <strong className="font-mono">{selectedLog.targetEntityType} / {selectedLog.targetEntityId}</strong></div>
              {selectedLog.ipAddress && <div>IP: <strong>{selectedLog.ipAddress}</strong></div>}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-[var(--color-text-primary)]">
                State Changes Diff
              </div>
              <pre className="p-4 rounded-xl bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto max-h-72">
                {JSON.stringify(selectedLog.changesDiff, null, 2)}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
