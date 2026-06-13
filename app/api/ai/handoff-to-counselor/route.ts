import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { AuditAction, HandoffPriority, HandoffStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await getSession();
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";

  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized. Student role required." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { conversationId, reason, priority } = body;

    if (!conversationId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const conversation = await db.aIConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || conversation.userId !== session.id) {
      return NextResponse.json({ error: "Conversation not found or access denied" }, { status: 404 });
    }

    // Get student's counselor if any
    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: session.id },
      include: {
        applications: {
          where: { counselorId: { not: null } },
          take: 1,
        },
      },
    });

    const counselorId = studentProfile?.applications?.[0]?.counselorId || null;

    const handoff = await db.counselorHandoff.create({
      data: {
        studentId: session.id,
        counselorId,
        conversationId,
        reason,
        summary: `Student requested human counselor assistance. Context Type: ${conversation.contextType}`,
        priority: (priority as HandoffPriority) || HandoffPriority.MEDIUM,
        status: HandoffStatus.OPEN,
      },
    });

    await logAudit(
      session.id,
      AuditAction.COUNSELOR_HANDOFF_CREATE,
      ip,
      `Student requested counselor handoff ${handoff.id} for conversation ${conversationId}`
    );

    return NextResponse.json({ success: true, handoff });
  } catch (error: any) {
    console.error("POST handoff error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
