import { db } from "../db/client";
import { AuditAction } from "@prisma/client";

export async function logAudit(userId: string, action: AuditAction, ip: string, details?: string) {
  try {
    return await db.auditLog.create({
      data: {
        userId,
        action,
        ip,
        details,
      },
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
}

export async function logSuspicious(
  userId: string | null,
  type: string,
  details: string,
  severity: string,
  ip: string
) {
  try {
    return await db.suspiciousActivityLog.create({
      data: {
        userId,
        type,
        details,
        severity,
        ip,
      },
    });
  } catch (error) {
    console.error("Error creating suspicious activity log:", error);
  }
}

// In-memory rate limiting map attached to global to persist in development
const globalRateLimit = global as unknown as {
  rateLimits: Map<string, { count: number; resetAt: number }>;
};

if (!globalRateLimit.rateLimits) {
  globalRateLimit.rateLimits = new Map();
}

/**
 * Checks if a request is within the rate limit.
 * @returns true if allowed, false if rate limited.
 */
export async function checkRateLimit(ip: string, action: string, limit: number = 10, windowMs: number = 60000): Promise<boolean> {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const limits = globalRateLimit.rateLimits;
  const current = limits.get(key);

  if (!current || now > current.resetAt) {
    limits.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (current.count >= limit) {
    return false; // rate limited
  }

  current.count += 1;
  return true; // allowed
}
