import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "vidyarthi_session";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_key_at_least_32_chars_long";

// Edge-safe cryptographic verification (runs natively in Next.js Edge Runtime Web Crypto API)
async function verifyJwtSignature(token: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [headerB64, payloadB64, signatureB64] = parts;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(JWT_SECRET);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlDecode(signatureB64);

    return await crypto.subtle.verify(
      "HMAC",
      cryptoKey,
      signature as any,
      data
    );
  } catch (error) {
    return false;
  }
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLen);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Edge-safe JWT payload decoder (no Node.js modules required)
function decodeJwtPayload(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as {
      id: string;
      email: string;
      role: string;
      name: string;
      exp: number;
    };
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  // Paths that require authentication
  const protectedPaths = [
    "/student",
    "/counselor",
    "/partner",
    "/admin",
    "/superadmin",
  ];

  const isProtected = protectedPaths.some(
    (path) => pathname.startsWith(path) || pathname === path
  );

  const isApiProtected = pathname.startsWith("/api/student") ||
                         pathname.startsWith("/api/counselor") ||
                         pathname.startsWith("/api/partner") ||
                         pathname.startsWith("/api/admin") ||
                         pathname.startsWith("/api/superadmin");

  if (isProtected || isApiProtected) {
    if (!token) {
      if (isApiProtected) {
        return NextResponse.json({ error: "Unauthorized. Session required." }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Cryptographic signature check
    const isSignatureValid = await verifyJwtSignature(token);
    if (!isSignatureValid) {
      const response = NextResponse.redirect(new URL("/login?forged=true", request.url));
      response.cookies.delete(SESSION_COOKIE);
      if (isApiProtected) {
        return NextResponse.json({ error: "Invalid session signature." }, { status: 401 });
      }
      return response;
    }

    const payload = decodeJwtPayload(token);
    if (!payload || Date.now() >= payload.exp * 1000) {
      const response = NextResponse.redirect(new URL("/login?expired=true", request.url));
      response.cookies.delete(SESSION_COOKIE);
      if (isApiProtected) {
        return NextResponse.json({ error: "Session expired." }, { status: 401 });
      }
      return response;
    }

    const role = payload.role.toUpperCase();

    // Check Role Access Controls
    if (pathname.startsWith("/student") && role !== "STUDENT") {
      return NextResponse.redirect(new URL(getRoleRedirectUrl(role), request.url));
    }
    if (pathname.startsWith("/counselor") && role !== "COUNSELOR") {
      return NextResponse.redirect(new URL(getRoleRedirectUrl(role), request.url));
    }
    if (pathname.startsWith("/partner") && role !== "PARTNER") {
      return NextResponse.redirect(new URL(getRoleRedirectUrl(role), request.url));
    }
    if (pathname.startsWith("/admin") && role !== "ADMIN" && role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL(getRoleRedirectUrl(role), request.url));
    }
    if (pathname.startsWith("/superadmin") && role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL(getRoleRedirectUrl(role), request.url));
    }

    // Check API role access controls
    if (pathname.startsWith("/api/student") && role !== "STUDENT") {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }
    if (pathname.startsWith("/api/counselor") && role !== "COUNSELOR") {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }
    if (pathname.startsWith("/api/partner") && role !== "PARTNER") {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }
    if (pathname.startsWith("/api/admin") && role !== "ADMIN" && role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }
    if (pathname.startsWith("/api/superadmin") && role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }
  }

  if (token && (pathname === "/login" || pathname === "/signup" || pathname.startsWith("/signup/"))) {
    const isSignatureValid = await verifyJwtSignature(token);
    const payload = decodeJwtPayload(token);
    if (isSignatureValid && payload && Date.now() < payload.exp * 1000) {
      return NextResponse.redirect(new URL(getRoleRedirectUrl(payload.role), request.url));
    }
  }

  return NextResponse.next();
}

function getRoleRedirectUrl(role: string): string {
  switch (role) {
    case "STUDENT":
      return "/student/dashboard";
    case "COUNSELOR":
      return "/counselor/dashboard";
    case "PARTNER":
      return "/partner/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    case "SUPERADMIN":
      return "/superadmin/dashboard";
    default:
      return "/login";
  }
}

export const config = {
  matcher: [
    "/student/:path*",
    "/counselor/:path*",
    "/partner/:path*",
    "/admin/:path*",
    "/superadmin/:path*",
    "/login",
    "/signup/:path*",
    "/api/student/:path*",
    "/api/counselor/:path*",
    "/api/partner/:path*",
    "/api/admin/:path*",
    "/api/superadmin/:path*",
  ],
};
