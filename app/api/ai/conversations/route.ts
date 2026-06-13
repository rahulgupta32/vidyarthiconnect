import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { AIContextType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const conversations = await db.aIConversation.findMany({
      where: { userId: session.id },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(conversations);
  } catch (error: any) {
    console.error("GET conversations error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, contextType } = body;

    if (!title || !contextType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!Object.values(AIContextType).includes(contextType)) {
      return NextResponse.json({ error: "Invalid context type" }, { status: 400 });
    }

    const conversation = await db.aIConversation.create({
      data: {
        userId: session.id,
        title,
        contextType: contextType as AIContextType,
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error: any) {
    console.error("POST conversation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
