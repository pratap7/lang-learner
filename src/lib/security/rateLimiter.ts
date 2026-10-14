/**
 * Sliding Window In-Memory Rate Limiter with Next.js Header Support
 * Provides DDoS, brute-force, and AI token drain protection.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodically clean up stale entries (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      // Keep only timestamps from the last 15 minutes
      const valid = record.timestamps.filter((ts) => now - ts < 15 * 60 * 1000);
      if (valid.length === 0) {
        rateLimitStore.delete(key);
      } else {
        rateLimitStore.set(key, { timestamps: valid });
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  headers: Record<string, string>;
}

/**
 * Checks and updates rate limits for a given identifier (IP or user ID).
 *
 * @param identifier Unique client identifier (e.g. client IP, user ID, or hashed combo)
 * @param limit Maximum allowed hits in the given window
 * @param windowSeconds Window length in seconds (default: 60)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 20,
  windowSeconds: number = 60
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const threshold = now - windowMs;

  let record = rateLimitStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filter timestamps within current window
  const activeTimestamps = record.timestamps.filter((ts) => ts > threshold);

  if (activeTimestamps.length >= limit) {
    const oldestInWindow = activeTimestamps[0] || threshold;
    const resetSeconds = Math.max(1, Math.ceil((oldestInWindow + windowMs - now) / 1000));

    return {
      allowed: false,
      limit,
      remaining: 0,
      resetSeconds,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": (Math.floor(now / 1000) + resetSeconds).toString(),
        "Retry-After": resetSeconds.toString(),
      },
    };
  }

  // Record this hit
  activeTimestamps.push(now);
  record.timestamps = activeTimestamps;

  const remaining = Math.max(0, limit - activeTimestamps.length);
  const oldestInWindow = activeTimestamps[0] || now;
  const resetSeconds = Math.max(1, Math.ceil((oldestInWindow + windowMs - now) / 1000));

  return {
    allowed: true,
    limit,
    remaining,
    resetSeconds,
    headers: {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": (Math.floor(now / 1000) + resetSeconds).toString(),
    },
  };
}

/**
 * Extracts a client IP from NextRequest headers safely
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
