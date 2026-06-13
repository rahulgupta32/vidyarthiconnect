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
      where: { userId_consentType: { userId: session.id, consentType: AIConsentType.RECOMMENDATION_EXPLANATION } }
    });

    if (!consent || !consent.granted) {
      return NextResponse.json({ error: "Consent required. Please grant Recommendation Explanation permission first." }, { status: 403 });
    }

    const body = await req.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ error: "Missing courseId parameter" }, { status: 400 });
    }

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        university: {
          select: { name: true, partnerStatus: true, rankingWorld: true }
        },
        courseCost: true,
        scholarships: true
      }
    });

    if (!course || course.dataStatus === DataStatus.REJECTED || course.dataStatus === DataStatus.PENDING_REVIEW) {
      return NextResponse.json({ error: "Course not found or unverified" }, { status: 404 });
    }

    const chatResult = await StudentSupportService.processChat(
      session.id,
      "temp-rec-explain",
      `Explain why course "${course.title}" at "${course.university.name}" (Tuition: ${course.currency} ${course.tuitionFee}/yr, World rank: #${course.university.rankingWorld || "N/A"}) is recommended for me. Clearly separate verified facts from general guidelines.`,
      "UNIVERSITY_RECOMMENDATION"
    );

    return NextResponse.json({ success: true, explanation: chatResult.content });
  } catch (error: any) {
    console.error("Recommendation explanation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
