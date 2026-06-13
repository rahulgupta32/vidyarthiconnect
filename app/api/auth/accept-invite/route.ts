import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { hashPassword } from "@/lib/auth/session";
import { logAudit } from "@/lib/security/audit";
import { AuditAction, InviteStatus, UserRole } from "@prisma/client";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";
    const body = await req.json();
    const { token: rawToken, password, phone, dob, nationality, currentAddress } = body;

    if (!rawToken || !password) {
      return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    // Hash the raw token to lookup in database
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // 1. Find the invitation
    const invite = await db.inviteUser.findUnique({
      where: { token: hashedToken },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invalid invitation token." }, { status: 404 });
    }

    // 2. Validate invitation status and expiry
    if (invite.status !== InviteStatus.PENDING) {
      return NextResponse.json(
        { error: `This invitation is no longer active. Current status: ${invite.status}.` },
        { status: 400 }
      );
    }

    const now = new Date();
    if (invite.expiresAt < now) {
      // Mark as EXPIRED dynamically if we hit it
      await db.inviteUser.update({
        where: { id: invite.id },
        data: { status: InviteStatus.EXPIRED },
      });
      return NextResponse.json({ error: "This invitation has expired." }, { status: 400 });
    }

    // 3. Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: invite.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists in the system." },
        { status: 400 }
      );
    }

    // 4. Hash the password
    const passwordHash = await hashPassword(password);

    // 5. Create user and role profile in a transaction
    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: invite.email,
          name: invite.name,
          role: invite.role,
          passwordHash,
          phone: phone || null,
          dob: dob ? new Date(dob) : null,
          nationality: nationality || null,
          currentAddress: currentAddress || null,
        },
      });

      // Create role-specific profiles
      if (invite.role === UserRole.COUNSELOR) {
        await tx.counselorProfile.create({
          data: {
            userId: newUser.id,
            activeStudentsCount: 0,
            workloadLimit: 20,
          },
        });
      } else if (invite.role === UserRole.PARTNER) {
        if (!invite.universityId) {
          throw new Error("University ID is required for University Partner profile creation.");
        }
        await tx.universityPartnerProfile.create({
          data: {
            userId: newUser.id,
            universityId: invite.universityId,
          },
        });
      }

      // Mark invitation as ACCEPTED
      await tx.inviteUser.update({
        where: { id: invite.id },
        data: {
          status: InviteStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      });

      return newUser;
    });

    // 6. Log Audit trail
    await logAudit(
      user.id,
      AuditAction.SIGNUP,
      ip,
      `Accepted invitation token. Account registered: ${invite.email} with role ${invite.role}`
    );

    return NextResponse.json({
      success: true,
      message: "Account created successfully. You can now log in.",
    });
  } catch (error: any) {
    console.error("Accept Invitation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process invitation acceptance." },
      { status: 500 }
    );
  }
}
