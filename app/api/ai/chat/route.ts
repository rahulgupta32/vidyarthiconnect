import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { StudentSupportService } from "@/lib/ai/studentSupportService";
import { logAudit } from "@/lib/security/audit";
import { AuditAction, AIMessageRole, HandoffPriority, HandoffStatus, AIConsentType } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await getSession();
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";

  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized. Student role required." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { message, conversationId } = body;

    if (!message || !conversationId) {
      return NextResponse.json({ error: "Missing message or conversationId" }, { status: 400 });
    }

    // 1. Fetch conversation and verify ownership
    const conversation = await db.aIConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || conversation.userId !== session.id) {
      return NextResponse.json({ error: "Conversation not found or access denied" }, { status: 404 });
    }

    // Check if user has opted out of storing chat history
    const chatHistoryConsent = await db.aIConsentRecord.findUnique({
      where: {
        userId_consentType: {
          userId: session.id,
          consentType: AIConsentType.CHAT_HISTORY,
        },
      },
    });
    const shouldStoreHistory = chatHistoryConsent?.granted ?? true; // Default to true

    // 2. Save user message in database if history storage is enabled
    if (shouldStoreHistory) {
      await db.aIMessage.create({
        data: {
          conversationId,
          role: AIMessageRole.USER,
          content: message,
        },
      });
    }

    // 3. Process chatbot query via support service
    const chatResult = await StudentSupportService.processChat(
      session.id,
      conversationId,
      message,
      conversation.contextType
    );

    // 4. Handle counselor handoff if triggered
    let handoffRecord = null;
    if (chatResult.handoffTriggered) {
      // Find assigned counselor if any
      const studentProfile = await db.studentProfile.findUnique({
        where: { userId: session.id },
        include: {
          applications: {
            where: { counselorId: { not: null } },
            take: 1,
          },
        },
      });

      const assignedCounselorId = studentProfile?.applications?.[0]?.counselorId || null;

      handoffRecord = await db.counselorHandoff.create({
        data: {
          studentId: session.id,
          counselorId: assignedCounselorId,
          conversationId,
          reason: `Auto-escalation keyword match: student message triggered advisory escalation.`,
          summary: `Student query: "${message.substring(0, 150)}..."`,
          priority: HandoffPriority.HIGH,
          status: HandoffStatus.OPEN,
        },
      });

      await logAudit(
        session.id,
        AuditAction.COUNSELOR_HANDOFF_CREATE,
        ip,
        `Created counselor handoff ${handoffRecord.id} for conversation ${conversationId}`
      );
    }

    // 5. Save assistant reply in database if history storage is enabled
    if (shouldStoreHistory) {
      await db.aIMessage.create({
        data: {
          conversationId,
          role: AIMessageRole.ASSISTANT,
          content: chatResult.content,
        },
      });
    }

    // 6. Update conversation timestamp
    await db.aIConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      reply: chatResult.content,
      handoffTriggered: chatResult.handoffTriggered || false,
      handoff: handoffRecord,
      error: chatResult.error,
    });
  } catch (error: any) {
    console.error("POST AI Chat route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
