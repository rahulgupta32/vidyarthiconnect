import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "COUNSELOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const counselor = await db.counselorProfile.findUnique({
      where: { userId: session.id },
    });

    if (!counselor) {
      return NextResponse.json({ error: "Counselor profile not found" }, { status: 404 });
    }

    // Get applications assigned to this counselor
    const applications = await db.application.findMany({
      where: { counselorId: counselor.id },
      include: {
        student: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
        course: true,
        university: true,
      },
    });

    const studentIds = applications.map((a) => a.studentId);

    // Get documents pending review for those students
    const pendingDocuments = await db.document.findMany({
      where: {
        ownerId: { in: studentIds },
        reviewStatus: "PENDING",
      },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Get tasks created by this counselor
    const tasks = await db.task.findMany({
      where: { counselorId: counselor.id },
      orderBy: { createdAt: "desc" },
    });

    // Get counselor handoffs assigned to this counselor or unassigned
    const handoffs = await db.counselorHandoff.findMany({
      where: {
        OR: [
          { counselorId: counselor.userId },
          { counselorId: null }
        ]
      },
      include: {
        student: {
          select: { name: true, email: true }
        },
        conversation: {
          select: { id: true, title: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      counselor,
      applications,
      pendingDocuments,
      tasks,
      handoffs,
    });
  } catch (error: any) {
    console.error("GET counselor workspace error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
