import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Retrieve students
    const students = await db.studentProfile.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, isBlocked: true },
        },
      },
    });

    // Retrieve counselors
    const counselors = await db.counselorProfile.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Retrieve applications
    const applications = await db.application.findMany({
      include: {
        student: {
          include: {
            user: { select: { name: true } },
          },
        },
        course: true,
        university: true,
        counselor: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    // Retrieve payment transactions
    const payments = await db.payment.findMany({
      include: {
        student: {
          include: {
            user: { select: { name: true } },
          },
        },
        package: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      students,
      counselors,
      applications,
      payments,
    });
  } catch (error: any) {
    console.error("GET admin workspace error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
