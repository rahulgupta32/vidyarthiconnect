import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { SyncService } from "@/lib/integrations/syncService";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const source = await db.externalDataSource.findUnique({
      where: { id: params.id },
    });

    if (!source) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 });
    }

    const connector = SyncService.getConnector(source.providerType);
    const result = await connector.testConnection();

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Test connection error:", error);
    return NextResponse.json({ success: false, message: error.message || "Test connection failed" }, { status: 500 });
  }
}
