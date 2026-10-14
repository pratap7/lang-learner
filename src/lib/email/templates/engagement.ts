import { emailStyles } from "../styles.ts";
import { wrapInBaseEmailLayout, wrapInBasePlainText } from "../baseTemplate.ts";
import type {
  EmailRenderResult,
  WeeklyProgressData,
  StreakAtRiskData,
  MilestoneCongratulationsData,
} from "../types.ts";

/**
 * 9. Weekly Progress Report Email
 */
export function renderWeeklyProgressEmail(data: WeeklyProgressData): EmailRenderResult {
  const subject = `Your Deutsch Pfad weekly report: ${data.xpEarned} XP earned! 📈`;
  const preheader = `Review your German study highlights for ${data.weekDateRange}.`;

  const topWordsList = data.topWordsLearned.length
    ? data.topWordsLearned
        .map(
          (w) =>
            `<li style="margin-bottom: 6px; font-size: 14px; color: #1e293b;">
              <strong>${w.article ? `<span style="color: #2563eb;">${w.article}</span> ` : ""}${w.german}</strong> &mdash; <span style="color: #64748b;">${w.english}</span>
            </li>`
        )
        .join("")
    : `<li style="font-size: 14px; color: #64748b;">No new words recorded this week.</li>`;

  const htmlContent = `
    <h1 style="${emailStyles.h1}">Your Weekly German Progress</h1>
    <p style="${emailStyles.p}">
      Hallo ${data.recipientName}, here is how your German journey shaped up this past week (<strong>${data.weekDateRange}</strong>). Every minute invested brings you closer to your fluency goal!
    </p>

    <!-- Key Metrics 2x2 Grid -->
    <div style="margin: 24px 0;">
      <table style="width: 100%; border-collapse: separate; border-spacing: 12px 12px;">
        <tr>
          <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; width: 50%;">
            <div style="font-size: 26px; font-weight: 800; color: #2563eb;">${data.xpEarned}</div>
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 4px;">XP Earned</div>
          </td>
          <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; width: 50%;">
            <div style="font-size: 26px; font-weight: 800; color: #0f172a;">${data.studyMinutes}m</div>
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 4px;">Study Time</div>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; width: 50%;">
            <div style="font-size: 26px; font-weight: 800; color: #f59e0b;">${data.currentStreak} 🔥</div>
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 4px;">Current Streak</div>
          </td>
          <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; width: 50%;">
            <div style="font-size: 26px; font-weight: 800; color: #10b981;">${data.accuracyPercentage}%</div>
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 4px;">Accuracy</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Top Vocabulary Mastered -->
    <div style="${emailStyles.calloutBox}">
      <p style="margin: 0 0 10px 0; font-size: 15px; font-weight: 700; color: #0f172a;">
        Top Vocabulary Words Practiced This Week:
      </p>
      <ul style="margin: 0; padding-left: 20px;">
        ${topWordsList}
      </ul>
    </div>

    <!-- Recommended Next Step -->
    <div style="${emailStyles.calloutSuccess}">
      <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #065f46; letter-spacing: 0.5px;">
        Recommended Next Step:
      </p>
      <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 800; color: #047857;">
        ${data.recommendedNextLesson.title} (${data.recommendedNextLesson.cefrLevel})
      </p>
      <a href="${data.recommendedNextLesson.actionUrl}" target="_blank" style="${emailStyles.btnPrimary}">
        Jump In (5 mins) &rarr;
      </a>
    </div>
  `;

  const topWordsText = data.topWordsLearned.length
    ? data.topWordsLearned
        .map((w) => `• ${w.article ? `${w.article} ` : ""}${w.german} — ${w.english}`)
        .join("\n")
    : "• No new words recorded this week.";

  const textContent = `
Your Weekly German Progress (${data.weekDateRange})

Hallo ${data.recipientName}, here is how your German journey shaped up this past week:

WEEKLY METRICS:
- XP Earned: ${data.xpEarned}
- Total Study Time: ${data.studyMinutes} minutes
- Active Daily Streak: ${data.currentStreak} days
- Overall Accuracy: ${data.accuracyPercentage}%

TOP VOCABULARY PRACTICED:
${topWordsText}

RECOMMENDED NEXT LESSON:
${data.recommendedNextLesson.title} (${data.recommendedNextLesson.cefrLevel})
Start Lesson: ${data.recommendedNextLesson.actionUrl}
`;

  return {
    templateId: "weekly_progress",
    subject,
    preheader,
    html: wrapInBaseEmailLayout({ preheader, contentHtml: htmlContent, context: data, showUnsubscribe: true }),
    text: wrapInBasePlainText(textContent, data, true),
  };
}

/**
 * 10. Streak-at-Risk Reminder Email (Warm, supportive, NEVER guilt-based)
 */
export function renderStreakAtRiskEmail(data: StreakAtRiskData): EmailRenderResult {
  const subject = `Keep your ${data.currentStreak}-day German streak going! ⏱️`;
  const preheader = `A quick 3-minute review today keeps your learning momentum alive.`;

  const htmlContent = `
    <h1 style="${emailStyles.h1}">Keep Your Momentum Going, ${data.recipientName}</h1>
    <p style="${emailStyles.p}">
      Life gets full of competing priorities, and that is completely natural. We're sending a friendly note to let you know that your <strong>${data.currentStreak}-day German study streak</strong> is about to expire at midnight.
    </p>

    <div style="${emailStyles.calloutBox}">
      <table style="width: 100%;">
        <tr>
          <td style="vertical-align: middle; width: 48px;">
            <div style="font-size: 32px;">🔥</div>
          </td>
          <td style="vertical-align: middle; padding-left: 12px;">
            <div style="font-size: 16px; font-weight: 800; color: #0f172a;">
              ${data.currentStreak} Days of Consecutive Learning
            </div>
            <div style="font-size: 13px; color: #64748b; margin-top: 2px;">
              ${
                data.streakFreezeAvailable
                  ? "Streak Freeze is active as a backup, but a quick drill locks in today's XP!"
                  : "Just a 3-minute vocabulary review secures your streak for today."
              }
            </div>
          </td>
        </tr>
      </table>
    </div>

    <p style="${emailStyles.p}">
      You don't need a heavy grammar session—just a fast flashcard review or a single dialogue exercise is all it takes.
    </p>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${data.quickPracticeUrl}" target="_blank" style="${emailStyles.btnPrimary}">
        Do Quick 3-Min Practice &rarr;
      </a>
    </div>

    <p style="${emailStyles.pMuted}">
      Remember: whatever happens, every word you've learned is already yours. We're cheering you on!
    </p>
  `;

  const textContent = `
Keep Your Momentum Going — ${data.currentStreak}-Day Streak

Hallo ${data.recipientName},

Life gets busy, and that is completely natural! A friendly reminder that your ${data.currentStreak}-day German study streak is at risk of expiring at midnight.

${
  data.streakFreezeAvailable
    ? "Streak Freeze is active as a backup, but doing a quick drill keeps your momentum alive!"
    : "Just a 3-minute vocabulary review secures your streak."
}

Do a quick 3-minute practice:
${data.quickPracticeUrl}

Every word you've learned is already yours. We're cheering you on!
`;

  return {
    templateId: "streak_at_risk",
    subject,
    preheader,
    html: wrapInBaseEmailLayout({ preheader, contentHtml: htmlContent, context: data, showUnsubscribe: true }),
    text: wrapInBasePlainText(textContent, data, true),
  };
}

/**
 * 11. Milestone / Level-Up Congratulations Email
 */
export function renderMilestoneCongratulationsEmail(
  data: MilestoneCongratulationsData
): EmailRenderResult {
  const subject = `Herzlichen Glückwunsch! Milestone Unlocked: ${data.milestoneTitle} 🎉`;
  const preheader = `You've achieved a significant breakthrough in your German learning path.`;

  const htmlContent = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="display: inline-block; font-size: 48px; line-height: 1;">🏆</span>
    </div>

    <h1 style="${emailStyles.h1}; text-align: center;">
      Herzlichen Glückwunsch!
    </h1>

    <p style="${emailStyles.p}; text-align: center; font-size: 16px; color: #2563eb; font-weight: 700;">
      ${data.milestoneTitle}
    </p>

    <p style="${emailStyles.p}">
      Hallo ${data.recipientName}, consistency is the secret to mastering German, and today your dedication paid off. You have officially unlocked the <strong>${data.milestoneBadgeName}</strong> achievement!
    </p>

    <div style="${emailStyles.calloutSuccess}">
      <table style="width: 100%;">
        <tr>
          <td style="text-align: center; padding: 10px;">
            <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #065f46; letter-spacing: 0.5px;">
              Milestone Reached
            </div>
            <div style="font-size: 22px; font-weight: 800; color: #047857; margin: 4px 0 8px 0;">
              ${data.milestoneMetric}
            </div>
            <p style="margin: 0; font-size: 14px; color: #065f46; line-height: 1.5;">
              ${data.celebrationNote}
            </p>
          </td>
        </tr>
      </table>
    </div>

    <p style="${emailStyles.p}">
      Take a moment to celebrate this achievement. When you're ready, the next unit on your German roadmap is unlocked and ready for you.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.continueUrl}" target="_blank" style="${emailStyles.btnPrimary}">
        Continue Your German Path &rarr;
      </a>
      ${
        data.shareUrl
          ? `<div style="margin-top: 14px;">
              <a href="${data.shareUrl}" target="_blank" style="${emailStyles.btnSecondary}">
                Share Achievement Card
              </a>
            </div>`
          : ""
      }
    </div>
  `;

  const textContent = `
Herzlichen Glückwunsch! Milestone Unlocked 🎉

Milestone: ${data.milestoneTitle}
Achievement Badge: ${data.milestoneBadgeName}
Milestone Stat: ${data.milestoneMetric}

Hallo ${data.recipientName}, consistency is the secret to mastering German, and today your dedication paid off!

${data.celebrationNote}

Continue to your next unit:
${data.continueUrl}
`;

  return {
    templateId: "milestone_congratulations",
    subject,
    preheader,
    html: wrapInBaseEmailLayout({ preheader, contentHtml: htmlContent, context: data, showUnsubscribe: true }),
    text: wrapInBasePlainText(textContent, data, true),
  };
}
