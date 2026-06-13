import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reviews = await db.importedDataReview.findMany({
      include: { dataSource: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error("GET imported data error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
