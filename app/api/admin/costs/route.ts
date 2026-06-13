import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { AuditAction } from "@prisma/client";
import { CourseCostSchema } from "@/lib/validators/forms";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const costs = await db.courseCost.findMany({
      include: { course: true, university: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(costs);
  } catch (error: any) {
    console.error("GET costs error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";
  
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = CourseCostSchema.parse(body);

    const cost = await db.courseCost.create({
      data: {
        courseId: validated.courseId,
        universityId: validated.universityId,
        tuitionFeePerYear: validated.tuitionFeePerYear,
        totalTuitionFee: validated.totalTuitionFee,
        applicationFee: validated.applicationFee,
        depositAmount: validated.depositAmount,
        visaFeeEstimate: validated.visaFeeEstimate,
        insuranceEstimate: validated.insuranceEstimate,
        livingCostEstimate: validated.livingCostEstimate,
        accommodationEstimate: validated.accommodationEstimate,
        travelCostEstimate: validated.travelCostEstimate,
        proofOfFundsRequirement: validated.proofOfFundsRequirement || null,
        bankBalanceRequirement: validated.bankBalanceRequirement || null,
        sponsorAllowed: validated.sponsorAllowed,
        educationLoanAccepted: validated.educationLoanAccepted,
        installmentPaymentAvailable: validated.installmentPaymentAvailable,
        partTimeWorkAllowed: validated.partTimeWorkAllowed,
        refundPolicy: validated.refundPolicy || null,
        currency: validated.currency,
        sourceUrl: validated.sourceUrl || null,
        sourceNote: validated.sourceNote || null,
        dataStatus: validated.dataStatus,
        lastVerifiedAt: validated.dataStatus === "VERIFIED" ? new Date() : null,
        verifiedBy: validated.dataStatus === "VERIFIED" ? session.name : null,
        createdBy: session.id,
        updatedBy: session.id,
      },
    });

    await logAudit(
      session.id,
      AuditAction.COST_MANAGE,
      ip,
      `Created course cost details for course ID ${cost.courseId}`
    );

    return NextResponse.json(cost, { status: 201 });
  } catch (error: any) {
    console.error("POST course cost error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation Error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
