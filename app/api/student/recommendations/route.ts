import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { RiskLevel, DataStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized. Student role required." }, { status: 401 });
  }

  try {
    const profile = await db.studentProfile.findUnique({
      where: { userId: session.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Student profile not found. Please complete your profile first." }, { status: 404 });
    }

    const budgetRange = profile.budgetRange || "$30,000";
    const maxBudget = parseMaxBudget(budgetRange);

    const courses = await db.course.findMany({
      where: {
        dataStatus: {
          in: [DataStatus.VERIFIED, DataStatus.OUTDATED],
        },
      },
      include: {
        university: {
          include: { country: true },
        },
        courseCost: true,
        scholarships: true,
      },
    });

    const recommendations = [];

    for (const course of courses) {
      const cost = course.courseCost;
      const tuition = cost ? cost.tuitionFeePerYear : course.tuitionFee;
      const livingCost = cost ? cost.livingCostEstimate : 12000;
      const appFee = cost ? cost.applicationFee : course.applicationFee;
      const insurance = cost ? cost.insuranceEstimate : 2000;
      const visaFee = cost ? cost.visaFeeEstimate : 500;
      const travel = cost ? cost.travelCostEstimate : 1500;
      
      const totalEstimatedCost = tuition + appFee + livingCost + insurance + visaFee + travel;

      let scholarshipAmount = 0;
      if (course.scholarships && course.scholarships.length > 0) {
        scholarshipAmount = Math.max(...course.scholarships.map(s => s.amount));
      }

      const finalSelfFinance = Math.max(0, totalEstimatedCost - scholarshipAmount);

      let score = 70;
      let reasons: string[] = [];
      let missing: string[] = [];

      // Stated budget match checks
      if (tuition <= maxBudget) {
        score += 10;
        reasons.push("Recommended because tuition fits your budget.");
      } else {
        score -= 15;
        reasons.push("Ambitious option because tuition exceeds your budget.");
      }

      if (finalSelfFinance <= maxBudget) {
        score += 5;
        reasons.push("Self-finance required but total cost is within your stated budget.");
      }

      if (scholarshipAmount > 0) {
        score += 10;
        reasons.push("Scholarship available for your profile.");
      }

      // English score requirements checks
      const studentEnglish = profile.englishTestScore || 0;
      const englishReq = course.englishRequirement ? parseScoreRequirement(course.englishRequirement) : 0;
      if (englishReq > 0 && studentEnglish < englishReq) {
        score -= 15;
        missing.push("Missing English score for scholarship eligibility or standard admission.");
        reasons.push("Missing English score for scholarship eligibility.");
      }

      // GPA requirements checks
      const studentGpa = profile.gpa || 0.0;
      const courseMinGpa = course.minimumGpa || 0.0;
      if (courseMinGpa > 0 && studentGpa < courseMinGpa) {
        score -= 20;
        missing.push("GPA is below the minimum required GPA.");
      }

      // Data verification status checks
      if (course.dataStatus === DataStatus.VERIFIED) {
        score += 5;
        reasons.push("This university data is verified and recently updated.");
      } else if (course.dataStatus === DataStatus.OUTDATED) {
        score -= 10;
        reasons.push("This option is not strongly recommended because the data is outdated.");
      }

      let riskLevel: RiskLevel = RiskLevel.SAFE;
      if (score < 50) {
        riskLevel = RiskLevel.AMBITIOUS;
      } else if (score < 75) {
        riskLevel = RiskLevel.MODERATE;
      }

      recommendations.push({
        id: course.id,
        courseTitle: course.title,
        universityName: course.university.name,
        country: course.university.country.name,
        tuitionFee: tuition,
        totalEstimatedCost,
        scholarshipAmount,
        finalSelfFinance,
        score: Math.min(100, Math.max(0, score)),
        riskLevel,
        reasons: reasons.slice(0, 3),
        missingRequirements: missing.join(", ") || "None",
        dataStatus: course.dataStatus,
        lastVerifiedAt: course.lastVerifiedAt,
      });
    }

    recommendations.sort((a, b) => b.score - a.score);

    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error("GET recommendations error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function parseMaxBudget(budgetRange: string): number {
  const numbers = budgetRange.replace(/,/g, "").match(/\d+/g);
  if (numbers && numbers.length > 0) {
    return Math.max(...numbers.map(n => parseInt(n)));
  }
  return 30000;
}

function parseScoreRequirement(req: string): number {
  const matches = req.match(/\d+(\.\d+)?/);
  return matches ? parseFloat(matches[0]) : 0;
}
