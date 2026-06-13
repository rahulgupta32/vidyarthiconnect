import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { InviteStatus } from "@prisma/client";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawToken = searchParams.get("token");

    if (!rawToken) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    // Hash raw token to query DB
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const invite = await db.inviteUser.findUnique({
      where: { token: hashedToken },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        expiresAt: true,
      },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invalid invitation token." }, { status: 404 });
    }

    if (invite.status !== InviteStatus.PENDING) {
      return NextResponse.json(
        { error: `This invitation has already been processed or deactivated. Current status: ${invite.status}.` },
        { status: 400 }
      );
    }

    const now = new Date();
    if (invite.expiresAt < now) {
      // Auto-update to EXPIRED
      await db.inviteUser.update({
        where: { id: invite.id },
        data: { status: InviteStatus.EXPIRED },
      });
      return NextResponse.json({ error: "This invitation has expired." }, { status: 400 });
    }

    return NextResponse.json({ success: true, invite });
  } catch (error: any) {
    console.error("GET invite-details error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
