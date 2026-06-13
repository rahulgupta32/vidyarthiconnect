import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { AuditAction } from "@prisma/client";
import { UniversitySchema } from "@/lib/validators/forms";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const universities = await db.university.findMany({
      include: { country: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(universities);
  } catch (error: any) {
    console.error("GET universities error:", error);
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
    const validated = UniversitySchema.parse(body);

    const university = await db.university.create({
      data: {
        name: validated.name,
        countryId: validated.countryId,
        city: validated.city || null,
        campus: validated.campus || null,
        websiteUrl: validated.websiteUrl || null,
        logoUrl: validated.logoUrl || null,
        coverImageUrl: validated.coverImageUrl || null,
        description: validated.description || null,
        ranking: validated.ranking || null,
        institutionType: validated.institutionType,
        partnerStatus: validated.partnerStatus as any,
        contactEmail: validated.contactEmail || null,
        applicationPortalUrl: validated.applicationPortalUrl || null,
        sourceUrl: validated.sourceUrl || null,
        sourceNote: validated.sourceNote || null,
        dataStatus: validated.dataStatus,
        verifiedStatus: validated.dataStatus === "VERIFIED",
        lastVerifiedAt: validated.dataStatus === "VERIFIED" ? new Date() : null,
        verifiedBy: validated.dataStatus === "VERIFIED" ? session.name : null,
        createdBy: session.id,
        updatedBy: session.id,
      },
    });

    await logAudit(
      session.id,
      AuditAction.UNIVERSITY_MANAGE,
      ip,
      `Created university: ${university.name} (${university.id})`
    );

    return NextResponse.json(university, { status: 201 });
  } catch (error: any) {
    console.error("POST university error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation Error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
