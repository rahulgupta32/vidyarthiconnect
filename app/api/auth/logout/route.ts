import { NextRequest, NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/security/audit";
import { AuditAction } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await getSession();
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";
  
  if (session) {
    await logAudit(session.id, AuditAction.LOGOUT, ip, `User logged out`);
  }
  
  await clearSession();
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";
  
  if (session) {
    await logAudit(session.id, AuditAction.LOGOUT, ip, `User logged out`);
  }
  
  await clearSession();
  return NextResponse.redirect(new URL("/login", req.url));
}
