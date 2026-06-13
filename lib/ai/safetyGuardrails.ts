import { AuditAction } from "@prisma/client";
import { db } from "../db/client";
import { logSuspicious } from "../security/audit";

const PASSPORT_REGEX = /\b[A-Z0-9]{7,9}\b/gi; // Simple pattern matching passport strings
const CITIZENSHIP_REGEX = /\b\d{2}-\d{2}-\d{2}-\d{5}\b/g; // Nepal citizenship ID format (e.g. 12-34-56-78901)
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g; // Phone pattern
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export const SYSTEM_PROMPT_STUDENT = `You are VidyarthiiConnect's AI Study Abroad Assistant, helping Nepali students.
Always follow these rules:
1. Be friendly, encouraging, clear, and specific.
2. AI guidance is for informational support only. Final decisions are made by universities, embassies, government authorities, and relevant institutions.
3. NEVER guarantee university admission, scholarship approval, visa approval, NOC approval, or financial/loan approvals. Do not provide legal or financial guarantees.
4. When talking about universities, courses, costs, or scholarships, base your information on verified university registry database context provided in the prompt.
5. If data is VERIFIED, mention it. If it is OUTDATED, clearly label it as outdated. Do not assume or hallucinate information about universities that are not in the context.
6. Encourage students to speak to their assigned counselor for final application reviews or visa preparations.
7. If a student mentions visa refusal history, uncertainty about bank documents, legal immigration issues, health problems, or conflicting university data, suggest they click "Ask counselor" to escalate to a human advisor.`;

export function redactSensitiveData(text: string): string {
  if (!text) return text;
  return text
    .replace(EMAIL_REGEX, "[EMAIL_REDACTED]")
    .replace(PHONE_REGEX, "[PHONE_REDACTED]")
    .replace(CITIZENSHIP_REGEX, "[IDENTIFIER_REDACTED]")
    .replace(PASSPORT_REGEX, (match) => {
      // Avoid redacting common abbreviations
      const commonWords = ["GPA", "SOP", "NOC", "IELTS", "TOEFL", "GRE", "GMAT", "USD", "AUD", "NPR", "CAD", "GBP"];
      if (commonWords.includes(match.toUpperCase())) return match;
      return "[CONFIDENTIAL_INFO_REDACTED]";
    });
}

/**
 * Checks if the student's message contains counselor handoff triggers.
 * @returns reason string if handoff is triggered, null otherwise.
 */
export function detectHandoffTrigger(message: string): string | null {
  const normalized = message.toLowerCase();
  
  if (normalized.includes("refusal") || normalized.includes("refused") || normalized.includes("rejected visa")) {
    return "Student has visa refusal history.";
  }
  if (normalized.includes("bank balance") || normalized.includes("proof of funds") || normalized.includes("sponsor") || normalized.includes("fake balance") || normalized.includes("financial document")) {
    return "Student is uncertain about financial documents or proof of funds.";
  }
  if (normalized.includes("illegal") || normalized.includes("lawsuit") || normalized.includes("court") || normalized.includes("arrest") || normalized.includes("convict")) {
    return "Legal or immigration-sensitive topics detected.";
  }
  if (normalized.includes("medical") || normalized.includes("disease") || normalized.includes("disability") || normalized.includes("health condition") || normalized.includes("hospital")) {
    return "Student asked a medical or health-related question.";
  }
  if (normalized.includes("conflict") || normalized.includes("wrong cost") || normalized.includes("different cost") || normalized.includes("website says different")) {
    return "Conflicting university data reported.";
  }
  if (normalized.includes("final decision") || normalized.includes("should i apply") || normalized.includes("commit") || normalized.includes("guarantee")) {
    return "Student asked for high-risk application guarantees.";
  }
  if (normalized.includes("counselor") || normalized.includes("human") || normalized.includes("talk to a person") || normalized.includes("speak to counselor") || normalized.includes("ask counselor")) {
    return "Student explicitly requested human counselor assistance.";
  }
  
  return null;
}
