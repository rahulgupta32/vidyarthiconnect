import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { AuditAction, UserRole, InviteStatus } from "@prisma/client";
import crypto from "crypto";

// GET: List invitations
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = session;
    if (role !== UserRole.ADMIN && role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Retrieve invitations
    const invites = await db.inviteUser.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, invites });
  } catch (error: any) {
    console.error("GET Invitations error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create an invitation
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role: creatorRole, id: creatorId } = session;
    if (creatorRole !== UserRole.ADMIN && creatorRole !== UserRole.SUPERADMIN) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const { email, name, role, universityId } = body;

    if (!email || !name || !role) {
      return NextResponse.json({ error: "Email, name, and role are required." }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    // Validate invited role
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: "Invalid role specified." }, { status: 400 });
    }

    // Apply role-based creation rules
    if (creatorRole === UserRole.ADMIN) {
      // Admins can only invite Counselor and Partner
      if (role !== UserRole.COUNSELOR && role !== UserRole.PARTNER) {
        return NextResponse.json(
          { error: "Admins can only invite Counselors or University Partners." },
          { status: 403 }
        );
      }
    } else if (creatorRole === UserRole.SUPERADMIN) {
      // SuperAdmins can invite Admin, Counselor, Partner
      if (role !== UserRole.ADMIN && role !== UserRole.COUNSELOR && role !== UserRole.PARTNER) {
        return NextResponse.json(
          { error: "SuperAdmins cannot invite Students or other SuperAdmins directly." },
          { status: 403 }
        );
      }
    }

    // Partner role must have a universityId
    if (role === UserRole.PARTNER && !universityId) {
      return NextResponse.json(
        { error: "University Partner invitation requires selecting a University." },
        { status: 400 }
      );
    }

    // Generate secure token (random hex string, safe and non-guessable)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // Expires in 48 hours

    // Create invitation record
    const invite = await db.inviteUser.create({
      data: {
        email,
        name,
        role: role as UserRole,
        invitedById: creatorId,
        token: hashedToken,
        expiresAt,
        status: InviteStatus.PENDING,
        universityId: role === UserRole.PARTNER ? universityId : null,
      },
    });

    await logAudit(
      creatorId,
      AuditAction.USER_MANAGE,
      ip,
      `Created invitation for ${name} (${email}) as ${role}`
    );

    // Return the invite, including the raw token (only returned once here)
    return NextResponse.json({
      success: true,
      invite: {
        ...invite,
        token: rawToken,
      },
    });
  } catch (error: any) {
    console.error("POST Invitation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Revoke an invitation
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role: creatorRole, id: creatorId } = session;
    if (creatorRole !== UserRole.ADMIN && creatorRole !== UserRole.SUPERADMIN) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const inviteId = searchParams.get("inviteId");

    if (!inviteId) {
      return NextResponse.json({ error: "inviteId is required." }, { status: 400 });
    }

    const invite = await db.inviteUser.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    }

    if (invite.status !== InviteStatus.PENDING) {
      return NextResponse.json({ error: "Only PENDING invitations can be revoked." }, { status: 400 });
    }

    // Revoke the invitation
    const updatedInvite = await db.inviteUser.update({
      where: { id: inviteId },
      data: { status: InviteStatus.REVOKED },
    });

    await logAudit(
      creatorId,
      AuditAction.USER_MANAGE,
      ip,
      `Revoked invitation for ${invite.name} (${invite.email})`
    );

    return NextResponse.json({ success: true, invite: updatedInvite });
  } catch (error: any) {
    console.error("DELETE Invitation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

