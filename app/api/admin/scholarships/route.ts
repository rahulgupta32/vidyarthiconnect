import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { AuditAction } from "@prisma/client";
import { ScholarshipSchema } from "@/lib/validators/forms";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const scholarships = await db.scholarship.findMany({
      include: { university: true, course: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(scholarships);
  } catch (error: any) {
    console.error("GET scholarships error:", error);
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
    const validated = ScholarshipSchema.parse(body);

    const scholarship = await db.scholarship.create({
      data: {
        name: validated.name,
        description: validated.description || null,
        amount: validated.amount,
        universityId: validated.universityId,
        courseId: validated.courseId || null,
        country: validated.country || null,
        scholarshipType: validated.scholarshipType as any,
        currency: validated.currency,
        coverageType: validated.coverageType as any,
        eligibilityCriteria: validated.eligibilityCriteria || null,
        requiredGpa: validated.requiredGpa || null,
        requiredEnglishScore: validated.requiredEnglishScore || null,
        deadline: validated.deadline ? new Date(validated.deadline) : null,
        numberOfSeats: validated.numberOfSeats || null,
        isAutomatic: validated.isAutomatic,
        requiredDocuments: validated.requiredDocuments || null,
        termsAndConditions: validated.termsAndConditions || null,
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
      AuditAction.SCHOLARSHIP_MANAGE,
      ip,
      `Created scholarship: ${scholarship.name} (${scholarship.id})`
    );

    return NextResponse.json(scholarship, { status: 201 });
  } catch (error: any) {
    console.error("POST scholarship error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation Error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
