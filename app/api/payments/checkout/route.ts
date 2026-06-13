import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { CheckoutSchema } from "@/lib/validators/forms";
import { logAudit } from "@/lib/security/audit";
import { AuditAction, PaymentStatus, NotificationType } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await getSession();
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";

  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = CheckoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { packageId, amount, method, transactionId } = result.data;

    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: session.id },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    // Process payment and save invoice inside transaction
    const payment = await db.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          studentId: studentProfile.id,
          amount,
          status: PaymentStatus.PAID, // Automate paid status for checkout mock simulation
          packageId,
          method,
          transactionId: transactionId || `TXN-MOCK-${Date.now()}`,
        },
      });

      const invNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      await tx.invoice.create({
        data: {
          paymentId: p.id,
          invoiceNumber: invNumber,
          amount,
          taxAmount: amount * 0.13, // 13% tax/VAT
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days limit
        },
      });

      // Notification
      await tx.notification.create({
        data: {
          userId: session.id,
          content: `Thank you! Your payment of NPR ${amount} for package enrollment is verified.`,
          type: NotificationType.SUCCESS,
        },
      });

      return p;
    });

    // Security audit
    await logAudit(
      session.id,
      AuditAction.PAYMENT_CHECKOUT,
      ip,
      `Service Package Payment of ${amount} via ${method} approved.`
    );

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    console.error("Payment checkout error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
