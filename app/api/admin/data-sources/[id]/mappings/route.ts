import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { FieldMappingSchema } from "@/lib/validators/forms";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const mappings = await db.externalFieldMapping.findMany({
      where: { dataSourceId: params.id },
    });
    return NextResponse.json(mappings);
  } catch (error: any) {
    console.error("GET mappings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = FieldMappingSchema.parse({
      ...body,
      dataSourceId: params.id,
    });

    const mapping = await db.externalFieldMapping.create({
      data: {
        dataSourceId: validated.dataSourceId,
        externalFieldName: validated.externalFieldName,
        internalModel: validated.internalModel,
        internalFieldName: validated.internalFieldName,
        transformRule: validated.transformRule || null,
        required: validated.required,
      },
    });

    return NextResponse.json(mapping, { status: 201 });
  } catch (error: any) {
    console.error("POST mapping error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation Error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
