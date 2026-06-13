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
      where: { userId_consentType: { userId: session.id, consentType: AIConsentType.SELF_FINANCE_ANALYSIS } }
    });

    if (!consent || !consent.granted) {
      return NextResponse.json({ error: "Consent required. Please grant Self-Finance Analysis permission first." }, { status: 403 });
    }

    const body = await req.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ error: "Missing courseId parameter" }, { status: 400 });
    }

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        university: { select: { name: true } },
        courseCost: true
      }
    });

    if (!course || course.dataStatus === DataStatus.REJECTED || course.dataStatus === DataStatus.PENDING_REVIEW) {
      return NextResponse.json({ error: "Course not found or unverified" }, { status: 404 });
    }

    const chatResult = await StudentSupportService.processChat(
      session.id,
      "temp-self-finance-help",
      `Calculate my total estimated self-finance requirement for the course "${course.title}" at "${course.university.name}". Detail the visa fee, living cost estimate, health insurance, and sponsor parameters.`,
      "SELF_FINANCE_HELP"
    );

    return NextResponse.json({ success: true, advice: chatResult.content });
  } catch (error: any) {
    console.error("Self finance help error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
