import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const conversation = await db.aIConversation.findUnique({
      where: { id: params.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Role-based check: Students can only view their own conversations.
    // Counselors and Admins can view conversation payloads for reviews and summaries.
    const isOwner = conversation.userId === session.id;
    const isStaff = session.role === "COUNSELOR" || session.role === "ADMIN" || session.role === "SUPERADMIN";

    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(conversation);
  } catch (error: any) {
    console.error("GET conversation detail error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
