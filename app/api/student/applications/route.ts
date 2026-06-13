import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApplicationSchema } from "@/lib/validators/forms";
import { logAudit } from "@/lib/security/audit";
import { AuditAction, ApplicationStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let applications = [];

    if (session.role === "STUDENT") {
      const studentProfile = await db.studentProfile.findUnique({
        where: { userId: session.id },
      });

      if (!studentProfile) {
        return NextResponse.json([]);
      }

      applications = await db.application.findMany({
        where: { studentId: studentProfile.id },
        include: {
          university: true,
          course: true,
          counselor: { include: { user: { select: { name: true } } } },
          timelines: { orderBy: { createdAt: "asc" } },
          visaChecklist: true,
          nocChecklist: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (session.role === "COUNSELOR") {
      const counselorProfile = await db.counselorProfile.findUnique({
        where: { userId: session.id },
      });

      if (!counselorProfile) {
        return NextResponse.json([]);
      }

      applications = await db.application.findMany({
        where: { counselorId: counselorProfile.id },
        include: {
          student: { include: { user: { select: { name: true, email: true } } } },
          university: true,
          course: true,
          timelines: { orderBy: { createdAt: "asc" } },
          visaChecklist: true,
          nocChecklist: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Admin / SuperAdmin / University Partner (limit visibility appropriately)
      applications = await db.application.findMany({
        include: {
          student: { include: { user: { select: { name: true, email: true } } } },
          university: true,
          course: true,
          counselor: { include: { user: { select: { name: true } } } },
          timelines: { orderBy: { createdAt: "asc" } },
          visaChecklist: true,
          nocChecklist: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET applications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";

  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = ApplicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { universityId, courseId, intake, notes } = result.data;

    // Get student profile
    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: session.id },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    // Assign a counselor automatically (simplistic workload-balancing MVP)
    const counselor = await db.counselorProfile.findFirst({
      orderBy: { activeStudentsCount: "asc" },
    });

    // Create Application, Timeline entry, Visa Checklist, and NOC Checklist in transaction
    const application = await db.$transaction(async (tx) => {
      const newApp = await tx.application.create({
        data: {
          studentId: studentProfile.id,
          universityId,
          courseId,
          intake,
          counselorId: counselor ? counselor.id : null,
          status: ApplicationStatus.DRAFTING,
          notes,
        },
      });

      // Timeline entry
      await tx.applicationTimeline.create({
        data: {
          applicationId: newApp.id,
          status: ApplicationStatus.DRAFTING,
          note: "Application draft created.",
        },
      });

      // Visa checklist
      await tx.visaChecklist.create({
        data: {
          applicationId: newApp.id,
        },
      });

      // NOC checklist
      await tx.nOCChecklist.create({
        data: {
          applicationId: newApp.id,
        },
      });

      if (counselor) {
        // Increment counselor workload count
        await tx.counselorProfile.update({
          where: { id: counselor.id },
          data: { activeStudentsCount: { increment: 1 } },
        });
      }

      return newApp;
    });

    // Log Audit
    await logAudit(session.id, AuditAction.APPLICATION_CREATE, ip, `Created application for course ${courseId}`);

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("POST application error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
