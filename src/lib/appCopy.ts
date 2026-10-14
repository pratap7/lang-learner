/**
 * Deutsch Pfad — Central Application Copy & Tone Guide
 * 
 * Tone Principles:
 * 1. Encouraging: Builds confidence, recognizes genuine effort, framing challenges as milestones.
 * 2. Precise: Explains the exact grammatical rule, CEFR level, or action needed.
 * 3. Never Childish: No cartoon baby-talk, talking mascots crying, or condescending game tropes.
 * 4. Never Condescending: Respects adult intellect, professional careers, and immigrant journeys.
 * 5. Never Shame-Based: Streaks are treated as momentum trackers, never guilt weapons.
 * 6. Actionable Errors: Every error message states WHAT happened and HOW to fix it.
 * 7. Zero Jargon: Avoids internal developer or algorithmic terms in user-facing copy.
 * 
 * All user-facing strings are structured here for maintainability and i18n localization.
 */

export const appCopy = {
  // ─── BUTTONS & INTERACTIVE CALLS TO ACTION ─────────────────────────────────
  buttons: {
    startFree: "Start Learning Free",
    startDiagnostic: "Start Diagnostic Exam (10 min)",
    continueLesson: "Continue Lesson",
    checkAnswer: "Check Answer",
    continueEnter: "Continue (Enter ↵)",
    tryAgain: "Try Again",
    reviewMistakes: "Review Identified Weak Spots",
    reviewDueCards: (count: number) => `Review ${count} Due Cards`,
    saveChanges: "Save Changes",
    saving: "Saving...",
    cancel: "Cancel",
    confirm: "Confirm",
    pauseSubscription: "Pause for 1 Month (Free)",
    startTrial: "Start 7-Day Free Trial",
    submitWriting: "Submit for Evaluation",
    evaluating: "Evaluating Rubric...",
    clearText: "Clear text",
    copyCorrected: "Copy corrected German text",
    resetFilters: "Reset all filters",
    exploreCurriculum: "Explore Curriculum (A1–C2)",
    completeDailyGoal: "Complete Today's Goal",
    dismiss: "Dismiss",
    retryMissed: (count: number) => `Retry ${count} Missed Questions Now`,
    practiceAgain: "Practice Session Again",
    continueRoadmap: "Continue German Roadmap",
  },

  // ─── EMPTY STATES ──────────────────────────────────────────────────────────
  emptyStates: {
    mistakes: {
      title: "Your Mistake Notebook is clear",
      description:
        "When you encounter tricky grammar points, case endings, or word order rules during practice, they will appear here automatically for focused review.",
      action: "Practice a Lesson",
    },
    tests: {
      title: "No completed exams yet",
      description:
        "Take an adaptive placement diagnostic or timed mock test to establish your benchmark CEFR score and track your exam readiness.",
      action: "Take Placement Diagnostic",
    },
    stories: {
      title: "No stories match your current filters",
      description:
        "Try clearing your search keyword or switching CEFR levels to explore our library of graded bilingual German readers.",
      action: "Reset Filters",
    },
    flashcards: {
      title: "No flashcards due right now",
      description:
        "You are completely caught up! The spaced repetition scheduler will surface your next review batch when your memory curve requires reinforcement.",
      action: "Explore New Deck",
    },
    conversations: {
      title: "No active conversation dialogue",
      description:
        "Select an authentic scenario (at the Bürgeramt, café, or workplace) to begin your interactive dialogue practice.",
      action: "Start Scenario Dialogue",
    },
    bookmarks: {
      title: "No saved lessons yet",
      description:
        "Bookmark complex grammar modules or cultural readings while studying to revisit them whenever you need a quick refresher.",
      action: "Browse Curriculum",
    },
  },

  // ─── ERROR MESSAGES (WHAT HAPPENED & HOW TO FIX IT) ─────────────────────────
  errors: {
    network: {
      title: "Connection Interrupted",
      message:
        "We could not reach the Deutsch Pfad server. Your recent progress is safely stored in your browser. Please check your internet connection and try again.",
      action: "Retry Request",
    },
    audioPlayback: {
      title: "Audio Could Not Play",
      message:
        "We were unable to play the native pronunciation audio. Please ensure your device volume is turned up and tap the speaker icon again.",
      action: "Retry Audio",
    },
    writingTooShort: (current: number, target: number) => ({
      title: "Draft Is Under Minimum Length",
      message: `Your draft contains ${current} words (minimum ${target} words required). Please add another sentence or two so our examiner engine can evaluate your sentence structure, connectors, and vocabulary.`,
    }),
    writingEvaluationFailed: {
      title: "Evaluation Could Not Complete",
      message:
        "The rubric scoring service encountered a temporary error. Your written text has been preserved—please tap 'Submit for Evaluation' again in a moment.",
      action: "Resubmit Text",
    },
    aiCapReached: {
      title: "Monthly Practice Limit Reached",
      message:
        "You have completed your complimentary monthly AI conversation minutes. Upgrade to Deutsch Pfad Pro for 150 monthly voice minutes and real-time pronunciation analysis, or wait until your free balance resets on the first of the month.",
      action: "View Pro Plans",
    },
    xpInsufficient: (cost: number, current: number) => ({
      title: "More XP Needed",
      message: `Equipping this Streak Shield requires ${cost} XP (you currently have ${current} XP). Complete another lesson or flashcard session to earn the remaining ${cost - current} XP.`,
    }),
    genericSaveFailed: {
      title: "Changes Could Not Be Saved",
      message:
        "Your recent edits could not be saved to your profile. Please check your connection and tap Save again.",
      action: "Try Saving Again",
    },
    authRequiredFields: {
      title: "Required Fields Missing",
      message: "Please enter your email and password to proceed.",
    },
    authPasswordLength: {
      title: "Password Too Short",
      message: "Your password must be at least 6 characters long to protect your account.",
    },
  },

  // ─── SUCCESS MESSAGES ──────────────────────────────────────────────────────
  success: {
    lessonComplete: (xp: number) => ({
      title: "Lesson Completed Successfully!",
      message: `You earned +${xp} XP. Your daily learning momentum has been updated.`,
    }),
    testPassed: (score: number, level: string) => ({
      title: "Exam Passed With Honors!",
      message: `You scored ${score}% and demonstrated strong proficiency at the ${level.toUpperCase()} level.`,
    }),
    goalsSaved: (level: string, minutes: number) => ({
      title: "Learning Target Saved",
      message: `Your study plan has been updated to ${level.toUpperCase()} at a ${minutes}-minute daily pace.`,
    }),
    mistakeCorrected: {
      title: "Concept Mastered",
      message: "You correctly applied this grammar rule in review. Your weak-topic profile has been updated.",
    },
    streakShieldEquipped: {
      title: "Streak Shield Active",
      message: "Your daily study momentum is protected against unexpected schedule interruptions.",
    },
    subscriptionActivated: {
      title: "Welcome to Deutsch Pfad Pro!",
      message: "Your 7-day free trial is now active. All CEFR levels, mock exams, and unlimited writing rubrics are unlocked.",
    },
  },

  // ─── ONBOARDING & LEVEL CALIBRATION ────────────────────────────────────────
  onboarding: {
    welcome: {
      headline: "Welcome to Deutsch Pfad",
      subheadline:
        "A structured, clinical path to German fluency for English-speaking professionals, students, and immigrants.",
    },
    stepReason: {
      badge: "Your Motivation",
      title: "Why are you learning German?",
      subtitle: "We will tailor your dialogue scenarios and vocabulary decks to your specific goal.",
    },
    stepLevel: {
      badge: "Baseline Assessment",
      title: "Where are you starting from?",
      subtitle:
        "Whether you are starting from zero or returning after years away, we will calibrate your curriculum to avoid wasted study time.",
    },
    stepCommitment: {
      badge: "Target & Commitment",
      title: "Set your target level & pace",
      subtitle:
        "Consistent daily practice builds deeper retention than occasional cramming sessions.",
    },
    generatingPlan: {
      headline: "Generating Your Personalized German Pathway",
      speechBubble: {
        de: "Ich berechne deine optimale Lernroute...",
        en: "Calculating your optimal study route...",
      },
      calibratingBaseline: (level: string) => `Calibrating ${level.toUpperCase()} entry baseline`,
      structuringSessions: (minutes: number) => `Structuring daily ${minutes}-min micro-sessions`,
      projectingTimeline: (target: string) => `Projecting target ${target.toUpperCase()} exam timeline`,
    },
    curriculumPlanReady: {
      badge: "Plan Generated",
      title: "Your Personalized Learning Roadmap",
      subtitle:
        "Based on your target and daily pace, here is your estimated timeline to reach certified proficiency.",
      primaryAction: "Start Learning Now",
    },
  },

  // ─── EXERCISE FEEDBACK & GRAMMATICAL REASONING ──────────────────────────────
  exerciseFeedback: {
    correctHeader: "Ausgezeichnet! (Correct)",
    correctPraise: [
      "Ausgezeichnet! You applied the correct case ending here.",
      "Sehr gut! You correctly identified the grammatical structure.",
      "Perfekt! That matches authentic High German usage.",
      "Genau! You handled that sentence structure accurately.",
    ],
    incorrectHeader: "Not quite — here is the underlying rule:",
    defaultIncorrect: (explanation?: string) =>
      explanation
        ? `Not quite. ${explanation}`
        : "Not quite — review the grammatical structure above and try again.",
    grammarRules: {
      dativeAfterPreposition: (preposition: string, noun: string, correctArticle: string) =>
        `Not quite. '${correctArticle}' is used after '${preposition}' because '${preposition}' always takes the dative. Therefore, '${noun}' takes '${correctArticle}'.`,
      dativePrepositionBrief: (prep: string, correctArticle: string) =>
        `Not quite. '${correctArticle}' is used after '${prep}' because it takes the dative.`,
      accusativeDirectObject: (noun: string, correctArticle: string) =>
        `Not quite. In this clause, '${noun}' is the direct object receiving the action. Masculine nouns in the accusative shift from 'der' to '${correctArticle}'.`,
      subordinateClauseVerbKick: (conjunction: string) =>
        `Not quite. The subordinating conjunction '${conjunction}' forces the conjugated verb to the very end of the subordinate clause.`,
      inversionAfterAdverb: (adverb: string) =>
        `Not quite. Because the sentence begins with '${adverb}', the verb must come next in the second position (V2 rule).`,
      twoWayPrepositionLocation: (prep: string) =>
        `Not quite. The two-way preposition '${prep}' indicates a stationary location ('Wo?'), which requires the dative case.`,
      twoWayPrepositionDirection: (prep: string) =>
        `Not quite. The two-way preposition '${prep}' indicates movement toward a destination ('Wohin?'), which requires the accusative case.`,
    },
  },

  // ─── STREAK & MOMENTUM MESSAGING (ZERO SHAME, SUPPORTIVE) ───────────────────
  streak: {
    activeReminder: (days: number, hoursLeft: number) => ({
      headline: `You are on a ${days}-day learning streak`,
      message: `A quick 5-minute review session today will keep your momentum strong (~${hoursLeft}h remaining today).`,
      action: "Complete Today's Goal",
    }),
    freezeUsed: {
      headline: "Streak Shield Activated",
      message:
        "Life gets busy. Your Streak Shield was applied automatically yesterday, keeping your study count safe.",
    },
    resetEncouragement: {
      headline: "Ready for your next learning cycle?",
      message:
        "Taking breaks is a natural part of language acquisition. Jump into a quick review session today to start fresh.",
      action: "Start New Session",
    },
    freezeStatusEquipped: "Shield Equipped · Active Protection",
    freezeStatusInventory: "Shield in Inventory",
  },

  // ─── NOTIFICATIONS & MILESTONES ───────────────────────────────────────────
  notifications: {
    dailyReminderTitle: (days: number) => `Your ${days}-day study streak is active`,
    dailyReminderBody: (hoursLeft: number) =>
      `You have approximately ${hoursLeft} hours left today. A 5-minute review session keeps your momentum going.`,
    streakShieldActiveTitle: "Streak Shield Active",
    streakShieldActiveBody:
      "Your daily study momentum is safely protected against unexpected schedule interruptions.",
    cycleRestartTitle: "Ready for your next learning cycle?",
    cycleRestartBody:
      "Taking breaks is a natural part of learning. Jump into a quick review session today to start fresh.",
    milestoneTitle: (days: number) => `${days}-Day Study Milestone Reached!`,
    milestoneBody:
      "You have demonstrated sustained dedication to your German pathway. Consistent daily contact builds lasting neurological fluency.",
  },

  // ─── PAYWALL & VALUE PROPOSITION MESSAGING ─────────────────────────────────
  paywall: {
    aiLimit: {
      badge: "AI Practice Allowance",
      headline: "Keep Practicing Speaking & Writing Without Interruption",
      subtext:
        "You have completed your complimentary monthly AI sessions. Deutsch Pfad Pro unlocks 150 monthly voice minutes, detailed pronunciation coaching, and unlimited Goethe rubric evaluation.",
      action: "Start 7-Day Free Trial",
    },
    mockTest: {
      badge: "Full Examination Simulation",
      headline: "Unlock Complete Examiner Report & Rubric Breakdown",
      subtext:
        "Receive exact 0–20 CEFR competency scores, examiner correction diffs, and estimated Goethe-Zertifikat or telc test readiness with Deutsch Pfad Pro.",
      action: "Unlock Mock Exams",
    },
    lockedCurriculum: {
      badge: "Full CEFR Pathway",
      headline: "Access the Complete A1–C2 Curriculum",
      subtext:
        "Unlock all 24 grammar modules, 2,400+ spaced repetition cards, and graded audio readers tailored to your career or study pathway.",
      action: "Unlock Full Curriculum",
    },
    pauseOffer: {
      headline: "Need to step away for a bit?",
      subtext:
        "You can pause your subscription for 1 to 3 months for free. We will preserve your study progress, hold your review cards in memory, and pause all billing until you return.",
      action: "Pause for 1 Month (Free)",
    },
  },

  // ─── CANCELLATION & WIN-BACK DIALOG ───────────────────────────────────────
  cancellation: {
    title: "Manage Your Subscription",
    subtitle: "Before you cancel, please help us understand why you are stepping away.",
    mascotThought: {
      de: "Wir möchten, dass du dein Ziel erreichst.",
      en: "We want you to reach your goal at your own pace.",
    },
    pauseOption: {
      headline: "Take a Break Instead of Cancelling",
      description:
        "Life gets busy. Pause your subscription for 1 month for free. We will preserve your study progress, hold your review cards in memory, and pause all billing until you return.",
      badge: "1-Month Free Pause",
      summary: "Your account will pause until next month. You can resume anytime with one click.",
      action: "Pause for 1 Month (Free)",
    },
    discountOption: {
      headline: "Continue Learning with 50% Off",
      description:
        "We want you to reach certified German fluency. Claim a 50% discount for the next 3 months and keep full access to AI conversations and Goethe mock exams.",
      badge: "Exclusive 50% Discount",
      summary: "Enjoy all Pro benefits at half the price for the next 90 days.",
      action: "Claim 50% Discount",
    },
    keepSubscription: "Keep My Subscription",
    confirmCancel: "Proceed with Cancellation",
    feedbackPlaceholder: "Tell us what we could improve...",
  },

  // ─── AUTHENTICATION & ONBOARDING PROMPTS ───────────────────────────────────
  auth: {
    loginTitle: "Welcome back",
    loginSubtitle: "Continue where you left off",
    signupTitle: "Create your account",
    signupSubtitle: "Start your journey to German fluency today",
    googleButton: "Continue with Google",
    googleConnecting: "Connecting to Google...",
    dividerText: "or with email",
    fullNameLabel: "Full Name",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    submitLogin: "Sign In",
    submitSignup: "Create Account",
    confirmationSent: "Check your email for a confirmation link to complete registration.",
  },

  // ─── TOAST NOTIFICATIONS ──────────────────────────────────────────────────
  toasts: {
    wordSavedTitle: "Saved to My Words!",
    wordSavedMessage: (word: string) => `"${word}" is now in your spaced repetition review queue.`,
    wordRemovedTitle: "Removed from My Words",
    wordRemovedMessage: (word: string) => `"${word}" was removed from your personal flashcard deck.`,
    lessonSavedTitle: "Lesson Saved",
    lessonSavedMessage: "Lesson added to your study bookmarks.",
    lessonRemovedTitle: "Bookmark Removed",
    lessonRemovedMessage: "Lesson removed from bookmarks.",
    lessonCompleteTitle: "Lesson Completed! 🎉",
    lessonCompleteMessage: (xp: number) => `You earned +${xp} XP! Fantastic progress on your German path.`,
  },
};
