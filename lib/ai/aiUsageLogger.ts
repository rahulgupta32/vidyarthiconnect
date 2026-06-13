import { db } from "../db/client";

interface LogParams {
  userId: string | null;
  provider: string;
  model: string;
  feature: string;
  promptTokens: number;
  completionTokens: number;
  requestStatus: "SUCCESS" | "FAILED";
  errorMessage?: string;
  latencyMs: number;
}

export async function logAiUsage(params: LogParams) {
  try {
    const totalTokens = params.promptTokens + params.completionTokens;
    
    // Estimate cost based on gpt-4o-mini pricing
    // Input: $0.15 / 1M tokens, Output: $0.60 / 1M tokens
    let estimatedCost = 0.0;
    if (params.provider.toUpperCase() === "OPENAI") {
      estimatedCost = ((params.promptTokens * 0.15) + (params.completionTokens * 0.60)) / 1000000;
    }

    return await db.aIUsageLog.create({
      data: {
        userId: params.userId,
        provider: params.provider.toUpperCase(),
        model: params.model,
        feature: params.feature,
        promptTokens: params.promptTokens,
        completionTokens: params.completionTokens,
        totalTokens,
        estimatedCost,
        requestStatus: params.requestStatus,
        errorMessage: params.errorMessage || null,
        latencyMs: params.latencyMs,
      }
    });
  } catch (error) {
    console.error("Failed to write AI usage log:", error);
  }
}
