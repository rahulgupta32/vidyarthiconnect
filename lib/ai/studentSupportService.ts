import { db } from "../db/client";
import { openai, isAiEnabled, getAiModel, getDailyUserTokenLimit, getGlobalMonthlyTokenLimit } from "./openaiClient";
import { matchFAQ } from "./faqLayer";
import { redactSensitiveData, detectHandoffTrigger, SYSTEM_PROMPT_STUDENT } from "./safetyGuardrails";
import { buildStudentContext } from "./contextBuilder";
import { generateMockResponse } from "./mockAiService";
import { logAiUsage } from "./aiUsageLogger";
import { logAudit } from "../security/audit";
import { AuditAction, HandoffPriority, HandoffStatus } from "@prisma/client";

// Global in-memory request cooldown tracker: userId -> lastRequestTimeMs
const globalCooldowns = global as unknown as {
  cooldowns: Map<string, number>;
};
if (!globalCooldowns.cooldowns) {
  globalCooldowns.cooldowns = new Map();
}

export class StudentSupportService {
  /**
   * Main service function to process a student's chat request.
   */
  public static async processChat(
    userId: string,
    conversationId: string,
    userMessage: string,
    feature: string = "STUDENT_CHAT"
  ): Promise<{ content: string; handoffTriggered?: boolean; error?: string }> {
    const now = Date.now();
    const model = getAiModel();

    // 1. Cooldown protection (cooldown: 3 seconds per request per user)
    const lastTime = globalCooldowns.cooldowns.get(userId);
    if (lastTime && now - lastTime < 3000) {
      return {
        content: "Please wait a moment before sending another message.",
        error: "COOLDOWN_LIMIT"
      };
    }
    globalCooldowns.cooldowns.set(userId, now);

    // 2. Cooldown and Rate limiting (max 15 request calls per minute per user)
    const oneMinuteAgo = new Date(now - 60000);
    const recentRequestsCount = await db.aIUsageLog.count({
      where: {
        userId,
        createdAt: { gte: oneMinuteAgo }
      }
    });
    if (recentRequestsCount >= 15) {
      await logAudit(userId, AuditAction.AI_CHAT_RATE_LIMIT, "127.0.0.1", "User hit per-minute chat rate limit.");
      return {
        content: "You've sent too many messages in a short period. Please wait a minute and try again.",
        error: "RATE_LIMIT_EXCEEDED"
      };
    }

    // 3. User Daily Token Limit Check
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const dailyTokensUsed = await db.aIUsageLog.aggregate({
      where: {
        userId,
        createdAt: { gte: startOfToday }
      },
      _sum: { totalTokens: true }
    });
    const dailyUsed = dailyTokensUsed._sum.totalTokens || 0;
    const dailyLimit = getDailyUserTokenLimit();
    if (dailyLimit > 0 && dailyUsed >= dailyLimit) {
      await logAudit(userId, AuditAction.AI_CHAT_LIMIT, "127.0.0.1", `User hit daily token limit. Used: ${dailyUsed}/${dailyLimit}`);
      return {
        content: "You have reached your daily limit for AI requests. Please consult your human counselor for further support.",
        error: "DAILY_LIMIT_REACHED"
      };
    }

    // 4. Global Monthly Token Limit Check
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const globalTokensUsed = await db.aIUsageLog.aggregate({
      where: {
        createdAt: { gte: startOfMonth }
      },
      _sum: { totalTokens: true }
    });
    const monthlyUsed = globalTokensUsed._sum.totalTokens || 0;
    const monthlyLimit = getGlobalMonthlyTokenLimit();
    if (monthlyLimit > 0 && monthlyUsed >= monthlyLimit) {
      return {
        content: "VidyarthiiConnect's global monthly AI capacity has been reached. AI Chat has temporarily fallen back to offline help resources.",
        error: "GLOBAL_LIMIT_REACHED"
      };
    }

    // 5. Redact prompt content
    const sanitizedMessage = redactSensitiveData(userMessage);

    // 6. Check FAQ rule-based layer first
    const faqResponse = matchFAQ(sanitizedMessage);
    if (faqResponse) {
      // FAQ hits bypass OpenAI API calls. Log as successful mock usage
      await logAiUsage({
        userId,
        provider: "FAQ_RULE_ENGINE",
        model: "STATIC_RULES",
        feature,
        promptTokens: 0,
        completionTokens: 0,
        requestStatus: "SUCCESS",
        latencyMs: Date.now() - now,
      });

      return { content: faqResponse };
    }

    // 7. Check counselor handoff trigger
    const handoffReason = detectHandoffTrigger(sanitizedMessage);
    let handoffTriggered = false;
    if (handoffReason) {
      handoffTriggered = true;
      // Auto escalate: create CounselorHandoff record later inside endpoint or handle here
      // We return the notification and handle creation inside api/ai/chat
    }

    // 8. Build prompt context (Universities, Course Costs, Consent logs)
    const context = await buildStudentContext(userId);

    // 9. Process Text Generation: OpenAI or mock fallback
    const startCallTime = Date.now();
    if (isAiEnabled() && openai) {
      try {
        const response = await openai.chat.completions.create({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT_STUDENT },
            {
              role: "user",
              content: `Student Profile Context:\n${context.studentProfileText}\n\nDocument vault checklist:\n${context.documentVaultText}\n\nVerified University database records:\n${context.verifiedUniversityDataText}\n\nStudent message: ${sanitizedMessage}`
            }
          ],
          max_tokens: 800,
          temperature: 0.2
        });

        const reply = response.choices[0]?.message?.content || "";
        const promptTokens = response.usage?.prompt_tokens || 0;
        const completionTokens = response.usage?.completion_tokens || 0;

        await logAiUsage({
          userId,
          provider: "OPENAI",
          model,
          feature,
          promptTokens,
          completionTokens,
          requestStatus: "SUCCESS",
          latencyMs: Date.now() - startCallTime,
        });

        return { content: reply, handoffTriggered };
      } catch (err: any) {
        console.error("OpenAI API call failed, falling back to Mock:", err);
        const fallbackReply = await generateMockResponse(sanitizedMessage, feature);
        
        await logAiUsage({
          userId,
          provider: "OPENAI",
          model,
          feature,
          promptTokens: 0,
          completionTokens: 0,
          requestStatus: "FAILED",
          errorMessage: err.message || String(err),
          latencyMs: Date.now() - startCallTime,
        });

        return { content: fallbackReply, handoffTriggered };
      }
    } else {
      // Mock Fallback
      const mockReply = await generateMockResponse(sanitizedMessage, feature);
      await logAiUsage({
        userId,
        provider: "MOCK",
        model: "MOCK_EXPLAINER",
        feature,
        promptTokens: 0,
        completionTokens: 0,
        requestStatus: "SUCCESS",
        latencyMs: Date.now() - startCallTime,
      });

      return { content: mockReply, handoffTriggered };
    }
  }
}
