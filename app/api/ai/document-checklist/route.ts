import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { StudentSupportService } from "@/lib/ai/studentSupportService";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized. Student role required." }, { status: 401 });
  }

  try {
    const chatResult = await StudentSupportService.processChat(
      session.id,
      "temp-doc-checklist", // Temporary mock or specific ID
      "Please check my uploaded documents metadata, verify what is approved or rejected, and suggest what I need to upload next.",
      "DOCUMENT_CHECKLIST"
    );

    return NextResponse.json({ success: true, advice: chatResult.content });
  } catch (error: any) {
    console.error("Document checklist advice error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
