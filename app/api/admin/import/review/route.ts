import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { AuditAction, ReviewStatus, DataStatus, PartnerStatus, InstitutionType, ScholarshipType, CoverageType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reviews = await db.importedDataReview.findMany({
      include: { dataSource: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error("GET imported data reviews error:", error);
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
    const { id, action } = body; // action: APPROVED, REJECTED

    if (!id || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const review = await db.importedDataReview.findUnique({
      where: { id },
      include: { dataSource: true },
    });

    if (!review) {
      return NextResponse.json({ error: "Imported record not found" }, { status: 404 });
    }

    if (action === "REJECTED") {
      const updatedReview = await db.importedDataReview.update({
        where: { id },
        data: {
          reviewStatus: ReviewStatus.REJECTED,
          reviewedBy: session.name,
          reviewedAt: new Date(),
        },
      });

      await logAudit(
        session.id,
        AuditAction.IMPORTED_DATA_REVIEW,
        ip,
        `Rejected imported record ID ${id} (${review.targetModel})`
      );

      return NextResponse.json({ success: true, review: updatedReview });
    }

    if (action !== "APPROVED") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const payload = JSON.parse(review.normalizedPayload);

    // APPROVED WORKFLOW
    let targetRecordId = review.targetRecordId;

    if (review.targetModel === "CSV_Row") {
      // 1. Create or find Country & University
      const countryId = await findOrCreateCountry(payload.country);
      
      const uni = await db.university.upsert({
        where: { name: payload.university_name },
        update: {
          city: payload.city || null,
          campus: payload.campus || null,
          websiteUrl: payload.source_url || null,
          verifiedStatus: true,
          dataStatus: DataStatus.VERIFIED,
          lastVerifiedAt: new Date(),
          verifiedBy: session.name,
          updatedBy: session.id,
        },
        create: {
          name: payload.university_name,
          countryId,
          city: payload.city || null,
          campus: payload.campus || null,
          websiteUrl: payload.source_url || null,
          partnerStatus: PartnerStatus.NON_PARTNER,
          institutionType: InstitutionType.PUBLIC,
          verifiedStatus: true,
          dataStatus: DataStatus.VERIFIED,
          lastVerifiedAt: new Date(),
          verifiedBy: session.name,
          createdBy: session.id,
          updatedBy: session.id,
        },
      });

      // 2. Create or find Course
      const course = await db.course.create({
        data: {
          title: payload.course_name,
          universityId: uni.id,
          degreeLevel: payload.degree_level || "OTHER",
          duration: "4 Years",
          tuitionFee: payload.tuition_fee,
          applicationFee: payload.application_fee || 0,
          intakeDates: payload.intake || "Fall",
          scholarshipAvailable: payload.scholarship_available || false,
          selfFinanceAccepted: payload.self_finance_available !== false,
          applicationDeadline: payload.deadline ? new Date(payload.deadline) : null,
          sourceUrl: payload.source_url || null,
          dataStatus: DataStatus.VERIFIED,
          lastVerifiedAt: new Date(),
          verifiedBy: session.name,
          createdBy: session.id,
          updatedBy: session.id,
        },
      });

      // 3. Create CourseCost Details
      await db.courseCost.create({
        data: {
          courseId: course.id,
          universityId: uni.id,
          tuitionFeePerYear: payload.tuition_fee,
          totalTuitionFee: payload.tuition_fee * 4,
          applicationFee: payload.application_fee || 0,
          depositAmount: payload.deposit_amount || 0,
          livingCostEstimate: payload.living_cost_estimate || 12000,
          visaFeeEstimate: 500,
          insuranceEstimate: 2000,
          travelCostEstimate: 1500,
          currency: payload.currency || "USD",
          sourceUrl: payload.source_url || null,
          dataStatus: DataStatus.VERIFIED,
          lastVerifiedAt: new Date(),
          verifiedBy: session.name,
          createdBy: session.id,
          updatedBy: session.id,
        },
      });

      // 4. Create Scholarship if applicable
      if (payload.scholarship_available && payload.scholarship_name) {
        await db.scholarship.create({
          data: {
            name: payload.scholarship_name,
            amount: payload.scholarship_amount || 0,
            universityId: uni.id,
            courseId: course.id,
            scholarshipType: (payload.scholarship_type as ScholarshipType) || ScholarshipType.MERIT_BASED,
            coverageType: CoverageType.PARTIAL_TUITION,
            isAutomatic: true,
            dataStatus: DataStatus.VERIFIED,
            lastVerifiedAt: new Date(),
            verifiedBy: session.name,
            createdBy: session.id,
            updatedBy: session.id,
          },
        });
      }

      targetRecordId = course.id;
    } else if (review.targetModel === "University") {
      const uni = await db.university.upsert({
        where: { name: payload.name },
        update: {
          city: payload.city || null,
          campus: payload.campus || null,
          websiteUrl: payload.websiteUrl || null,
          logoUrl: payload.logoUrl || null,
          coverImageUrl: payload.coverImageUrl || null,
          description: payload.description || null,
          ranking: payload.ranking || null,
          institutionType: payload.institutionType as any,
          partnerStatus: payload.partnerStatus as any,
          contactEmail: payload.contactEmail || null,
          applicationPortalUrl: payload.applicationPortalUrl || null,
          sourceUrl: payload.sourceUrl || null,
          verifiedStatus: true,
          dataStatus: DataStatus.VERIFIED,
          lastVerifiedAt: new Date(),
          verifiedBy: session.name,
          updatedBy: session.id,
          externalDataSourceId: review.dataSourceId,
        },
        create: {
          name: payload.name,
          countryId: payload.countryId,
          city: payload.city || null,
          campus: payload.campus || null,
          websiteUrl: payload.websiteUrl || null,
          logoUrl: payload.logoUrl || null,
          coverImageUrl: payload.coverImageUrl || null,
          description: payload.description || null,
          ranking: payload.ranking || null,
          institutionType: (payload.institutionType as any) || InstitutionType.PUBLIC,
          partnerStatus: (payload.partnerStatus as any) || PartnerStatus.NON_PARTNER,
          contactEmail: payload.contactEmail || null,
          applicationPortalUrl: payload.applicationPortalUrl || null,
          sourceUrl: payload.sourceUrl || null,
          verifiedStatus: true,
          dataStatus: DataStatus.VERIFIED,
          lastVerifiedAt: new Date(),
          verifiedBy: session.name,
          createdBy: session.id,
          updatedBy: session.id,
          externalDataSourceId: review.dataSourceId,
        },
      });
      targetRecordId = uni.id;
    } else if (review.targetModel === "Course") {
      // Find university
      const uni = await db.university.findFirst({
        where: { name: { equals: payload.universityName, mode: "insensitive" } },
      });

      if (!uni) {
        throw new Error(`University "${payload.universityName}" must be verified first.`);
      }

      const course = await db.course.create({
        data: {
          title: payload.title,
          universityId: uni.id,
          degreeLevel: payload.degreeLevel || "OTHER",
          duration: payload.duration || "4 Years",
          tuitionFee: payload.tuitionFee || 0,
          applicationFee: payload.applicationFee || 0,
          intakeDates: payload.intakeDates || "Fall",
          scholarshipAvailable: payload.scholarshipAvailable || false,
          description: payload.description || null,
          faculty: payload.faculty || null,
          currency: payload.currency || "USD",
          depositAmount: payload.depositAmount || null,
          applicationDeadline: payload.applicationDeadline ? new Date(payload.applicationDeadline) : null,
          englishRequirement: payload.englishRequirement || null,
          academicRequirement: payload.academicRequirement || null,
          minimumGpa: payload.minimumGpa || null,
          selfFinanceAccepted: payload.selfFinanceAccepted !== false,
          sourceUrl: payload.sourceUrl || null,
          dataStatus: DataStatus.VERIFIED,
          lastVerifiedAt: new Date(),
          verifiedBy: session.name,
          createdBy: session.id,
          updatedBy: session.id,
          externalDataSourceId: review.dataSourceId,
        },
      });
      targetRecordId = course.id;
    } else if (review.targetModel === "Scholarship") {
      const uni = await db.university.findFirst({
        where: { name: { equals: payload.universityName, mode: "insensitive" } },
      });

      if (!uni) {
        throw new Error(`University "${payload.universityName}" must be verified first.`);
      }

      let courseId = null;
      if (payload.courseTitle) {
        const crs = await db.course.findFirst({
          where: {
            title: { equals: payload.courseTitle, mode: "insensitive" },
            universityId: uni.id,
          },
        });
        courseId = crs ? crs.id : null;
      }

      const sch = await db.scholarship.create({
        data: {
          name: payload.name,
          description: payload.description || null,
          amount: payload.amount || 0,
          universityId: uni.id,
          courseId,
          country: payload.country || null,
          scholarshipType: (payload.scholarshipType as any) || ScholarshipType.MERIT_BASED,
          currency: payload.currency || "USD",
          coverageType: (payload.coverageType as any) || CoverageType.PARTIAL_TUITION,
          eligibilityCriteria: payload.eligibilityCriteria || null,
          requiredGpa: payload.requiredGpa || null,
          requiredEnglishScore: payload.requiredEnglishScore || null,
          deadline: payload.deadline ? new Date(payload.deadline) : null,
          numberOfSeats: payload.numberOfSeats || null,
          isAutomatic: payload.isAutomatic || false,
          requiredDocuments: payload.requiredDocuments || null,
          termsAndConditions: payload.termsAndConditions || null,
          sourceUrl: payload.sourceUrl || null,
          dataStatus: DataStatus.VERIFIED,
          lastVerifiedAt: new Date(),
          verifiedBy: session.name,
          createdBy: session.id,
          updatedBy: session.id,
          externalDataSourceId: review.dataSourceId,
        },
      });
      targetRecordId = sch.id;
    } else if (review.targetModel === "CourseCost") {
      const uni = await db.university.findFirst({
        where: { name: { equals: payload.universityName, mode: "insensitive" } },
      });

      if (!uni) {
        throw new Error(`University "${payload.universityName}" must be verified first.`);
      }

      const crs = await db.course.findFirst({
        where: {
          title: { equals: payload.courseTitle, mode: "insensitive" },
          universityId: uni.id,
        },
      });

      if (!crs) {
        throw new Error(`Course "${payload.courseTitle}" must be verified first.`);
      }

      const cost = await db.courseCost.upsert({
        where: { courseId: crs.id },
        update: {
          tuitionFeePerYear: payload.tuitionFeePerYear,
          totalTuitionFee: payload.totalTuitionFee,
          applicationFee: payload.applicationFee,
          depositAmount: payload.depositAmount,
          visaFeeEstimate: payload.visaFeeEstimate || 0,
          insuranceEstimate: payload.insuranceEstimate || 0,
          livingCostEstimate: payload.livingCostEstimate || 0,
          accommodationEstimate: payload.accommodationEstimate || 0,
          travelCostEstimate: payload.travelCostEstimate || 0,
          proofOfFundsRequirement: payload.proofOfFundsRequirement || null,
          bankBalanceRequirement: payload.bankBalanceRequirement || null,
          sponsorAllowed: payload.sponsorAllowed !== false,
          educationLoanAccepted: payload.educationLoanAccepted !== false,
          installmentPaymentAvailable: payload.installmentPaymentAvailable || false,
          partTimeWorkAllowed: payload.partTimeWorkAllowed !== false,
          refundPolicy: payload.refundPolicy || null,
          dataStatus: DataStatus.VERIFIED,
          lastVerifiedAt: new Date(),
          verifiedBy: session.name,
          updatedBy: session.id,
        },
        create: {
          courseId: crs.id,
          universityId: uni.id,
          tuitionFeePerYear: payload.tuitionFeePerYear,
          totalTuitionFee: payload.totalTuitionFee,
          applicationFee: payload.applicationFee,
          depositAmount: payload.depositAmount,
          visaFeeEstimate: payload.visaFeeEstimate || 0,
          insuranceEstimate: payload.insuranceEstimate || 0,
          livingCostEstimate: payload.livingCostEstimate || 0,
          accommodationEstimate: payload.accommodationEstimate || 0,
          travelCostEstimate: payload.travelCostEstimate || 0,
          proofOfFundsRequirement: payload.proofOfFundsRequirement || null,
          bankBalanceRequirement: payload.bankBalanceRequirement || null,
          sponsorAllowed: payload.sponsorAllowed !== false,
          educationLoanAccepted: payload.educationLoanAccepted !== false,
          installmentPaymentAvailable: payload.installmentPaymentAvailable || false,
          partTimeWorkAllowed: payload.partTimeWorkAllowed !== false,
          refundPolicy: payload.refundPolicy || null,
          currency: payload.currency || "USD",
          sourceUrl: payload.sourceUrl || null,
          dataStatus: DataStatus.VERIFIED,
          lastVerifiedAt: new Date(),
          verifiedBy: session.name,
          createdBy: session.id,
          updatedBy: session.id,
          externalDataSourceId: review.dataSourceId,
        },
      });
      targetRecordId = cost.id;
    }

    const updatedReview = await db.importedDataReview.update({
      where: { id },
      data: {
        reviewStatus: ReviewStatus.APPROVED,
        reviewedBy: session.name,
        reviewedAt: new Date(),
        targetRecordId,
      },
    });

    await logAudit(
      session.id,
      AuditAction.IMPORTED_DATA_REVIEW,
      ip,
      `Approved imported record ID ${id} (${review.targetModel})`
    );

    return NextResponse.json({ success: true, review: updatedReview });
  } catch (error: any) {
    console.error("POST imported data review error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

async function findOrCreateCountry(countryName: string): Promise<string> {
  const normalized = countryName.trim();
  let country = await db.country.findFirst({
    where: {
      OR: [
        { name: { equals: normalized, mode: "insensitive" } },
        { code: { equals: normalized, mode: "insensitive" } }
      ]
    }
  });

  if (!country) {
    const code = normalized.substring(0, 2).toUpperCase();
    let finalCode = code;
    let attempts = 1;
    while (await db.country.findUnique({ where: { code: finalCode } })) {
      finalCode = code + (attempts++);
    }

    country = await db.country.create({
      data: {
        name: normalized,
        code: finalCode,
      }
    });
  }

  return country.id;
}
