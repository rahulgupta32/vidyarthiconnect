import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  try {
    let activeConversationId = conversationId;

    // If no conversationId is supplied, auto-discover/create the default conversation
    if (!activeConversationId) {
      if (session.role === "STUDENT") {
        const studentProfile = await db.studentProfile.findUnique({
          where: { userId: session.id },
          include: {
            applications: {
              where: { counselorId: { not: null } },
              take: 1,
            },
          },
        });

        if (!studentProfile) {
          return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
        }

        let counselorId = studentProfile.applications[0]?.counselorId;
        if (!counselorId) {
          // Fallback to the first counselor
          const firstCounselor = await db.counselorProfile.findFirst();
          if (!firstCounselor) {
            return NextResponse.json({ conversationId: null, messages: [] });
          }
          counselorId = firstCounselor.id;
        }

        let conv = await db.conversation.findFirst({
          where: { studentId: studentProfile.id, counselorId: counselorId },
        });

        if (!conv) {
          conv = await db.conversation.create({
            data: { studentId: studentProfile.id, counselorId: counselorId },
          });
        }
        activeConversationId = conv.id;
      } else if (session.role === "COUNSELOR") {
        const counselorProfile = await db.counselorProfile.findUnique({
          where: { userId: session.id },
        });

        if (!counselorProfile) {
          return NextResponse.json({ conversationId: null, messages: [] });
        }

        const conv = await db.conversation.findFirst({
          where: { counselorId: counselorProfile.id },
          orderBy: { lastMessageAt: "desc" },
        });
        if (!conv) {
          return NextResponse.json({ conversationId: null, messages: [] });
        }
        activeConversationId = conv.id;
      }
    }

    if (!activeConversationId) {
      return NextResponse.json({ conversationId: null, messages: [] });
    }

    // Retrieve messages
    const messages = await db.message.findMany({
      where: { conversationId: activeConversationId },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Mark incoming messages as read
    await db.message.updateMany({
      where: {
        conversationId: activeConversationId,
        senderId: { not: session.id },
        readStatus: false,
      },
      data: { readStatus: true },
    });

    return NextResponse.json({ conversationId: activeConversationId, messages });
  } catch (error) {
    console.error("GET messages error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, conversationId } = await req.json();
    if (!content || !conversationId) {
      return NextResponse.json({ error: "Content and conversationId are required" }, { status: 400 });
    }

    const message = await db.message.create({
      data: {
        senderId: session.id,
        conversationId,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });

    // Update conversation timestamp
    await db.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("POST message error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
