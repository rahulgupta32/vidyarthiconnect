import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { hashPassword } from "@/lib/auth/session";
import { SignupSchema } from "@/lib/validators/forms";
import { logAudit } from "@/lib/security/audit";
import { AuditAction, UserRole } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";
    const body = await req.json();

    // Validate request body
    const result = SignupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, name, phone, dob, nationality, currentAddress } = result.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Create the User and Student Profile in a transaction
    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: UserRole.STUDENT,
          name,
          phone,
          dob: dob ? new Date(dob) : null,
          nationality,
          currentAddress,
        },
      });

      await tx.studentProfile.create({
        data: {
          userId: newUser.id,
          guardianConsent: false,
        },
      });

      return newUser;
    });

    // Create Audit Log
    await logAudit(user.id, AuditAction.SIGNUP, ip, `Student account registered: ${email}`);

    return NextResponse.json(
      { success: true, message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
