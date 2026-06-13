import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PARTNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const partner = await db.universityPartnerProfile.findUnique({
      where: { userId: session.id },
      include: { university: true },
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner university profile not found" }, { status: 404 });
    }

    // Retrieve applications to this partner's university
    const applications = await db.application.findMany({
      where: { universityId: partner.universityId },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true, nationality: true } },
          },
        },
        course: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      partner,
      applications,
    });
  } catch (error: any) {
    console.error("GET partner workspace error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
