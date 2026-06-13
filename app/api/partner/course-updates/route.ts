import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { AuditAction, ReviewStatus } from "@prisma/client";
import { CourseSchema } from "@/lib/validators/forms";

export async function POST(req: NextRequest) {
  const session = await getSession();
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";

  if (!session || session.role !== "PARTNER") {
    return NextResponse.json({ error: "Unauthorized. Partner access required." }, { status: 401 });
  }

  try {
    const partnerProfile = await db.universityPartnerProfile.findUnique({
      where: { userId: session.id },
    });

    if (!partnerProfile) {
      return NextResponse.json({ error: "Partner profile not associated with a university." }, { status: 403 });
    }

    const body = await req.json();
    const { courseId } = body;

    // Validate using Zod CourseSchema (making universityId optional in the validate or supply it)
    const payload = {
      ...body,
      universityId: partnerProfile.universityId,
    };
    const validated = CourseSchema.parse(payload);

    const submission = await db.partnerUpdateSubmission.create({
      data: {
        partnerId: session.id,
        universityId: partnerProfile.universityId,
        targetModel: "Course",
        targetRecordId: courseId || null,
        updatePayload: JSON.stringify(validated),
        reviewStatus: ReviewStatus.PENDING_REVIEW,
      },
    });

    await logAudit(
      session.id,
      AuditAction.PARTNER_UPDATE_SUBMIT,
      ip,
      `Submitted course update proposal for university: ${partnerProfile.universityId}`
    );

    return NextResponse.json({ success: true, submission, message: "Course update proposed. Pending admin review." });
  } catch (error: any) {
    console.error("Partner course-update error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation Error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
