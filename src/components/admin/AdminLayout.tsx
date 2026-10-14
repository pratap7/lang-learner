"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Inbox,
  Flag,
  FileText,
  Shield,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Layers,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  getCurrentAdminUser,
  setActiveAdminRole,
  getActiveAdminRole,
  MOCK_ADMIN_STAFF,
} from "@/lib/adminService";
import { ROLE_PERMISSIONS, type AdminRole } from "@/types/admin";
import { AdminDashboardTab } from "./AdminDashboardTab";
import { AdminContentTab } from "./AdminContentTab";
import { AdminUsersTab } from "./AdminUsersTab";
import { AdminSupportTab } from "./AdminSupportTab";
import { AdminFeatureFlagsTab } from "./AdminFeatureFlagsTab";
import { AdminAuditLogsTab } from "./AdminAuditLogsTab";

type AdminTabKey =
  | "dashboard"
  | "content"
  | "users"
  | "support"
  | "feature_flags"
  | "audit_logs";

export function AdminLayout() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTabKey>("dashboard");
  const [currentAdmin, setCurrentAdmin] = useState(getCurrentAdminUser());
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  useEffect(() => {
    const handleRoleChanged = () => {
      setCurrentAdmin(getCurrentAdminUser());
    };
    window.addEventListener("deutschpfad_admin_role_changed", handleRoleChanged);
    return () => window.removeEventListener("deutschpfad_admin_role_changed", handleRoleChanged);
  }, []);

  const permissions = ROLE_PERMISSIONS[currentAdmin.role];

  const handleSwitchRole = (newRole: AdminRole) => {
    setActiveAdminRole(newRole);
    setCurrentAdmin(getCurrentAdminUser());
    setIsRoleDropdownOpen(false);
    toast({
      title: "Role Switched",
      message: `Active role updated to ${newRole.replace("_", " ").toUpperCase()}. Permissions refreshed.`,
      type: "success",
    });
  };

  const tabs = [
    {
      key: "dashboard" as const,
      label: "Executive Dashboard",
      icon: LayoutDashboard,
      allowed: permissions.canViewAnalytics,
    },
    {
      key: "content" as const,
      label: "Content Studio",
      icon: BookOpen,
      allowed: permissions.canManageContent,
    },
    {
      key: "users" as const,
      label: "Learners & Billing",
      icon: Users,
      allowed: permissions.canManageUsers,
    },
    {
      key: "support" as const,
      label: "Support Inbox",
      icon: Inbox,
      allowed: permissions.canManageUsers || currentAdmin.role === "curator",
    },
    {
      key: "feature_flags" as const,
      label: "Feature Flags",
      icon: Flag,
      allowed: permissions.canManageFeatureFlags,
    },
    {
      key: "audit_logs" as const,
      label: "Audit Logs",
      icon: FileText,
      allowed: permissions.canViewAuditLogs,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col font-sans">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur border-b border-[var(--color-border)] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Admin Area Label */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--color-brand-600)] to-[var(--color-brand-400)] flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                DP
              </div>
              <div>
                <div className="font-extrabold text-sm tracking-tight text-[var(--color-text-primary)]">
                  DeutschPfad
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-brand-600)]">
                  Operations Console
                </div>
              </div>
            </Link>

            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              RBAC Protected
            </span>
          </div>

          {/* Right Section: Role Switcher & Learner App Return */}
          <div className="flex items-center gap-3">
            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] hover:bg-[var(--color-surface)] transition-all text-xs"
              >
                <img
                  src={currentAdmin.avatar}
                  alt={currentAdmin.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div className="text-left hidden md:block">
                  <div className="font-bold text-[var(--color-text-primary)] leading-tight">
                    {currentAdmin.name}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)] capitalize">
                    {currentAdmin.role.replace("_", " ")}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                    Simulate Admin Role (RBAC)
                  </div>
                  <div className="space-y-1 mt-1">
                    {MOCK_ADMIN_STAFF.map((staff) => {
                      const isSelected = staff.role === currentAdmin.role;
                      return (
                        <button
                          key={staff.id}
                          onClick={() => handleSwitchRole(staff.role)}
                          className={`w-full text-left p-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                            isSelected
                              ? "bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-950)]/50 text-[var(--color-brand-700)] dark:text-[var(--color-brand-300)] font-bold"
                              : "hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]"
                          }`}
                        >
                          <img
                            src={staff.avatar}
                            alt={staff.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-semibold">{staff.name}</div>
                            <div className="text-[10px] opacity-75 capitalize">
                              {staff.role.replace("_", " ")}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Back to main app */}
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-xs">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Learner App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 border-b border-[var(--color-border)] no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            if (!tab.allowed) {
              return (
                <button
                  key={tab.key}
                  disabled
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-[var(--color-text-muted)] opacity-50 cursor-not-allowed whitespace-nowrap"
                  title="Your role does not have permission for this section"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            }

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[var(--color-brand-500)] text-white shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panes */}
        <main className="pb-16">
          {activeTab === "dashboard" && permissions.canViewAnalytics && <AdminDashboardTab />}
          {activeTab === "content" && permissions.canManageContent && <AdminContentTab />}
          {activeTab === "users" && permissions.canManageUsers && <AdminUsersTab />}
          {activeTab === "support" && (permissions.canManageUsers || currentAdmin.role === "curator") && (
            <AdminSupportTab />
          )}
          {activeTab === "feature_flags" && permissions.canManageFeatureFlags && (
            <AdminFeatureFlagsTab />
          )}
          {activeTab === "audit_logs" && permissions.canViewAuditLogs && <AdminAuditLogsTab />}
        </main>
      </div>
    </div>
  );
}
