import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { AuditAction, AIConsentType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const records = await db.aIConsentRecord.findMany({
      where: { userId: session.id },
    });
    return NextResponse.json(records);
  } catch (error: any) {
    console.error("GET consent error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { consentType, granted } = body;

    if (!consentType || typeof granted !== "boolean") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate enum
    if (!Object.values(AIConsentType).includes(consentType)) {
      return NextResponse.json({ error: "Invalid consent type" }, { status: 400 });
    }

    const record = await db.aIConsentRecord.upsert({
      where: {
        userId_consentType: {
          userId: session.id,
          consentType: consentType as AIConsentType,
        },
      },
      update: {
        granted,
        revokedAt: granted ? null : new Date(),
        grantedAt: granted ? new Date() : undefined,
      },
      create: {
        userId: session.id,
        consentType: consentType as AIConsentType,
        granted,
        revokedAt: granted ? null : new Date(),
        grantedAt: granted ? new Date() : new Date(),
      },
    });

    await logAudit(
      session.id,
      AuditAction.AI_CONSENT_UPDATE,
      ip,
      `Updated AI consent ${consentType} to ${granted}`
    );

    return NextResponse.json(record);
  } catch (error: any) {
    console.error("POST consent error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
