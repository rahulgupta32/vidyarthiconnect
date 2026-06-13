import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { AuditAction } from "@prisma/client";
import { ExternalDataSourceSchema } from "@/lib/validators/forms";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sources = await db.externalDataSource.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(sources);
  } catch (error: any) {
    console.error("GET data sources error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only SuperAdmin can manage API credentials and write data sources
  if (session.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Only SuperAdmin can create data sources" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = ExternalDataSourceSchema.parse(body);

    const source = await db.externalDataSource.create({
      data: {
        name: validated.name,
        providerType: validated.providerType,
        baseUrl: validated.baseUrl || null,
        authType: validated.authType,
        connectorStatus: validated.connectorStatus as any,
        description: validated.description || null,
        createdBy: session.id,
        updatedBy: session.id,
      },
    });

    await logAudit(
      session.id,
      AuditAction.DATA_SOURCE_MANAGE,
      ip,
      `Created external data source: ${source.name} (${source.id})`
    );

    return NextResponse.json(source, { status: 201 });
  } catch (error: any) {
    console.error("POST data source error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation Error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
