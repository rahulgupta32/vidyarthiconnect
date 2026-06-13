import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { verifyPassword, setSession } from "@/lib/auth/session";
import { LoginSchema } from "@/lib/validators/forms";
import { logAudit, logSuspicious, checkRateLimit } from "@/lib/security/audit";
import { AuditAction } from "@prisma/client";

// Global in-memory map to track failed logins for brute-force lockouts
const globalAttempts = global as unknown as {
  loginAttempts: Map<string, { count: number; lockUntil: number }>;
};
if (!globalAttempts.loginAttempts) {
  globalAttempts.loginAttempts = new Map();
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";
  
  // 1. Check IP Rate Limiting (max 10 login requests per minute)
  const allowed = await checkRateLimit(ip, "login", 10, 60000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    // 2. Validate input
    const result = LoginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid email or password format" },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const lowerEmail = email.toLowerCase().trim();

    // 3. Check Account Lockout
    const now = Date.now();
    const lockInfo = globalAttempts.loginAttempts.get(lowerEmail);
    if (lockInfo && lockInfo.count >= 5 && now < lockInfo.lockUntil) {
      const remainingMinutes = Math.ceil((lockInfo.lockUntil - now) / 60000);
      return NextResponse.json(
        { error: `Account locked due to multiple failed attempts. Try again in ${remainingMinutes} minutes.` },
        { status: 423 }
      );
    }

    // 4. Retrieve User
    const user = await db.user.findUnique({
      where: { email: lowerEmail },
    });

    if (!user) {
      // Return ambiguous error to prevent email enumeration but track failed attempt
      trackFailedAttempt(lowerEmail, ip);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 5. Check if manually blocked
    if (user.isBlocked) {
      await logSuspicious(user.id, "Blocked User Login Attempt", `Blocked user ${email} attempted to login.`, "MEDIUM", ip);
      return NextResponse.json(
        { error: "Your account has been deactivated. Please contact support." },
        { status: 403 }
      );
    }

    // 6. Verify Password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      trackFailedAttempt(lowerEmail, ip, user.id);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 7. Successful login: Reset attempts
    globalAttempts.loginAttempts.delete(lowerEmail);

    // 8. Create session cookie
    await setSession({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // 9. Audit log
    await logAudit(user.id, AuditAction.LOGIN, ip, `User logged in successfully`);

    return NextResponse.json({
      success: true,
      role: user.role,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function trackFailedAttempt(email: string, ip: string, userId: string | null = null) {
  const now = Date.now();
  const current = globalAttempts.loginAttempts.get(email) || { count: 0, lockUntil: 0 };
  
  current.count += 1;
  if (current.count >= 5) {
    current.lockUntil = now + 15 * 60 * 1000; // 15 minutes lock
    logSuspicious(
      userId,
      "Account Locked Out",
      `Multiple failed login attempts on email: ${email}. IP: ${ip}. Account locked for 15 minutes.`,
      "HIGH",
      ip
    );
  }
  
  globalAttempts.loginAttempts.set(email, current);
}
