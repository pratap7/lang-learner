/**
 * DeutschPfad AI Spend Anomaly & Threshold Alerting Engine
 * Monitors per-user token and audio compute burn, detects runaway loops,
 * and triggers automated notifications when thresholds are crossed.
 */

import type { AISpendAlert } from '../../types/analytics.ts';

/* ─── Threshold Configuration ────────────────────────────────────────────── */

let currentAIThresholdConfig = {
  maxSpendPerUserMonthly: 1.50, // $1.50 per user per month ceiling (benchmark avg is $0.42)
  maxDailyPlatformBurn: 150.00,  // $150/day platform ceiling
  alertEmailRecipient: 'engineering-alerts@deutschpfad.com',
  isAlertingEnabled: true,
};

let activeAlertsStore: AISpendAlert[] = [
  {
    id: 'alert-ai-01',
    type: 'user_threshold_exceeded',
    userId: 'usr-1092',
    userEmail: 'maximilian.power@example.de',
    userName: 'Maximilian Kraft',
    thresholdAmount: 1.50,
    actualAmount: 2.84,
    severity: 'warning',
    status: 'active',
    message: 'User exceeded $1.50/mo AI compute ceiling ($2.84 accumulated via 420 min German voice roleplay).',
    aiBreakdown: {
      openaiGpt4oMini: 0.94,
      elevenLabsTts: 1.35,
      whisperStt: 0.55,
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
  },
  {
    id: 'alert-ai-02',
    type: 'token_anomaly',
    userId: 'usr-1048',
    userEmail: 'elena.rodriguez@example.com',
    userName: 'Elena Rodriguez',
    thresholdAmount: 1.50,
    actualAmount: 1.92,
    severity: 'warning',
    status: 'acknowledged',
    message: 'Rapid burst: 18 CEFR writing submissions evaluated within 1 hour.',
    aiBreakdown: {
      openaiGpt4oMini: 1.62,
      elevenLabsTts: 0.00,
      whisperStt: 0.30,
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 380).toISOString(),
  },
];

/* ─── Engine APIs ────────────────────────────────────────────────────────── */

export function getAIThresholdConfig() {
  return currentAIThresholdConfig;
}

export function updateAIThresholdConfig(updates: Partial<typeof currentAIThresholdConfig>) {
  currentAIThresholdConfig = {
    ...currentAIThresholdConfig,
    ...updates,
  };
  return currentAIThresholdConfig;
}

export function getAISpendAlerts(statusFilter?: AISpendAlert['status']): AISpendAlert[] {
  if (statusFilter) {
    return activeAlertsStore.filter((a) => a.status === statusFilter);
  }
  return activeAlertsStore;
}

export function acknowledgeAlert(alertId: string): AISpendAlert | null {
  const alert = activeAlertsStore.find((a) => a.id === alertId);
  if (alert) {
    alert.status = 'acknowledged';
  }
  return alert || null;
}

export function checkUserAISpend(
  userId: string,
  userEmail: string,
  userName: string,
  spend: { gpt4o: number; elevenLabs: number; whisper: number }
): AISpendAlert | null {
  const total = Number((spend.gpt4o + spend.elevenLabs + spend.whisper).toFixed(2));
  const threshold = currentAIThresholdConfig.maxSpendPerUserMonthly;

  if (total > threshold) {
    const existing = activeAlertsStore.find(
      (a) => a.userId === userId && a.status === 'active'
    );
    if (existing) {
      existing.actualAmount = total;
      existing.aiBreakdown = {
        openaiGpt4oMini: spend.gpt4o,
        elevenLabsTts: spend.elevenLabs,
        whisperStt: spend.whisper,
      };
      return existing;
    }

    const newAlert: AISpendAlert = {
      id: `alert-ai-${Date.now()}`,
      type: 'user_threshold_exceeded',
      userId,
      userEmail,
      userName,
      thresholdAmount: threshold,
      actualAmount: total,
      severity: total > threshold * 2 ? 'critical' : 'warning',
      status: 'active',
      message: `User exceeded $${threshold.toFixed(2)}/mo AI compute ceiling ($${total.toFixed(2)} accumulated).`,
      aiBreakdown: {
        openaiGpt4oMini: spend.gpt4o,
        elevenLabsTts: spend.elevenLabs,
        whisperStt: spend.whisper,
      },
      timestamp: new Date().toISOString(),
    };

    activeAlertsStore = [newAlert, ...activeAlertsStore];
    return newAlert;
  }

  return null;
}
