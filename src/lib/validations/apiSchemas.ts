import { z } from "zod";

export const CefrLevelSchema = z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]);

export const UserPlanSchema = z.enum(["free", "pro", "unlimited"]);

/**
 * Writing Evaluation Request Schema
 * Prevents payload tampering, oversized submissions, and script injection
 */
export const EvaluateWritingSchema = z.object({
  taskId: z
    .string()
    .min(1, "Task ID is required")
    .max(100, "Task ID too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Task ID contains invalid characters"),
  userText: z
    .string()
    .min(3, "Text must be at least 3 characters")
    .max(5000, "Text must not exceed 5,000 characters"),
  userId: z.string().max(128).optional().default("anonymous"),
  userPlan: UserPlanSchema.optional().default("free"),
  submissionsUsed: z.number().int().min(0).max(1000).optional().default(0),
});

export type EvaluateWritingInput = z.infer<typeof EvaluateWritingSchema>;

/**
 * Conversation Message Schema
 */
export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z
    .string()
    .min(1, "Message content cannot be empty")
    .max(1000, "Message content must not exceed 1,000 characters"),
});

/**
 * Conversation Chat Request Schema
 */
export const ConversationChatSchema = z.object({
  scenarioId: z
    .string()
    .min(1, "Scenario ID is required")
    .max(100, "Scenario ID too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Scenario ID contains invalid characters"),
  userLevel: CefrLevelSchema.optional().default("A1"),
  messages: z
    .array(ChatMessageSchema)
    .min(1, "At least one message is required")
    .max(50, "Maximum conversation history is 50 messages"),
  userId: z.string().max(128).optional().default("anonymous"),
  userPlan: UserPlanSchema.optional().default("free"),
  minutesUsed: z.number().min(0).max(10000).optional().default(0),
});

export type ConversationChatInput = z.infer<typeof ConversationChatSchema>;

/**
 * Conversation Report Request Schema
 */
export const ConversationReportSchema = z.object({
  scenarioId: z
    .string()
    .min(1, "Scenario ID is required")
    .max(100, "Scenario ID too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Scenario ID contains invalid characters"),
  userLevel: CefrLevelSchema.optional().default("A1"),
  durationSeconds: z.number().int().min(1).max(7200, "Duration cannot exceed 2 hours"),
  messages: z.array(ChatMessageSchema).max(100),
  userId: z.string().max(128).optional().default("anonymous"),
});

export type ConversationReportInput = z.infer<typeof ConversationReportSchema>;

/**
 * Webhook Event Schema
 */
export const BillingWebhookSchema = z.object({
  event: z.string().max(150).optional(),
  type: z.string().max(150).optional(),
  id: z.string().max(200).optional(),
  created: z.number().optional(),
  data: z.record(z.string(), z.any()).optional(),
  payload: z.record(z.string(), z.any()).optional(),
});

export type BillingWebhookInput = z.infer<typeof BillingWebhookSchema>;

/**
 * User Consent Schema for GDPR Banner
 */
export const UserConsentSchema = z.object({
  consentEssential: z.literal(true), // Essential cookies always required
  consentAnalytics: z.boolean().default(false),
  consentVoiceRetention: z.boolean().default(false),
});

export type UserConsentInput = z.infer<typeof UserConsentSchema>;

/**
 * GDPR Account Deletion Request Schema
 */
export const GdprAccountDeletionSchema = z.object({
  confirmation: z.literal("DELETE"),
  reason: z.string().max(500).optional(),
});

export type GdprAccountDeletionInput = z.infer<typeof GdprAccountDeletionSchema>;
