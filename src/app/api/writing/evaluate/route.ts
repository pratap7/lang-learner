import { NextRequest, NextResponse } from "next/server";
import { getWritingTaskById } from "@/lib/writingTasks";
import { evaluateWritingSubmissionHeuristic, WritingEvaluationResult } from "@/lib/writingEvaluationService";

interface EvaluateRequestBody {
  taskId: string;
  userText: string;
  userId?: string;
  userPlan?: "free" | "pro" | "unlimited";
  submissionsUsed?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EvaluateRequestBody;
    const {
      taskId,
      userText,
      userId = "anonymous",
      userPlan = "free",
      submissionsUsed = 0,
    } = body;

    if (!taskId || !userText || userText.trim().length === 0) {
      return NextResponse.json(
        { error: "INVALID_REQUEST", message: "Task ID and written text are required." },
        { status: 400 }
      );
    }

    const task = getWritingTaskById(taskId);
    if (!task) {
      return NextResponse.json(
        { error: "TASK_NOT_FOUND", message: `Writing task with ID '${taskId}' was not found.` },
        { status: 404 }
      );
    }

    // 1. Monthly submission limit check per plan (Free: 5, Pro: 30, Unlimited: 150)
    const planCap = userPlan === "unlimited" ? 150 : userPlan === "pro" ? 30 : 5;
    if (submissionsUsed >= planCap) {
      return NextResponse.json(
        {
          error: "MONTHLY_LIMIT_REACHED",
          message: `You have reached your monthly limit of ${planCap} written essay evaluations on the ${userPlan.toUpperCase()} tier.`,
          planCap,
          submissionsUsed,
        },
        { status: 429 }
      );
    }

    // 2. Check for OpenAI API key server-side (never exposed to client)
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey) {
      try {
        const systemPrompt = `You are an expert certified Goethe-Institut German language examiner.
Evaluate the student's German writing submission according to the CEFR standard rubric for level ${task.level}.
Task Type: ${task.type} (${task.titleDe})
Required Bullet Points:
${task.bulletPoints.map((bp) => `- ${bp}`).join("\n")}

Respond strictly in valid JSON matching this schema:
{
  "taskCompletionScore": number (0-5),
  "taskCompletionFeedback": string in English,
  "grammarScore": number (0-5),
  "grammarFeedback": string in English,
  "vocabularyScore": number (0-5),
  "vocabularyFeedback": string in English,
  "coherenceScore": number (0-5),
  "coherenceFeedback": string in English,
  "correctedText": string (the complete text with all grammar, spelling, and register mistakes corrected),
  "errors": [
    {
      "id": string,
      "originalSnippet": string,
      "correctedSnippet": string,
      "grammarTopic": string,
      "explanation": string in English,
      "severity": "critical" | "moderate" | "minor"
    }
  ],
  "suggestions": [
    string (suggestion 1 in English with concrete German examples),
    string (suggestion 2 in English),
    string (suggestion 3 in English)
  ]
}`;

        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.2,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Student Submission:\n${userText}` },
            ],
          }),
        });

        if (openAiRes.ok) {
          const aiJson = await openAiRes.json();
          const parsed = JSON.parse(aiJson.choices[0].message.content);

          const totalScore =
            Number(parsed.taskCompletionScore || 3) +
            Number(parsed.grammarScore || 3) +
            Number(parsed.vocabularyScore || 3) +
            Number(parsed.coherenceScore || 3);

          const { generateWordDiff } = await import("@/lib/writingEvaluationService");

          const result: WritingEvaluationResult = {
            rubric: {
              taskCompletion: {
                score: parsed.taskCompletionScore || 4,
                maxScore: 5,
                title: "Task Completion",
                description: "Coverage of prompt bullet points, register appropriateness, and required details.",
                feedback: parsed.taskCompletionFeedback || "Good task completion.",
              },
              grammar: {
                score: parsed.grammarScore || 4,
                maxScore: 5,
                title: "Grammatical Accuracy",
                description: "Verb conjugation, word order in main/subordinate clauses, and case endings.",
                feedback: parsed.grammarFeedback || "Grammar evaluated accurately.",
              },
              vocabulary: {
                score: parsed.vocabularyScore || 4,
                maxScore: 5,
                title: "Vocabulary & Range",
                description: "Lexical diversity, situational collocations, and idiomatic German expressions.",
                feedback: parsed.vocabularyFeedback || "Appropriate vocabulary used.",
              },
              coherence: {
                score: parsed.coherenceScore || 4,
                maxScore: 5,
                title: "Coherence & Structure",
                description: "Logical paragraphing, linking words (weil, obwohl, deshalb), and standard formatting.",
                feedback: parsed.coherenceFeedback || "Logical flow and structure.",
              },
            },
            totalScore,
            percentage: Math.round((totalScore / 20) * 100),
            cefrRating: task.level,
            originalText: userText,
            correctedText: parsed.correctedText || userText,
            diffSegments: generateWordDiff(userText, parsed.correctedText || userText),
            errors: parsed.errors || [],
            suggestions: [
              parsed.suggestions?.[0] || "Practice subordinate clause verb placement with 'weil' and 'dass'.",
              parsed.suggestions?.[1] || "Ensure consistent formal register ('Sie' / 'Ihnen') in official letters.",
              parsed.suggestions?.[2] || "Vary sentence starters using time expressions (z.B. 'Zunächst', 'Schließlich').",
            ],
            wordCount: userText.split(/\s+/).filter(Boolean).length,
            minWordsTarget: task.minWords,
            maxWordsTarget: task.maxWords,
            isWordCountMet: userText.split(/\s+/).filter(Boolean).length >= task.minWords,
          };

          return NextResponse.json(result);
        }
      } catch (err) {
        console.warn("[Writing API] OpenAI request failed, using intelligent heuristic fallback:", err);
      }
    }

    // 3. High-precision rule-based fallback evaluation engine
    const heuristicResult = evaluateWritingSubmissionHeuristic(task, userText);
    return NextResponse.json(heuristicResult);
  } catch (error) {
    console.error("[Writing API Error]:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to evaluate writing submission." },
      { status: 500 }
    );
  }
}
