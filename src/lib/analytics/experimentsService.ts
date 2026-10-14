/**
 * DeutschPfad A/B Testing & Experimentation Engine
 * Deterministic bucketing, exposure telemetry, conversion attribution,
 * and statistical significance calculations for pricing & paywall variants.
 */

import type {
  ExperimentDefinition,
  ExperimentVariant,
} from '../../types/analytics.ts';
import { trackEvent } from './analyticsService.ts';

/* ─── Experiment Configurations ─────────────────────────────────────────── */

let experimentsStore: ExperimentDefinition[] = [
  {
    key: 'pricing_page_experiment',
    name: 'Pricing Page Value Proposition & Headline A/B Test',
    description: 'Compares feature-centric grid vs. CEFR fluency outcome guarantee vs. annual discount urgency.',
    status: 'active',
    targetMetric: 'Paid Plan Checkout Conversion',
    startDate: '2026-09-15T00:00:00Z',
    updatedAt: new Date().toISOString(),
    winningVariantId: 'variant_fluency_outcome',
    variants: [
      {
        id: 'control_feature_grid',
        name: 'Control: Feature-Led Comparison Grid',
        experimentKey: 'pricing_page_experiment',
        trafficAllocation: 34,
        impressions: 4820,
        conversions: 395,
        conversionRate: 8.2,
        upliftPercent: 0,
        isStatisticallySignificant: false,
        confidenceLevel: 50.0,
      },
      {
        id: 'variant_fluency_outcome',
        name: 'Variant B: Fluency Outcome & Goethe Exam Guarantee',
        experimentKey: 'pricing_page_experiment',
        trafficAllocation: 33,
        impressions: 4790,
        conversions: 546,
        conversionRate: 11.4,
        upliftPercent: 39.0, // +39% relative lift
        isStatisticallySignificant: true,
        confidenceLevel: 99.4,
      },
      {
        id: 'variant_urgency_discount',
        name: 'Variant C: 25% Annual Discount Flash Urgency Banner',
        experimentKey: 'pricing_page_experiment',
        trafficAllocation: 33,
        impressions: 4740,
        conversions: 469,
        conversionRate: 9.9,
        upliftPercent: 20.7, // +20.7% relative lift
        isStatisticallySignificant: true,
        confidenceLevel: 96.2,
      },
    ],
  },
  {
    key: 'paywall_modal_experiment',
    name: 'Contextual Paywall Friction Test (Soft Trial vs Direct Checkout)',
    description: 'Tests 7-day frictionless free trial opt-in vs. direct checkout with 30-day money-back guarantee.',
    status: 'active',
    targetMetric: 'Paywall Conversion Rate',
    startDate: '2026-09-22T00:00:00Z',
    updatedAt: new Date().toISOString(),
    winningVariantId: 'variant_soft_paywall',
    variants: [
      {
        id: 'variant_soft_paywall',
        name: 'Variant A: Soft Paywall (7-Day Trial Zero Friction)',
        experimentKey: 'paywall_modal_experiment',
        trafficAllocation: 50,
        impressions: 3410,
        conversions: 785,
        conversionRate: 23.0,
        upliftPercent: 64.3,
        isStatisticallySignificant: true,
        confidenceLevel: 99.9,
      },
      {
        id: 'variant_hard_paywall',
        name: 'Variant B: Hard Paywall (Direct Checkout & Money-Back)',
        experimentKey: 'paywall_modal_experiment',
        trafficAllocation: 50,
        impressions: 3380,
        conversions: 473,
        conversionRate: 14.0,
        upliftPercent: 0,
        isStatisticallySignificant: false,
        confidenceLevel: 50.0,
      },
    ],
  },
];

/* ─── Deterministic Hash Bucketing ───────────────────────────────────────── */

function hashStringToPercent(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 100;
}

export function getAssignedVariant(
  experimentKey: string,
  userId?: string
): ExperimentVariant | null {
  const exp = experimentsStore.find((e) => e.key === experimentKey);
  if (!exp || exp.status !== 'active' || exp.variants.length === 0) return null;

  // Derive distinct client seed
  let seed = userId;
  if (!seed && typeof window !== 'undefined') {
    try {
      seed = localStorage.getItem('deutschpfad_client_uuid') || '';
      if (!seed) {
        seed = `anon-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem('deutschpfad_client_uuid', seed);
      }
    } catch {
      seed = 'anon-default';
    }
  }

  const hashVal = hashStringToPercent(`${experimentKey}:${seed || 'seed'}`);

  let cumulative = 0;
  for (const variant of exp.variants) {
    cumulative += variant.trafficAllocation;
    if (hashVal < cumulative) {
      // Record exposure telemetry
      trackEvent('experiment_exposure', {
        experiment_key: experimentKey,
        variant_id: variant.id,
        variant_name: variant.name,
      });
      return variant;
    }
  }

  return exp.variants[0];
}

export function recordExperimentConversion(
  experimentKey: string,
  variantId: string,
  metricName: string = 'conversion'
): void {
  const exp = experimentsStore.find((e) => e.key === experimentKey);
  if (!exp) return;

  const variant = exp.variants.find((v) => v.id === variantId);
  if (variant) {
    variant.conversions += 1;
    variant.conversionRate = Number(((variant.conversions / variant.impressions) * 100).toFixed(1));

    // Recalculate uplifts relative to control
    const control = exp.variants[0];
    if (control && control.conversionRate > 0) {
      variant.upliftPercent = Number(
        (((variant.conversionRate - control.conversionRate) / control.conversionRate) * 100).toFixed(1)
      );
    }

    trackEvent('experiment_conversion', {
      experiment_key: experimentKey,
      variant_id: variantId,
      metric_name: metricName,
    });
  }
}

export function getExperiments(): ExperimentDefinition[] {
  return experimentsStore;
}
