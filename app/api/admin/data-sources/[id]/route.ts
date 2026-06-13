import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { AuditAction } from "@prisma/client";
import { ExternalDataSourceSchema } from "@/lib/validators/forms";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const source = await db.externalDataSource.findUnique({
      where: { id: params.id },
      include: {
        credentials: {
          select: {
            id: true,
            credentialName: true,
            scopes: true,
            expiresAt: true,
            // DO NOT select keys or secrets!
          },
        },
        fieldMappings: true,
      },
    });

    if (!source) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 });
    }

    return NextResponse.json(source);
  } catch (error: any) {
    console.error("GET data source error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Only SuperAdmin can manage data sources" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = ExternalDataSourceSchema.parse(body);

    const source = await db.externalDataSource.update({
      where: { id: params.id },
      data: {
        name: validated.name,
        providerType: validated.providerType,
        baseUrl: validated.baseUrl || null,
        authType: validated.authType,
        connectorStatus: validated.connectorStatus as any,
        description: validated.description || null,
        updatedBy: session.id,
      },
    });

    await logAudit(
      session.id,
      AuditAction.DATA_SOURCE_MANAGE,
      ip,
      `Updated data source: ${source.name} (${source.id})`
    );

    return NextResponse.json(source);
  } catch (error: any) {
    console.error("PUT data source error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation Error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Only SuperAdmin can manage data sources" }, { status: 403 });
  }

  try {
    const source = await db.externalDataSource.delete({
      where: { id: params.id },
    });

    await logAudit(
      session.id,
      AuditAction.DATA_SOURCE_MANAGE,
      ip,
      `Deleted data source: ${source.name} (${source.id})`
    );

    return NextResponse.json({ success: true, message: "Data source deleted successfully" });
  } catch (error: any) {
    console.error("DELETE data source error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
