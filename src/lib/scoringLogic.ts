export type SkillSection = "reading" | "listening" | "grammar" | "vocabulary" | "writing" | "speaking";
export type CefrBand = "A1" | "A2" | "B1" | "B2" | "C1";

export interface AdaptivePlacementState {
  currentQuestionIndex: number;
  totalQuestionsTarget: number;
  currentDifficulty: CefrBand;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  answeredQuestionIds: string[];
  history: {
    questionId: string;
    level: CefrBand;
    isCorrect: boolean;
    userAnswer: number;
  }[];
}

export interface QuizEvaluationResult {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  passMarkPct: number;
  sectionBreakdown: Record<SkillSection, { correct: number; total: number; percentage: number }>;
  weakTopics: { topic: string; missedCount: number; advice: string }[];
}

export const CEFR_ORDER: CefrBand[] = ["A1", "A2", "B1", "B2", "C1"];

export function createInitialPlacementState(totalQuestions: number = 25): AdaptivePlacementState {
  return {
    currentQuestionIndex: 0,
    totalQuestionsTarget: totalQuestions,
    currentDifficulty: "A2", // Calibrated starting point
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    answeredQuestionIds: [],
    history: [],
  };
}

export function processAdaptiveAnswer(
  state: AdaptivePlacementState,
  question: { id: string; level: CefrBand; correctAnswer: number },
  userAnswerIndex: number
): { nextState: AdaptivePlacementState; isCorrect: boolean } {
  const isCorrect = userAnswerIndex === question.correctAnswer;
  const currentIndex = CEFR_ORDER.indexOf(state.currentDifficulty);

  let nextDifficulty = state.currentDifficulty;
  let nextConsecutiveCorrect = isCorrect ? state.consecutiveCorrect + 1 : 0;
  let nextConsecutiveIncorrect = !isCorrect ? state.consecutiveIncorrect + 1 : 0;

  // 2 consecutive correct answers elevate difficulty tier by +1
  if (nextConsecutiveCorrect >= 2 && currentIndex < CEFR_ORDER.length - 1) {
    nextDifficulty = CEFR_ORDER[currentIndex + 1];
    nextConsecutiveCorrect = 0;
  }
  // 2 consecutive wrong answers lower difficulty tier by -1
  else if (nextConsecutiveIncorrect >= 2 && currentIndex > 0) {
    nextDifficulty = CEFR_ORDER[currentIndex - 1];
    nextConsecutiveIncorrect = 0;
  }

  const nextState: AdaptivePlacementState = {
    ...state,
    currentQuestionIndex: state.currentQuestionIndex + 1,
    currentDifficulty: nextDifficulty,
    consecutiveCorrect: nextConsecutiveCorrect,
    consecutiveIncorrect: nextConsecutiveIncorrect,
    answeredQuestionIds: [...state.answeredQuestionIds, question.id],
    history: [
      ...state.history,
      {
        questionId: question.id,
        level: question.level,
        isCorrect,
        userAnswer: userAnswerIndex,
      },
    ],
  };

  return { nextState, isCorrect };
}

export function calculatePlacementResult(state: AdaptivePlacementState): {
  recommendedLevel: CefrBand;
  levelScorePct: Record<CefrBand, number>;
  totalScore: number;
  maxScore: number;
  percentage: number;
  rationale: string;
} {
  const levelCounts: Record<CefrBand, { correct: number; total: number }> = {
    A1: { correct: 0, total: 0 },
    A2: { correct: 0, total: 0 },
    B1: { correct: 0, total: 0 },
    B2: { correct: 0, total: 0 },
    C1: { correct: 0, total: 0 },
  };

  state.history.forEach((h) => {
    if (levelCounts[h.level]) {
      levelCounts[h.level].total++;
      if (h.isCorrect) levelCounts[h.level].correct++;
    }
  });

  const levelScorePct: Record<CefrBand, number> = {
    A1: levelCounts.A1.total > 0 ? Math.round((levelCounts.A1.correct / levelCounts.A1.total) * 100) : 0,
    A2: levelCounts.A2.total > 0 ? Math.round((levelCounts.A2.correct / levelCounts.A2.total) * 100) : 0,
    B1: levelCounts.B1.total > 0 ? Math.round((levelCounts.B1.correct / levelCounts.B1.total) * 100) : 0,
    B2: levelCounts.B2.total > 0 ? Math.round((levelCounts.B2.correct / levelCounts.B2.total) * 100) : 0,
    C1: levelCounts.C1.total > 0 ? Math.round((levelCounts.C1.correct / levelCounts.C1.total) * 100) : 0,
  };

  const totalScore = state.history.filter((h) => h.isCorrect).length;
  const maxScore = state.history.length;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  // Highest CEFR band where learner achieved >= 60-65% mastery
  let recommendedLevel: CefrBand = "A1";
  let rationale = "You have foundational knowledge. A1 is your optimal launchpad.";

  if (levelScorePct.C1 >= 60 && percentage >= 75) {
    recommendedLevel = "C1";
    rationale = "Exceptional advanced grasp of nominal style, indirect speech, and nuanced rhetorical structures.";
  } else if (levelScorePct.B2 >= 65 && percentage >= 65) {
    recommendedLevel = "B2";
    rationale = "Solid upper-intermediate command of participle clauses, fixed verb collocations, and connectors.";
  } else if (levelScorePct.B1 >= 65 && percentage >= 55) {
    recommendedLevel = "B1";
    rationale = "Good working competence with relative clauses, passive voice, and Konjunktiv II polite forms.";
  } else if (levelScorePct.A2 >= 65 && percentage >= 45) {
    recommendedLevel = "A2";
    rationale = "Confident handle on basic Perfekt past tense, modal verbs, and everyday reading notices.";
  }

  return {
    recommendedLevel,
    levelScorePct,
    totalScore,
    maxScore,
    percentage,
    rationale,
  };
}

/**
 * Pure evaluation for unit quizzes and mock test submissions.
 */
export function evaluateQuizSubmission(
  questions: { id: string; section: SkillSection; topic: string; correctAnswer: number; points?: number }[],
  userAnswers: Record<string, number>,
  passMarkPct: number = 70
): QuizEvaluationResult {
  let earnedScore = 0;
  let maxScore = 0;

  const sectionTotals: Record<SkillSection, { correct: number; total: number }> = {
    reading: { correct: 0, total: 0 },
    listening: { correct: 0, total: 0 },
    grammar: { correct: 0, total: 0 },
    vocabulary: { correct: 0, total: 0 },
    writing: { correct: 0, total: 0 },
    speaking: { correct: 0, total: 0 },
  };

  const missedTopicsMap: Record<string, number> = {};

  questions.forEach((q) => {
    const pts = q.points || 1;
    maxScore += pts;
    const isCorrect = userAnswers[q.id] === q.correctAnswer;

    sectionTotals[q.section].total += pts;

    if (isCorrect) {
      earnedScore += pts;
      sectionTotals[q.section].correct += pts;
    } else {
      missedTopicsMap[q.topic] = (missedTopicsMap[q.topic] || 0) + 1;
    }
  });

  const percentage = maxScore > 0 ? Math.round((earnedScore / maxScore) * 100) : 0;
  const passed = percentage >= passMarkPct;

  const sectionBreakdown = Object.fromEntries(
    Object.entries(sectionTotals).map(([sec, val]) => [
      sec,
      {
        correct: val.correct,
        total: val.total,
        percentage: val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0,
      },
    ])
  ) as Record<SkillSection, { correct: number; total: number; percentage: number }>;

  const weakTopics = Object.entries(missedTopicsMap).map(([topic, missedCount]) => ({
    topic,
    missedCount,
    advice: `Review ${topic} drills in your Mistake Notebook to strengthen accuracy.`,
  }));

  return {
    score: earnedScore,
    maxScore,
    percentage,
    passed,
    passMarkPct,
    sectionBreakdown,
    weakTopics,
  };
}
