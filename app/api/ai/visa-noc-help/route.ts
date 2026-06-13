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
      "temp-visa-noc",
      "Explain the Nepal MoEST NOC application steps and standard student visa checklist criteria for my preferred country.",
      "VISA_NOC"
    );

    return NextResponse.json({ success: true, advice: chatResult.content });
  } catch (error: any) {
    console.error("Visa NOC help advice error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
