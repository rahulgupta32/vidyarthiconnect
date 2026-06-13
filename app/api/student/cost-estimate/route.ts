import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const scholarshipId = searchParams.get("scholarshipId");

  if (!courseId) {
    return NextResponse.json({ error: "Missing courseId parameter" }, { status: 400 });
  }

  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        courseCost: true,
        scholarships: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const cost = course.courseCost;
    
    // Set default values from Course or standard estimates if CourseCost is missing
    const tuition = cost ? cost.tuitionFeePerYear : course.tuitionFee;
    const applicationFee = cost ? cost.applicationFee : course.applicationFee;
    const deposit = cost ? cost.depositAmount : 0;
    const livingCost = cost ? cost.livingCostEstimate : 12000;
    const insurance = cost ? cost.insuranceEstimate : 2000;
    const visaFee = cost ? cost.visaFeeEstimate : 500;
    const travel = cost ? cost.travelCostEstimate : 1500;

    const totalEstimatedCost = tuition + applicationFee + livingCost + insurance + visaFee + travel;

    // Determine scholarship deduction
    let scholarshipAmount = 0;
    let appliedScholarshipName = "";

    if (scholarshipId) {
      const scholarship = await db.scholarship.findUnique({
        where: { id: scholarshipId },
      });
      if (scholarship && (scholarship.courseId === courseId || scholarship.universityId === course.universityId)) {
        scholarshipAmount = scholarship.amount;
        appliedScholarshipName = scholarship.name;
      }
    } else if (course.scholarships && course.scholarships.length > 0) {
      // Apply the highest automatic/available scholarship by default
      const autoSch = course.scholarships.sort((a, b) => b.amount - a.amount)[0];
      scholarshipAmount = autoSch.amount;
      appliedScholarshipName = autoSch.name;
    }

    const finalSelfFinanceEstimate = Math.max(0, totalEstimatedCost - scholarshipAmount);

    return NextResponse.json({
      courseId,
      courseTitle: course.title,
      currency: cost ? cost.currency : "USD",
      breakdown: {
        tuition,
        applicationFee,
        deposit,
        livingCost,
        insurance,
        visaFee,
        travel,
      },
      totalEstimatedCost,
      scholarship: {
        name: appliedScholarshipName,
        amount: scholarshipAmount,
      },
      finalSelfFinanceEstimate,
    });
  } catch (error: any) {
    console.error("GET cost-estimate error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
