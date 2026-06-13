import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { isAiEnabled } from "@/lib/ai/openaiClient";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Retrieve audit logs
    const auditLogs = await db.auditLog.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Retrieve suspicious activity logs
    const suspiciousLogs = await db.suspiciousActivityLog.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Retrieve commissions list
    const commissions = await db.commission.findMany({
      include: {
        application: {
          include: {
            student: { include: { user: { select: { name: true } } } },
            university: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // AI configuration status
    const aiConfigured = !!process.env.OPENAI_API_KEY;
    const aiEnabled = isAiEnabled();

    // AI usage logs (last 50)
    const aiUsageLogs = await db.aIUsageLog.findMany({
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Error logs (last 20 failures)
    const aiErrorLogs = await db.aIUsageLog.findMany({
      where: { requestStatus: "FAILED" },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Daily token usage (today)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const dailyTokenAgg = await db.aIUsageLog.aggregate({
      where: { createdAt: { gte: startOfToday } },
      _sum: { totalTokens: true }
    });
    const dailyTokenUsage = dailyTokenAgg._sum.totalTokens || 0;

    // Monthly token usage (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthlyTokenAgg = await db.aIUsageLog.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { totalTokens: true }
    });
    const monthlyTokenUsage = monthlyTokenAgg._sum.totalTokens || 0;

    // Counselor handoff count
    const counselorHandoffCount = await db.counselorHandoff.count();

    // Top features used (group by and count)
    const featuresGroup = await db.aIUsageLog.groupBy({
      by: ["feature"],
      _count: { _all: true },
      _sum: { totalTokens: true },
    });

    const topFeatures = featuresGroup.map(f => ({
      feature: f.feature,
      count: f._count._all,
      tokens: f._sum.totalTokens || 0
    }));

    return NextResponse.json({
      auditLogs,
      suspiciousLogs,
      commissions,
      aiStats: {
        aiConfigured,
        aiEnabled,
        dailyTokenUsage,
        monthlyTokenUsage,
        counselorHandoffCount,
        topFeatures,
      },
      aiUsageLogs,
      aiErrorLogs,
    });
  } catch (error: any) {
    console.error("GET superadmin workspace error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
