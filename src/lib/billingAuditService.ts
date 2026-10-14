import { createHash } from "crypto";

export interface BillingAuditEvent {
  userId?: string | null;
  provider: "stripe" | "razorpay" | "paddle" | "mock" | string;
  eventType: string;
  providerEventId?: string | null;
  payload: Record<string, any>;
  ipAddress?: string | null;
}

/**
 * Computes deterministic SHA-256 hash of a payload object
 */
export function hashPayload(payload: Record<string, any>): string {
  const jsonStr = JSON.stringify(payload, Object.keys(payload).sort());
  return createHash("sha256").update(jsonStr).digest("hex");
}

/**
 * Records an immutable, tamper-evident audit log for any billing or webhook lifecycle event.
 */
export async function recordBillingAuditLog(event: BillingAuditEvent): Promise<{ success: boolean; logId?: string; error?: string }> {
  try {
    const payloadHash = hashPayload(event.payload);

    // Dynamically import server client to avoid next/headers issues in non-HTTP/test contexts
    const { createClient } = await import("./supabase/server");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("billing_audit_logs")
      .insert({
        user_id: event.userId || null,
        provider: event.provider,
        event_type: event.eventType,
        provider_event_id: event.providerEventId || null,
        payload_hash: payloadHash,
        payload: event.payload,
        ip_address: event.ipAddress || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[BILLING_AUDIT_LOG_ERROR] Failed inserting log into database:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, logId: data?.id };
  } catch (err: any) {
    console.error("[BILLING_AUDIT_LOG_EXCEPTION]:", err.message);
    return { success: false, error: err.message };
  }
}
