import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { StudentProfileSchema } from "@/lib/validators/forms";
import { logAudit } from "@/lib/security/audit";
import { AuditAction } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await db.studentProfile.findUnique({
      where: { userId: session.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            dob: true,
            nationality: true,
            currentAddress: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("GET student profile error:", error);
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
    const result = StudentProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Update profile
    const updatedProfile = await db.studentProfile.update({
      where: { userId: session.id },
      data: result.data,
    });

    // Audit log
    await logAudit(session.id, AuditAction.PROFILE_UPDATE, ip, `Updated student profile fields`);

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error("POST student profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
