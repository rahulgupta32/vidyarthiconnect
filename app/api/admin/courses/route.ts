import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { AuditAction } from "@prisma/client";
import { CourseSchema } from "@/lib/validators/forms";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const courses = await db.course.findMany({
      include: { university: true },
      orderBy: { title: "asc" },
    });
    return NextResponse.json(courses);
  } catch (error: any) {
    console.error("GET courses error:", error);
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
    const validated = CourseSchema.parse(body);

    const course = await db.course.create({
      data: {
        title: validated.title,
        universityId: validated.universityId,
        degreeLevel: validated.degreeLevel,
        duration: validated.duration,
        tuitionFee: validated.tuitionFee,
        applicationFee: validated.applicationFee,
        intakeDates: validated.intakeDates,
        scholarshipAvailable: validated.scholarshipAvailable,
        description: validated.description || null,
        faculty: validated.faculty || null,
        currency: validated.currency,
        depositAmount: validated.depositAmount || null,
        applicationDeadline: validated.applicationDeadline ? new Date(validated.applicationDeadline) : null,
        englishRequirement: validated.englishRequirement || null,
        academicRequirement: validated.academicRequirement || null,
        minimumGpa: validated.minimumGpa || null,
        courseDescription: validated.courseDescription || null,
        careerOutcomes: validated.careerOutcomes || null,
        postStudyWorkInfo: validated.postStudyWorkInfo || null,
        selfFinanceAccepted: validated.selfFinanceAccepted,
        sourceUrl: validated.sourceUrl || null,
        sourceNote: validated.sourceNote || null,
        dataStatus: validated.dataStatus,
        lastVerifiedAt: validated.dataStatus === "VERIFIED" ? new Date() : null,
        verifiedBy: validated.dataStatus === "VERIFIED" ? session.name : null,
        createdBy: session.id,
        updatedBy: session.id,
      },
    });

    await logAudit(
      session.id,
      AuditAction.COURSE_MANAGE,
      ip,
      `Created course: ${course.title} (${course.id})`
    );

    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    console.error("POST course error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation Error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";
  
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
    }

    const validated = CourseSchema.parse(rest);

    const course = await db.course.update({
      where: { id },
      data: {
        title: validated.title,
        universityId: validated.universityId,
        degreeLevel: validated.degreeLevel,
        duration: validated.duration,
        tuitionFee: validated.tuitionFee,
        applicationFee: validated.applicationFee,
        intakeDates: validated.intakeDates,
        scholarshipAvailable: validated.scholarshipAvailable,
        description: validated.description || null,
        faculty: validated.faculty || null,
        currency: validated.currency,
        depositAmount: validated.depositAmount || null,
        applicationDeadline: validated.applicationDeadline ? new Date(validated.applicationDeadline) : null,
        englishRequirement: validated.englishRequirement || null,
        academicRequirement: validated.academicRequirement || null,
        minimumGpa: validated.minimumGpa || null,
        courseDescription: validated.courseDescription || null,
        careerOutcomes: validated.careerOutcomes || null,
        postStudyWorkInfo: validated.postStudyWorkInfo || null,
        selfFinanceAccepted: validated.selfFinanceAccepted,
        sourceUrl: validated.sourceUrl || null,
        sourceNote: validated.sourceNote || null,
        dataStatus: validated.dataStatus,
        lastVerifiedAt: validated.dataStatus === "VERIFIED" ? new Date() : undefined,
        verifiedBy: validated.dataStatus === "VERIFIED" ? session.name : undefined,
        updatedBy: session.id,
      },
    });

    await logAudit(
      session.id,
      AuditAction.COURSE_MANAGE,
      ip,
      `Updated course: ${course.title} (${course.id})`
    );

    return NextResponse.json(course);
  } catch (error: any) {
    console.error("PUT course error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation Error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

