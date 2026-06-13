import { OpenAI } from "openai";

const apiKey = process.env.OPENAI_API_KEY || "";
const isEnabledEnv = process.env.OPENAI_ASSISTANT_ENABLED === "true";
const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const dailyLimit = process.env.OPENAI_DAILY_TOKEN_LIMIT_PER_USER
  ? (parseInt(process.env.OPENAI_DAILY_TOKEN_LIMIT_PER_USER, 10) || 0)
  : 0;

const monthlyLimit = process.env.OPENAI_MONTHLY_TOKEN_LIMIT_GLOBAL
  ? (parseInt(process.env.OPENAI_MONTHLY_TOKEN_LIMIT_GLOBAL, 10) || 0)
  : 0;

export const openai = apiKey && apiKey !== "mock-key" && isEnabledEnv
  ? new OpenAI({ apiKey })
  : null;

export function isAiEnabled(): boolean {
  return !!openai;
}

export function getAiModel(): string {
  return model;
}

export function getDailyUserTokenLimit(): number {
  return dailyLimit;
}

export function getGlobalMonthlyTokenLimit(): number {
  return monthlyLimit;
}
