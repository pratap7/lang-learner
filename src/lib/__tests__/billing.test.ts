import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SUBSCRIPTION_PLANS,
  detectUserCurrency,
  formatPrice,
  getPlanDefinition,
  activateSubscription,
  pauseSubscription,
  resumeSubscription,
  applyWinBackOffer,
  cancelSubscription,
  checkUserEntitlement,
  isTrialActive,
  getRemainingTrialDays,
  type UserSubscription,
  type SubscriptionPlanId,
} from "../billingService.ts";

describe("Subscription Plans & Regional Pricing Engine", () => {
  it("should contain Free, Pro, and Pro Plus plans with correct trial configurations", () => {
    const freePlan = getPlanDefinition("free");
    const proPlan = getPlanDefinition("pro");
    const proPlusPlan = getPlanDefinition("pro_plus");

    assert.equal(freePlan.id, "free");
    assert.equal(freePlan.trialDays, 0);

    assert.equal(proPlan.id, "pro");
    assert.equal(proPlan.trialDays, 7, "Pro must include a 7-day free trial");

    assert.equal(proPlusPlan.id, "pro_plus");
    assert.equal(proPlusPlan.trialDays, 7, "Pro Plus must include a 7-day free trial");
  });

  it("should detect currency and route payment provider by country", () => {
    const india = detectUserCurrency("IN");
    assert.equal(india.currency, "INR");
    assert.equal(india.recommendedProvider, "razorpay", "India must route to Razorpay");

    const germany = detectUserCurrency("DE");
    assert.equal(germany.currency, "EUR");
    assert.equal(germany.recommendedProvider, "stripe");

    const uk = detectUserCurrency("GB");
    assert.equal(uk.currency, "GBP");
    assert.equal(uk.recommendedProvider, "stripe");

    const us = detectUserCurrency("US");
    assert.equal(us.currency, "USD");
    assert.equal(us.recommendedProvider, "stripe");
  });

  it("should format regional prices with correct symbols and currency formats", () => {
    assert.equal(formatPrice(14, "USD"), "$14");
    assert.equal(formatPrice(12, "EUR"), "€12");
    assert.equal(formatPrice(11, "GBP"), "£11");
    assert.equal(formatPrice(499, "INR"), "₹499");
  });
});

describe("7-Day Free Trial & Subscription Lifecycle", () => {
  it("should initialize 7-day free trial on paid tier with correct status and dates", () => {
    const sub = activateSubscription({
      userId: "test-learner-1",
      planId: "pro",
      billingCycle: "annual",
      currency: "USD",
      startTrial: true,
    });

    assert.equal(sub.status, "trialing");
    assert.equal(sub.planId, "pro");
    assert.ok(sub.trialStart, "trialStart must exist");
    assert.ok(sub.trialEnd, "trialEnd must exist");
    assert.equal(isTrialActive(sub), true, "Trial must be active");

    const daysLeft = getRemainingTrialDays(sub);
    assert.ok(daysLeft >= 6 && daysLeft <= 7, "Remaining trial days must be ~7");
  });

  it("should correctly gate feature entitlements by plan", () => {
    const freeSub: UserSubscription = {
      id: "sub_free",
      userId: "u1",
      planId: "free",
      status: "active",
      billingCycle: "monthly",
      currency: "USD",
      currentPrice: 0,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date().toISOString(),
      cancelAtPeriodEnd: false,
      isPaused: false,
      provider: "stripe",
      providerSubscriptionId: "sub_0",
      providerCustomerId: "cus_0",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    assert.equal(checkUserEntitlement(freeSub, "mockExamsIncluded"), false);
    assert.equal(checkUserEntitlement(freeSub, "audioOfflineDownloads"), false);
    assert.equal(checkUserEntitlement(freeSub, "aiConversationMinutesPerMonth"), true);

    const proSub: UserSubscription = {
      ...freeSub,
      planId: "pro",
    };

    assert.equal(checkUserEntitlement(proSub, "mockExamsIncluded"), true);
    assert.equal(checkUserEntitlement(proSub, "audioOfflineDownloads"), true);
    assert.equal(checkUserEntitlement(proSub, "tutorFeedback"), false);

    const proPlusSub: UserSubscription = {
      ...freeSub,
      planId: "pro_plus",
    };

    assert.equal(checkUserEntitlement(proPlusSub, "tutorFeedback"), true);
  });

  it("should pause and resume subscription without breaking status", () => {
    const sub = activateSubscription({
      userId: "test-learner-2",
      planId: "pro",
      billingCycle: "monthly",
      currency: "EUR",
      startTrial: false,
    });

    const paused = pauseSubscription(sub, 1);
    assert.equal(paused.status, "paused");
    assert.equal(paused.isPaused, true);
    assert.ok(paused.pauseResumesAt);
    assert.equal(checkUserEntitlement(paused, "mockExamsIncluded"), false, "Paused subs cannot access locked features");

    const resumed = resumeSubscription(paused);
    assert.equal(resumed.status, "active");
    assert.equal(resumed.isPaused, false);
    assert.equal(resumed.pauseResumesAt, undefined);
  });
});

describe("Cancellation Survey & Win-Back Offers", () => {
  it("should apply 50% win-back discount when accepted", () => {
    const sub = activateSubscription({
      userId: "test-learner-3",
      planId: "pro",
      billingCycle: "monthly",
      currency: "USD",
      startTrial: false,
    });

    const initialPrice = sub.currentPrice;
    const { updatedSubscription, survey } = applyWinBackOffer(
      sub,
      "discount_50",
      "price",
      "Found it slightly high on budget"
    );

    assert.equal(updatedSubscription.currentPrice, Math.round(initialPrice * 0.5));
    assert.equal(updatedSubscription.winBackDiscountPercent, 50);
    assert.equal(updatedSubscription.cancelAtPeriodEnd, false);
    assert.equal(survey.winBackAccepted, true);
    assert.equal(survey.winBackOffered, "discount_50");
  });

  it("should schedule cancellation at period end when win-back offer is declined", () => {
    const sub = activateSubscription({
      userId: "test-learner-4",
      planId: "pro",
      billingCycle: "monthly",
      currency: "USD",
      startTrial: false,
    });

    const { updatedSubscription, survey } = cancelSubscription(
      sub,
      "goal_reached",
      "Passed Goethe B1 exam!"
    );

    assert.equal(updatedSubscription.cancelAtPeriodEnd, true);
    assert.equal(survey.winBackAccepted, false);
    assert.equal(survey.reason, "goal_reached");
  });
});
