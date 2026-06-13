import { db } from "../db/client";
import { AIConsentType, DataStatus } from "@prisma/client";
import { redactSensitiveData } from "./safetyGuardrails";

export interface AIContext {
  studentProfileText: string;
  documentVaultText: string;
  verifiedUniversityDataText: string;
}

export async function buildStudentContext(userId: string): Promise<AIContext> {
  // 1. Check profile analysis consent
  const profileConsent = await db.aIConsentRecord.findUnique({
    where: { userId_consentType: { userId, consentType: AIConsentType.PROFILE_ANALYSIS } }
  });

  const isProfileConsentGranted = profileConsent?.granted ?? false;
  let studentProfileText = "Student Profile: User has not granted profile analysis consent.";

  if (isProfileConsentGranted) {
    const student = await db.studentProfile.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (student) {
      studentProfileText = `Student Profile (Redacted):
- Intended Degree: ${student.intendedDegree || "Not Stated"}
- GPA: ${student.gpa || "Not Stated"}
- English Language Score: ${student.englishTestType || "N/A"} - ${student.englishTestScore || "N/A"}
- Preferred Country: ${student.preferredCountry || "Not Stated"}
- Budget Stated: ${redactSensitiveData(student.budgetRange || "Not Stated")}
- Funding Source: ${redactSensitiveData(student.fundingSource || "Not Stated")}
- Work Experience: ${redactSensitiveData(student.workExperience || "None")}
- Gap History: ${redactSensitiveData(student.gapHistory || "None")}
- Visa Refusal History: ${student.visaRefusalHistory ? "Yes" : "No"}`;
    }
  }

  // 2. Check document metadata analysis consent
  const docConsent = await db.aIConsentRecord.findUnique({
    where: { userId_consentType: { userId, consentType: AIConsentType.DOCUMENT_METADATA_ANALYSIS } }
  });

  const isDocConsentGranted = docConsent?.granted ?? false;
  let documentVaultText = "Document Vault Checklist: User has not granted document metadata analysis consent.";

  if (isDocConsentGranted) {
    const docs = await db.document.findMany({
      where: { student: { userId } },
      select: { fileName: true, fileType: true, reviewStatus: true }
    });

    if (docs.length === 0) {
      documentVaultText = "Document Vault: No documents uploaded yet.";
    } else {
      documentVaultText = "Uploaded Documents Metadata:\n" + docs.map(d => 
        `- File: ${d.fileName} | Type: ${d.fileType} | Review Status: ${d.reviewStatus}`
      ).join("\n");
    }
  }

  // 3. Gather verified and outdated university/course context (excluding pending/rejected)
  const courses = await db.course.findMany({
    where: {
      dataStatus: {
        in: [DataStatus.VERIFIED, DataStatus.OUTDATED]
      }
    },
    include: {
      university: {
        include: { country: true }
      },
      scholarships: {
        where: {
          dataStatus: { in: [DataStatus.VERIFIED, DataStatus.OUTDATED] }
        }
      },
      courseCost: true
    },
    take: 10 // Limit context size to prevent token bloating
  });

  let verifiedUniversityDataText = "Verified University Context:\n";
  if (courses.length === 0) {
    verifiedUniversityDataText += "No verified courses or universities are loaded in the database yet.";
  } else {
    verifiedUniversityDataText += courses.map(c => {
      const u = c.university;
      const statusLabel = c.dataStatus === DataStatus.VERIFIED ? "VERIFIED" : "OUTDATED";
      const verifiedDate = c.lastVerifiedAt ? new Date(c.lastVerifiedAt).toLocaleDateString() : "Unknown";
      
      const cost = c.courseCost;
      const isCostValid = cost && (cost.dataStatus === DataStatus.VERIFIED || cost.dataStatus === DataStatus.OUTDATED);
      const tuitionStr = isCostValid ? `${cost.currency} ${cost.tuitionFeePerYear.toLocaleString()}/yr` : `${c.currency} ${c.tuitionFee.toLocaleString()}/yr`;
      const livingStr = isCostValid ? `${cost.currency} ${cost.livingCostEstimate.toLocaleString()}/yr` : "Est. USD 12,000/yr";
      
      const scholarshipStr = c.scholarships && c.scholarships.length > 0 
        ? c.scholarships.map(s => `- ${s.name} (Value: ${s.currency} ${s.amount.toLocaleString()} | Type: ${s.scholarshipType})`).join("\n")
        : "None listed";

      return `- University: ${u.name} (Country: ${u.country.name}) [Status: ${statusLabel}, Verified Date: ${verifiedDate}]
  Course: ${c.title} (Degree: ${c.degreeLevel}, Duration: ${c.duration})
  Annual Tuition: ${tuitionStr}
  Estimated Living Cost: ${livingStr}
  English Requirement: ${c.englishRequirement || "Standard"}
  Minimum GPA required: ${c.minimumGpa || "N/A"}
  Scholarships:
  ${scholarshipStr}`;
    }).join("\n\n");
  }

  return {
    studentProfileText,
    documentVaultText,
    verifiedUniversityDataText
  };
}
