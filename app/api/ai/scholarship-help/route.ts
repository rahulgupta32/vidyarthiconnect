import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { StudentSupportService } from "@/lib/ai/studentSupportService";
import { db } from "@/lib/db/client";
import { AIConsentType, DataStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized. Student role required." }, { status: 401 });
  }

  try {
    // Check consent
    const consent = await db.aIConsentRecord.findUnique({
      where: { userId_consentType: { userId: session.id, consentType: AIConsentType.SCHOLARSHIP_ANALYSIS } }
    });

    if (!consent || !consent.granted) {
      return NextResponse.json({ error: "Consent required. Please grant Scholarship Analysis permission first." }, { status: 403 });
    }

    const body = await req.json();
    const { scholarshipId } = body;

    if (!scholarshipId) {
      return NextResponse.json({ error: "Missing scholarshipId parameter" }, { status: 400 });
    }

    const scholarship = await db.scholarship.findUnique({
      where: { id: scholarshipId },
      include: {
        university: { select: { name: true } }
      }
    });

    if (!scholarship || scholarship.dataStatus === DataStatus.REJECTED || scholarship.dataStatus === DataStatus.PENDING_REVIEW) {
      return NextResponse.json({ error: "Scholarship not found or unverified" }, { status: 404 });
    }

    const chatResult = await StudentSupportService.processChat(
      session.id,
      "temp-scholarship-help",
      `Tell me about scholarship "${scholarship.name}" at "${scholarship.university.name}" (Value: ${scholarship.currency} ${scholarship.amount.toLocaleString()}, Type: ${scholarship.scholarshipType}). Am I eligible based on my profile?`,
      "SCHOLARSHIP_HELP"
    );

    return NextResponse.json({ success: true, advice: chatResult.content });
  } catch (error: any) {
    console.error("Scholarship help error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
