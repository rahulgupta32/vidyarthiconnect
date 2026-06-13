import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { storageProvider } from "@/lib/storage/provider";
import { logAudit } from "@/lib/security/audit";
import { AuditAction, DocumentReviewStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // If student, return only their documents. If counselor/admin/superadmin, allow based on role or sharing permissions
    let documents = [];

    if (session.role === "STUDENT") {
      const studentProfile = await db.studentProfile.findUnique({
        where: { userId: session.id },
      });

      if (!studentProfile) {
        return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
      }

      documents = await db.document.findMany({
        where: { ownerId: studentProfile.id },
        include: {
          comments: {
            include: {
              user: { select: { name: true, role: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Counselors/Admins can see documents. For the MVP dashboard convenience:
      documents = await db.document.findMany({
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
          comments: {
            include: {
              user: { select: { name: true, role: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(documents);
  } catch (error) {
    console.error("GET documents error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";

  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileType = formData.get("fileType") as string;

    if (!file || !fileType) {
      return NextResponse.json({ error: "File and Document Type are required" }, { status: 400 });
    }

    // 1. File size validation (max 5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json({ error: "File exceeds the maximum 5MB size limit." }, { status: 400 });
    }

    // 2. File type validation (PDF, JPG, PNG)
    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only PDF, JPEG, and PNG are allowed." }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Retrieve Student Profile
    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: session.id },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    // 3. Upload file using storage abstraction
    const uploadResult = await storageProvider.uploadFile(buffer, file.name, file.type);

    // 4. Save metadata to database
    const document = await db.document.create({
      data: {
        ownerId: studentProfile.id,
        fileName: file.name,
        originalName: file.name,
        fileType,
        fileSize: uploadResult.size,
        mimeType: file.type,
        storageProvider: "local",
        storageKey: uploadResult.key,
        storageUrl: uploadResult.url,
        reviewStatus: DocumentReviewStatus.PENDING,
        approvalStatus: false,
        uploadedBy: session.name,
      },
    });

    // 5. Document access logging
    await db.documentAccessLog.create({
      data: {
        documentId: document.id,
        userId: session.id,
        action: "UPLOAD",
      },
    });

    // 6. Security audit logging
    await logAudit(session.id, AuditAction.DOCUMENT_UPLOAD, ip, `Uploaded document ${fileType}: ${file.name}`);

    return NextResponse.json({ success: true, document });
  } catch (error: any) {
    console.error("Document upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
