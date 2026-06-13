import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { DataStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const scholarships = await db.scholarship.findMany({
      where: {
        dataStatus: {
          in: [DataStatus.VERIFIED, DataStatus.OUTDATED],
        },
      },
      include: {
        university: true,
        course: true,
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(scholarships);
  } catch (error: any) {
    console.error("GET student scholarships error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
