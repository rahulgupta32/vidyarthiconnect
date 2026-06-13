import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { AuditAction } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await getSession();
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete all conversations for this user (associated messages will cascade delete)
    const result = await db.aIConversation.deleteMany({
      where: { userId: session.id },
    });

    await logAudit(
      session.id,
      AuditAction.AI_CHAT_CLEAR,
      ip,
      `Cleared all AI conversations (${result.count} threads deleted)`
    );

    return NextResponse.json({ success: true, message: "AI chat history cleared successfully." });
  } catch (error: any) {
    console.error("POST clear-history error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
