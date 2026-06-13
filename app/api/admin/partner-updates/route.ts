import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { AuditAction, ReviewStatus, DataStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const submissions = await db.partnerUpdateSubmission.findMany({
      include: {
        university: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(submissions);
  } catch (error: any) {
    console.error("GET partner updates error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";

  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, action, reviewNotes } = body; // action: APPROVED, REJECTED

    if (!id || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const submission = await db.partnerUpdateSubmission.findUnique({
      where: { id },
      include: { university: true },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.reviewStatus !== ReviewStatus.PENDING_REVIEW) {
      return NextResponse.json({ error: "Submission has already been reviewed" }, { status: 400 });
    }

    if (action === "REJECTED") {
      const updated = await db.partnerUpdateSubmission.update({
        where: { id },
        data: {
          reviewStatus: ReviewStatus.REJECTED,
          reviewedBy: session.name,
          reviewedAt: new Date(),
          reviewNotes: reviewNotes || null,
        },
      });

      await logAudit(
        session.id,
        AuditAction.PARTNER_UPDATE_REVIEW,
        ip,
        `Rejected partner update proposal ${id} for university ${submission.university.name}`
      );

      return NextResponse.json({ success: true, submission: updated });
    }

    if (action !== "APPROVED") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Process approval
    const payload = JSON.parse(submission.updatePayload);
    const targetModel = submission.targetModel;
    const targetRecordId = submission.targetRecordId;

    let resultRecord: any = null;

    if (targetModel === "Course") {
      if (targetRecordId) {
        resultRecord = await db.course.update({
          where: { id: targetRecordId },
          data: {
            ...payload,
            dataStatus: DataStatus.VERIFIED,
            lastVerifiedAt: new Date(),
            verifiedBy: session.name,
            updatedBy: session.id,
          },
        });
      } else {
        resultRecord = await db.course.create({
          data: {
            ...payload,
            dataStatus: DataStatus.VERIFIED,
            lastVerifiedAt: new Date(),
            verifiedBy: session.name,
            createdBy: session.id,
            updatedBy: session.id,
          },
        });
      }
    } else if (targetModel === "CourseCost") {
      if (targetRecordId) {
        resultRecord = await db.courseCost.update({
          where: { id: targetRecordId },
          data: {
            ...payload,
            dataStatus: DataStatus.VERIFIED,
            lastVerifiedAt: new Date(),
            verifiedBy: session.name,
            updatedBy: session.id,
          },
        });
      } else {
        resultRecord = await db.courseCost.create({
          data: {
            ...payload,
            dataStatus: DataStatus.VERIFIED,
            lastVerifiedAt: new Date(),
            verifiedBy: session.name,
            createdBy: session.id,
            updatedBy: session.id,
          },
        });
      }
    } else if (targetModel === "Scholarship") {
      if (targetRecordId) {
        resultRecord = await db.scholarship.update({
          where: { id: targetRecordId },
          data: {
            ...payload,
            dataStatus: DataStatus.VERIFIED,
            lastVerifiedAt: new Date(),
            verifiedBy: session.name,
            updatedBy: session.id,
          },
        });
      } else {
        resultRecord = await db.scholarship.create({
          data: {
            ...payload,
            dataStatus: DataStatus.VERIFIED,
            lastVerifiedAt: new Date(),
            verifiedBy: session.name,
            createdBy: session.id,
            updatedBy: session.id,
          },
        });
      }
    } else if (targetModel === "University") {
      if (targetRecordId) {
        resultRecord = await db.university.update({
          where: { id: targetRecordId },
          data: {
            ...payload,
            dataStatus: DataStatus.VERIFIED,
            lastVerifiedAt: new Date(),
            verifiedBy: session.name,
            updatedBy: session.id,
          },
        });
      } else {
        resultRecord = await db.university.create({
          data: {
            ...payload,
            dataStatus: DataStatus.VERIFIED,
            lastVerifiedAt: new Date(),
            verifiedBy: session.name,
            createdBy: session.id,
            updatedBy: session.id,
          },
        });
      }
    } else {
      return NextResponse.json({ error: "Invalid target model" }, { status: 400 });
    }

    const updated = await db.partnerUpdateSubmission.update({
      where: { id },
      data: {
        reviewStatus: ReviewStatus.APPROVED,
        reviewedBy: session.name,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || null,
      },
    });

    await logAudit(
      session.id,
      AuditAction.PARTNER_UPDATE_REVIEW,
      ip,
      `Approved partner update proposal ${id} for university ${submission.university.name}. Applied to model ${targetModel}.`
    );

    return NextResponse.json({ success: true, submission: updated, record: resultRecord });
  } catch (error: any) {
    console.error("POST partner updates review error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
