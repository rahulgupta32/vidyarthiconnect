interface FAQItem {
  keywords: string[];
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    keywords: ["upload", "documents", "document upload", "how to upload"],
    answer: "To upload your documents, go to the Document Vault in your Student Dashboard. Click on 'Upload Document', select your file (PDF, PNG, or JPEG under 5MB), choose the document type (e.g., Passport, Transcript), and submit. Once uploaded, your counselor will review it."
  },
  {
    keywords: ["what is noc", "noc meaning", "no objection certificate", "noc checklist"],
    answer: "NOC stands for No Objection Certificate. It is a mandatory document issued by the Ministry of Education, Science and Technology (MoEST) in Nepal, allowing students to study abroad and exchange currency for international tuition payments. You will need a verified university offer letter and payment receipts to apply for it."
  },
  {
    keywords: ["contact", "counselor", "talk to counselor", "message counselor"],
    answer: "You can contact your assigned counselor directly through the platform's secure Chat portal in the Student Workspace. There, you can send messages, receive task lists, and schedule 1-on-1 reviews of your documents."
  },
  {
    keywords: ["application status", "check status", "track application"],
    answer: "You can track your university applications on the Application Tracker screen in your Student Portal. The tracker displays a real-time progress timeline (e.g., drafting, counselor review, submitted, visa prep, etc.) as updated by your counselor."
  },
  {
    keywords: ["documents required", "required documents", "what documents do i need"],
    answer: "Generally required documents for study abroad applications include: 1) Valid Passport, 2) Academic Transcripts & Character Certificates, 3) English Proficiency test scores (IELTS/TOEFL/PTE), 4) Statement of Purpose (SOP), 5) Letters of Recommendation (LOR), and 6) Proof of Funds (Bank Balance Certificate)."
  },
  {
    keywords: ["scholarship matching", "how scholarship matching works", "scholarships work"],
    answer: "Our AI engine matches your profile (your stated GPA and English language score) with eligibility rules set by universities for their listed scholarships. The best matches appear under your search results and AI matches panel."
  },
  {
    keywords: ["how is total estimated cost calculated", "total cost calculation", "cost calculator"],
    answer: "Total Estimated Cost = Annual Tuition + Application Fee + Living Cost Estimate + Travel Cost Estimate + Health Insurance + Visa Fees. If you receive a scholarship, your Final Self-Finance amount is: Total Cost - Scholarship Amount."
  },
  {
    keywords: ["verified data", "verified university", "what verified means"],
    answer: "Verified data represents university listings and fee breakdowns that have been directly entered by university partners or manually verified against official university registers by our admin team. They carry a 'Verified Data' check badge."
  },
  {
    keywords: ["outdated data", "outdated university", "what outdated means"],
    answer: "Outdated data is flagged when a university page's listed fees or deadlines have not been confirmed for the current intake term. While shown for general info, we advise talking to your counselor before making decisions based on them."
  }
];

export function matchFAQ(question: string): string | null {
  const normalized = question.toLowerCase().trim();
  
  for (const faq of FAQS) {
    // Check if any keyword combination matches the query
    const isMatch = faq.keywords.some(kw => normalized.includes(kw));
    if (isMatch) {
      return faq.answer;
    }
  }
  
  return null;
}
