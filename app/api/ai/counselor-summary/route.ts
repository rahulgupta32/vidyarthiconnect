import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { openai, isAiEnabled, getAiModel } from "@/lib/ai/openaiClient";
import { logAiUsage } from "@/lib/ai/aiUsageLogger";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "COUNSELOR" && session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized. Counselor or Admin access required." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { studentId, handoffId } = body;

    const startCallTime = Date.now();
    const model = getAiModel();
    let promptText = "";
    let systemPrompt = "You are a professional counselor assistant. Synthesize the provided student data into structured counseling summaries, missing checklists, and recommended next steps.";

    if (handoffId) {
      // Review handoff chat conversation
      const handoff = await db.counselorHandoff.findUnique({
        where: { id: handoffId },
        include: {
          conversation: {
            include: {
              messages: { orderBy: { createdAt: "asc" } }
            }
          },
          student: { select: { name: true, email: true } }
        }
      });

      if (!handoff) {
        return NextResponse.json({ error: "Handoff record not found" }, { status: 404 });
      }

      const chatHistory = handoff.conversation.messages.map(m => `${m.role}: ${m.content}`).join("\n");
      promptText = `Handoff Reason: ${handoff.reason}
Handoff Priority: ${handoff.priority}
Student Name: ${handoff.student.name}
Chat Conversation Log:\n${chatHistory}\n\nPlease summarize the above conversation:
1. Explain the reason for counselor handoff.
2. Outline the student's primary concerns and questions.
3. Suggest 3 immediate counselor action points.`;

    } else if (studentId) {
      // Summarize student profile details
      const student = await db.studentProfile.findUnique({
        where: { id: studentId },
        include: {
          user: { select: { name: true, email: true, phone: true } },
          documents: { select: { fileName: true, fileType: true, reviewStatus: true } },
          applications: { include: { university: { select: { name: true } }, course: { select: { title: true } } } }
        }
      });

      if (!student) {
        return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
      }

      const docsList = student.documents.map(d => `- ${d.fileName} (${d.fileType}) - Status: ${d.reviewStatus}`).join("\n") || "No documents uploaded";
      const appsList = student.applications.map(a => `- Application for ${a.course.title} at ${a.university.name} - Status: ${a.status}`).join("\n") || "No applications submitted";

      promptText = `Student Name: ${student.user.name}
Academics: Intended Degree: ${student.intendedDegree || "N/A"}, GPA: ${student.gpa || "N/A"}, English Score: ${student.englishTestType || "N/A"} - ${student.englishTestScore || "N/A"}
Budget Range: ${student.budgetRange || "N/A"}
Preferred Country: ${student.preferredCountry || "N/A"}
Document List:\n${docsList}
Current Applications:\n${appsList}

Please analyze this profile and provide:
1. Student Profile Summary.
2. Gaps / Missing document checklist.
3. Next Counselor Actions to guide this student.
4. Suggested counseling journal note draft.`;
    } else {
      return NextResponse.json({ error: "Provide either studentId or handoffId" }, { status: 400 });
    }

    if (isAiEnabled() && openai) {
      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: promptText }
        ],
        max_tokens: 1000,
        temperature: 0.2
      });

      const reply = response.choices[0]?.message?.content || "";
      const promptTokens = response.usage?.prompt_tokens || 0;
      const completionTokens = response.usage?.completion_tokens || 0;

      await logAiUsage({
        userId: session.id,
        provider: "OPENAI",
        model,
        feature: "COUNSELOR_ASSISTANT",
        promptTokens,
        completionTokens,
        requestStatus: "SUCCESS",
        latencyMs: Date.now() - startCallTime,
      });

      return NextResponse.json({ success: true, summary: reply });
    } else {
      // Mock Counselor Assistant response
      const mockReply = `**Counselor AI Summary (Offline Fallback)**:
- **Profile Check**: Student exhibits normal eligibility for undergraduate/postgraduate programs. Stated English and GPA meet baseline guidelines.
- **Cheklist Gaps**: Missing official passport transcripts or proof-of-funds bank letters. Recommend counselor checks document vault updates.
- **Recommended Action**: Schedule a call to review application draft and verify SOP paragraphs.`;

      await logAiUsage({
        userId: session.id,
        provider: "MOCK",
        model: "COUNSELOR_EXPLAINER",
        feature: "COUNSELOR_ASSISTANT",
        promptTokens: 0,
        completionTokens: 0,
        requestStatus: "SUCCESS",
        latencyMs: Date.now() - startCallTime,
      });

      return NextResponse.json({ success: true, summary: mockReply });
    }
  } catch (error: any) {
    console.error("Counselor summary API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
