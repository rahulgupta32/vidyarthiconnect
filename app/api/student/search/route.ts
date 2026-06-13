import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { DataStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const courses = await db.course.findMany({
      where: {
        dataStatus: {
          in: [DataStatus.VERIFIED, DataStatus.OUTDATED],
        },
      },
      include: {
        university: {
          include: {
            country: true,
            campuses: true,
          },
        },
        scholarships: true,
        courseCost: true,
      },
      orderBy: { title: "asc" },
    });

    return NextResponse.json(courses);
  } catch (error: any) {
    console.error("GET courses error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
