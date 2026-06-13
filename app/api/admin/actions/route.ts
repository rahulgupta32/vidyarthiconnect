import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { AuditAction, DocumentReviewStatus, NotificationType } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await getSession();
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = session;
  const isCounselor = role === "COUNSELOR";
  const isAdmin = role === "ADMIN" || role === "SUPERADMIN";

  if (!isCounselor && !isAdmin) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    // 1. Assign Counselor
    if (action === "assignCounselor") {
      if (!isAdmin) return NextResponse.json({ error: "Admin role required" }, { status: 403 });
      const { counselorId, applicationId } = body;

      const updatedApp = await db.application.update({
        where: { id: applicationId },
        data: { counselorId },
      });

      await logAudit(
        session.id,
        AuditAction.APPLICATION_UPDATE,
        ip,
        `Assigned counselor ID ${counselorId} to application ${applicationId}`
      );
      
      return NextResponse.json({ success: true, application: updatedApp });
    }

    // 2. Review Document
    if (action === "reviewDocument") {
      const { documentId, status, comment } = body; // status: APPROVED, REJECTED, NEEDS_REVISION

      const doc = await db.document.findUnique({
        where: { id: documentId },
        include: { student: { select: { userId: true } } },
      });

      if (!doc) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      const approvalStatus = status === "APPROVED";

      const updatedDoc = await db.$transaction(async (tx) => {
        const d = await tx.document.update({
          where: { id: documentId },
          data: {
            reviewStatus: status as DocumentReviewStatus,
            approvalStatus,
            reviewedBy: session.name,
          },
        });

        // Save review comments
        if (comment) {
          await tx.documentComment.create({
            data: {
              documentId,
              userId: session.id,
              comment,
            },
          });
        }

        // Notify Student
        await tx.notification.create({
          data: {
            userId: doc.student.userId,
            content: `Your uploaded file "${doc.fileName}" was reviewed. Status: ${status}.`,
            type: status === "APPROVED" ? NotificationType.SUCCESS : NotificationType.WARNING,
          },
        });

        return d;
      });

      await logAudit(
        session.id,
        AuditAction.DOCUMENT_REVIEW,
        ip,
        `Reviewed document ${documentId} with status ${status}`
      );

      return NextResponse.json({ success: true, document: updatedDoc });
    }

    // 3. Create Counselor Task
    if (action === "createTask") {
      const { studentId, title, description, dueDate } = body;

      const counselorProfile = await db.counselorProfile.findUnique({
        where: { userId: session.id },
      });

      if (!counselorProfile && !isAdmin) {
        return NextResponse.json({ error: "Counselor profile required" }, { status: 403 });
      }

      const task = await db.task.create({
        data: {
          counselorId: counselorProfile ? counselorProfile.id : "admin",
          studentId,
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : null,
          isCompleted: false,
        },
      });

      return NextResponse.json({ success: true, task });
    }

    // 4. Block/Deactivate User Account
    if (action === "toggleUserBlock") {
      if (!isAdmin) return NextResponse.json({ error: "Admin role required" }, { status: 403 });
      const { userId, isBlocked } = body;

      if (userId === session.id) {
        return NextResponse.json({ error: "You cannot block your own account." }, { status: 400 });
      }

      const updatedUser = await db.user.update({
        where: { id: userId },
        data: { isBlocked },
      });

      await logAudit(
        session.id,
        AuditAction.USER_MANAGE,
        ip,
        `${isBlocked ? "Deactivated" : "Activated"} user: ${updatedUser.email}`
      );

      return NextResponse.json({ success: true, user: updatedUser });
    }

    // 5. Update Nepal NOC Checklist Details
    if (action === "updateNocStatus") {
      const { applicationId, status, number, notes } = body;

      const noc = await db.nOCChecklist.update({
        where: { applicationId },
        data: {
          nocStatus: status,
          nocNumber: number || null,
          notes: notes || null,
        },
      });

      return NextResponse.json({ success: true, noc });
    }

    // 6. Update Visa Checklist Details
    if (action === "updateVisaChecklist") {
      const { applicationId, checklistKey, value } = body;

      const updateData: any = {};
      updateData[checklistKey] = value;

      const visa = await db.visaChecklist.update({
        where: { applicationId },
        data: updateData,
      });

      return NextResponse.json({ success: true, visa });
    }

    // 7. Update Application status
    if (action === "updateApplicationStatus") {
      const { applicationId, status, note } = body;

      const updatedApp = await db.$transaction(async (tx) => {
        const app = await tx.application.update({
          where: { id: applicationId },
          data: { status },
        });

        await tx.applicationTimeline.create({
          data: {
            applicationId,
            status,
            note: note || `Application status updated to ${status}.`,
          },
        });

        // Get student user id
        const student = await tx.studentProfile.findUnique({
          where: { id: app.studentId },
        });

        if (student) {
          await tx.notification.create({
            data: {
              userId: student.userId,
              content: `Your application status updated to ${status}.`,
              type: NotificationType.INFO,
            },
          });
        }

        return app;
      });

      await logAudit(
        session.id,
        AuditAction.APPLICATION_UPDATE,
        ip,
        `Updated application ${applicationId} status to ${status}`
      );

      return NextResponse.json({ success: true, application: updatedApp });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin actions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
