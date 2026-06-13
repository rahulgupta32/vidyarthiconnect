import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { DataStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const universities = await db.university.findMany({
      where: {
        dataStatus: DataStatus.VERIFIED,
      },
      include: { country: true, campuses: true },
      orderBy: { ranking: "asc" },
    });
    return NextResponse.json(universities);
  } catch (error: any) {
    console.error("GET student universities error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
