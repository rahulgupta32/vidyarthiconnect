export async function generateMockResponse(prompt: string, contextType: string): Promise<string> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 600));

  const query = prompt.toLowerCase();

  if (contextType === "SOP_HELP" || query.includes("sop") || query.includes("statement of purpose") || query.includes("essay")) {
    return `**Mock AI SOP Advisor**:
Drafting a strong Statement of Purpose (SOP) is critical for your university application:
1. **Introduction**: State your academic goals and why you chose this specific program.
2. **Academic background**: Detail your GPA (verified: yes), academic achievements, and how they prepare you.
3. **Why this university**: Highlight specific faculty research or campus resources.
4. **Career Goals**: Explain your post-study career plans and how this degree helps you.

*Disclaimer: AI guidance is for informational support only. Final decisions are made by universities. Speak to your assigned counselor to review your final draft.*`;
  }

  if (contextType === "VISA_NOC" || query.includes("noc") || query.includes("visa") || query.includes("embassy") || query.includes("permit")) {
    return `**Mock AI Visa & NOC Guide**:
For Nepalese students studying abroad:
- **Ministry of Education NOC**: You will need your unconditional offer letter and swift transfer receipts. Submit online via the MoEST portal.
- **Visa Filing checklist**: Collect your passport, academic records, English score certificate (e.g. IELTS/PTE), health insurance, and sponsor bank balance certificates showing at least 1-year of tuition and living expense coverage.

*Disclaimer: AI guidance is for informational support only. Final decisions are made by embassies and government offices. Speak to your counselor for visa mock interview prep.*`;
  }

  if (contextType === "DOCUMENT_CHECKLIST" || query.includes("missing document") || query.includes("checklist") || query.includes("upload")) {
    return `**Mock AI Document Checklist**:
Based on your document vault metadata check:
- Your **Academic Transcript** and **Character Certificate** are needed.
- If you've completed your IELTS/PTE, upload the score card to update your profile.
- You can upload these directly inside your 'Document Vault' tab.

*Disclaimer: Final document acceptance is decided by the university registrar.*`;
  }

  if (contextType === "UNIVERSITY_RECOMMENDATION" || query.includes("recommendation") || query.includes("fit") || query.includes("matching")) {
    return `**Mock AI University Matcher**:
Comparing your academic profile with our verified database:
- **Verified Match**: The University of Sydney fits your profile with an IELTS score check of 7.0 and fits within your self-finance budget limit.
- **Outdated Data Warning**: Oxford listings show outdated tuition fee levels. Speak to your counselor to verify the latest 2026/2027 fee tables.

*Disclaimer: AI guidance is for informational support only. Final decisions are made by universities.*`;
  }

  if (contextType === "SCHOLARSHIP_HELP" || query.includes("scholarship") || query.includes("discount") || query.includes("grant")) {
    return `**Mock AI Scholarship Assistant**:
Based on our current database records:
- **Sydney Vice-Chancellor Scholarship**: Covers partial tuition for students with a GPA above 3.5.
- **Presidential Fellowships**: Available for postgraduate degree levels. Applications must be filed at least 3 months prior to intake.

*Disclaimer: Scholarship approvals are decided solely by the university funding boards.*`;
  }

  if (contextType === "SELF_FINANCE_HELP" || query.includes("finance") || query.includes("loan") || query.includes("living cost") || query.includes("travel")) {
    return `**Mock AI Cost Explainer**:
Based on our standard fee calculator formulas:
- **Estimated Total Cost**: Tuition Fee + Living Expenses (~$15,000/yr) + Health Insurance (~$2,000/yr) + Travel (~$1,500) + Visa Fee ($510).
- **Self-Finance Estimate**: Total Cost minus any scholarship value. Nepal banks require education loans or sponsor certificates covering at least this amount for visa clearance.

*Disclaimer: Bank rates and embassy rules dictate final financial acceptance.*`;
  }

  return `**VidyarthiiConnect AI Assistant (Mock Mode)**:
Hello! As your AI Study Abroad Assistant, I can guide you through:
1. University discovery and verified tuition checks.
2. Nepal MoEST NOC certificate guidelines.
3. SOP outline writing recommendations.
4. Document vault review checklists.

What specific question can I answer for you today?

*Disclaimer: AI guidance is for informational support only. Final decisions are made by universities, embassies, government authorities, and relevant institutions. VidyarthiiConnect does not guarantee admission, scholarship, visa approval, NOC approval, or financial approval.*`;
}
