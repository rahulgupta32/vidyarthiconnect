import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { StudentSupportService } from "@/lib/ai/studentSupportService";
import { db } from "@/lib/db/client";
import { AIConsentType } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized. Student role required." }, { status: 401 });
  }

  try {
    // Check SOP text review consent
    const consent = await db.aIConsentRecord.findUnique({
      where: { userId_consentType: { userId: session.id, consentType: AIConsentType.SOP_TEXT_REVIEW } }
    });

    if (!consent || !consent.granted) {
      return NextResponse.json({ error: "Consent required. Please grant SOP Text Review permission first." }, { status: 403 });
    }

    const body = await req.json();
    const { sopText } = body;

    if (!sopText || typeof sopText !== "string" || sopText.trim().length === 0) {
      return NextResponse.json({ error: "Please enter your SOP draft text." }, { status: 400 });
    }

    const chatResult = await StudentSupportService.processChat(
      session.id,
      "temp-sop-review",
      `Please review this SOP draft for grammar, structure, flow, and key highlights: "${sopText.substring(0, 3000)}"`,
      "SOP_HELP"
    );

    return NextResponse.json({ success: true, review: chatResult.content });
  } catch (error: any) {
    console.error("SOP review advice error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
