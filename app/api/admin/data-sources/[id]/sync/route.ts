import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { AuditAction, SyncType } from "@prisma/client";
import { SyncService } from "@/lib/integrations/syncService";
import { TriggerSyncSchema } from "@/lib/validators/forms";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";

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

    let syncType: SyncType = SyncType.ALL;
    try {
      const body = await req.json();
      const validated = TriggerSyncSchema.parse(body);
      syncType = validated.syncType as SyncType;
    } catch (e) {
      // Fall back to ALL if body is empty or invalid
    }

    const jobId = await SyncService.runSync(source.id, syncType, session.name);

    await logAudit(
      session.id,
      AuditAction.SYNC_TRIGGER,
      ip,
      `Triggered sync job ID ${jobId} for source ${source.name}`
    );

    return NextResponse.json({ success: true, jobId, message: "Sync job successfully queued." });
  } catch (error: any) {
    console.error("Sync data source error:", error);
    return NextResponse.json({ success: false, error: error.message || "Sync execution failed" }, { status: 500 });
  }
}
