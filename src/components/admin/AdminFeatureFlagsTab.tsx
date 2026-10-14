"use client";

import { useState } from "react";
import {
  Flag,
  Plus,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Shield,
  Save,
  Clock,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  getFeatureFlags,
  updateFeatureFlag,
  getCurrentAdminUser,
} from "@/lib/adminService";
import type { FeatureFlag } from "@/types/admin";

export function AdminFeatureFlagsTab() {
  const { toast } = useToast();
  const currentAdmin = getCurrentAdminUser();

  const [flags, setFlags] = useState<FeatureFlag[]>(() => getFeatureFlags());
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  const refreshFlags = () => {
    setFlags(getFeatureFlags());
  };

  const handleToggle = (flag: FeatureFlag) => {
    const updated = updateFeatureFlag(flag.id, {
      enabled: !flag.enabled,
    });
    if (updated) {
      toast({
        title: updated.enabled ? "Flag Enabled" : "Flag Disabled",
        message: `"${updated.name}" is now ${updated.enabled ? "active" : "inactive"}.`,
        type: updated.enabled ? "success" : "info",
      });
      refreshFlags();
    }
  };

  const handleRolloutChange = (flag: FeatureFlag, percentage: number) => {
    const updated = updateFeatureFlag(flag.id, {
      rolloutPercentage: percentage,
    });
    if (updated) {
      toast({
        title: "Rollout Adjusted",
        message: `Set "${updated.name}" rollout to ${percentage}%.`,
        type: "success",
      });
      refreshFlags();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Feature Flags &amp; Progressive Rollouts
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Safely toggle experimental AI models, region-locked gateways, and canary features with instant killswitches.
          </p>
        </div>

        <Badge variant="brand">{flags.filter((f) => f.enabled).length} / {flags.length} Flags Active</Badge>
      </div>

      {/* Flags List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className={`p-5 rounded-2xl border transition-all ${
              flag.enabled
                ? "bg-[var(--color-surface)] border-[var(--color-brand-400)]/60 shadow-sm"
                : "bg-[var(--color-surface)] border-[var(--color-border)] opacity-80"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[var(--color-text-primary)]">
                    {flag.name}
                  </span>
                  {flag.isKillswitch && (
                    <Badge variant="error" className="text-[10px]">
                      Killswitch
                    </Badge>
                  )}
                </div>
                <div className="font-mono text-[10px] text-[var(--color-text-muted)] mt-0.5">
                  {flag.id}
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => handleToggle(flag)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] ${
                  flag.enabled ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
                }`}
                title={flag.enabled ? "Disable feature flag" : "Enable feature flag"}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    flag.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] mt-3 leading-relaxed">
              {flag.description}
            </p>

            {/* Rollout Percentage Slider */}
            <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> Rollout Allocation:
                </span>
                <span className="font-bold text-[var(--color-text-primary)]">
                  {flag.rolloutPercentage}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                disabled={!flag.enabled}
                value={flag.rolloutPercentage}
                onChange={(e) => handleRolloutChange(flag, Number(e.target.value))}
                className="w-full h-1.5 bg-[var(--color-bg-subtle)] rounded-lg appearance-none cursor-pointer accent-[var(--color-brand-500)] disabled:opacity-40"
              />
            </div>

            {/* Target Audiences & Metadata */}
            <div className="mt-4 flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
              <div className="flex flex-wrap gap-1">
                {flag.targetAudiences.map((aud) => (
                  <Badge key={aud} variant="default" className="text-[10px] py-0 px-1.5 font-mono">
                    {aud}
                  </Badge>
                ))}
              </div>

              <div className="text-[10px]">
                Updated by <strong>{flag.updatedBy.split("@")[0]}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
