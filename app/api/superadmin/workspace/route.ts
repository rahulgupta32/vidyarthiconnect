import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Retrieve audit logs
    const auditLogs = await db.auditLog.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Retrieve suspicious activity logs
    const suspiciousLogs = await db.suspiciousActivityLog.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Retrieve commissions list
    const commissions = await db.commission.findMany({
      include: {
        application: {
          include: {
            student: { include: { user: { select: { name: true } } } },
            university: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      auditLogs,
      suspiciousLogs,
      commissions,
    });
  } catch (error: any) {
    console.error("GET superadmin workspace error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
