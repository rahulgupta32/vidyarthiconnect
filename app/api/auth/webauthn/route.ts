import { NextRequest, NextResponse } from "next/server";
import { getSession, setSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";

// This file implements a mock WebAuthn / Passkey registry for MVP demonstration purposes.
// It generates standard challenges and simulates verification.

export async function GET(req: NextRequest) {
  const session = await getSession();
  const url = new URL(req.url);
  const action = url.searchParams.get("action"); // "register" or "authenticate"

  if (action === "register") {
    if (!session) {
      return NextResponse.json({ error: "Session required to register passkey" }, { status: 401 });
    }
    
    // Simulate WebAuthn registration options
    return NextResponse.json({
      challenge: "mock-registration-challenge-string-123456",
      rp: { name: "VidyarthiiConnect", id: "localhost" },
      user: {
        id: session.id,
        name: session.email,
        displayName: session.name,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 }, // ES256
        { type: "public-key", alg: -257 }, // RS256
      ],
      timeout: 60000,
      attestation: "none",
    });
  }

  if (action === "authenticate") {
    const email = url.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email is required to authenticate" }, { status: 400 });
    }

    // Find the user to mock authentication challenge
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "No user found with this email" }, { status: 404 });
    }

    return NextResponse.json({
      challenge: "mock-authentication-challenge-string-789012",
      timeout: 60000,
      rpId: "localhost",
      allowCredentials: [
        {
          type: "public-key",
          id: "mock-credential-id-for-" + user.id,
        },
      ],
      userVerification: "preferred",
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, credential } = body;

    // Simulate verification of WebAuthn responses
    if (action === "register") {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // In real WebAuthn, we would verify the credential signature & counter and save the public key.
      // Here, we log the action and return success.
      console.log(`[PASSKEY] User ${session.email} successfully registered passkey ${credential?.id}`);

      return NextResponse.json({
        success: true,
        message: "Passkey registered successfully! (Mock Verification Passed)",
      });
    }

    if (action === "authenticate") {
      if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }

      const user = await db.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Simulate successful passkey validation
      console.log(`[PASSKEY] User ${email} authenticated successfully using passkey ${credential?.id}`);

      // Set cookie session
      await setSession({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      return NextResponse.json({
        success: true,
        role: user.role,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("WebAuthn error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
