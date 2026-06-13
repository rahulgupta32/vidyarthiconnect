import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = session;
    if (role !== UserRole.ADMIN && role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // 1. Fetch users
    let users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isBlocked: true,
        createdAt: true,
      },
    });

    // Enforce security boundaries:
    // Normal admins cannot see or edit SuperAdmin details
    if (role === UserRole.ADMIN) {
      users = users.filter((u) => u.role !== UserRole.SUPERADMIN);
    }

    // 2. Fetch universities for partner dropdown
    const universities = await db.university.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, users, universities });
  } catch (error: any) {
    console.error("GET users list error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
