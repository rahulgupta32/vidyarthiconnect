import { IConnector, NormalizedUniversity, NormalizedCourse, NormalizedScholarship, NormalizedCost } from "./types";
import { ProviderType } from "@prisma/client";

export class MockGlobalUniversityConnector implements IConnector {
  public providerType = ProviderType.MOCK;

  public async testConnection(): Promise<{ success: boolean; message: string }> {
    return { success: true, message: "Mock connection test successful!" };
  }

  public async fetchUniversities(): Promise<NormalizedUniversity[]> {
    return [
      {
        name: "Oxford University Mock",
        country: "United Kingdom",
        city: "Oxford",
        campus: "Main Campus",
        websiteUrl: "https://www.ox.ac.uk",
        logoUrl: "/images/oxford_logo.png",
        coverImageUrl: "/images/oxford_cover.jpg",
        description: "A leading global research institution in England.",
        ranking: 3,
        institutionType: "PUBLIC",
        partnerStatus: "NON_PARTNER",
        contactEmail: "admissions@oxford.edu",
        applicationPortalUrl: "https://oxford.edu/apply",
        sourceUrl: "https://api.mockglobaluni.org/v1/oxford",
        sourceNote: "Synced via mock API connector",
      },
      {
        name: "Tokyo Institute of Technology Mock",
        country: "Japan",
        city: "Tokyo",
        campus: "Ookayama Campus",
        websiteUrl: "https://www.titech.ac.jp",
        logoUrl: "/images/titech_logo.png",
        coverImageUrl: "/images/titech_cover.jpg",
        description: "One of the top science and technology universities in Japan.",
        ranking: 55,
        institutionType: "PUBLIC",
        partnerStatus: "PENDING_PARTNER",
        contactEmail: "int.admissions@titech.ac.jp",
        applicationPortalUrl: "https://titech.ac.jp/apply",
        sourceUrl: "https://api.mockglobaluni.org/v1/titech",
        sourceNote: "Synced via mock API connector",
      },
    ];
  }

  public async fetchCourses(): Promise<NormalizedCourse[]> {
    return [
      {
        title: "Master of Science in Artificial Intelligence",
        universityName: "Oxford University Mock",
        degreeLevel: "MASTER",
        duration: "1 Year",
        tuitionFee: 39000,
        applicationFee: 150,
        intakeDates: "Fall (October)",
        scholarshipAvailable: true,
        description: "An intensive course focusing on deep learning, robotics, and natural language processing.",
        faculty: "Department of Computer Science",
        currency: "GBP",
        depositAmount: 5000,
        applicationDeadline: "2026-10-15T23:59:59Z",
        englishRequirement: "IELTS 7.5 / TOEFL 110",
        academicRequirement: "First class honors degree in Mathematics, CS, or Physics",
        minimumGpa: 3.8,
        courseDescription: "Advanced MS in CS program",
        careerOutcomes: "AI Research Scientist, Robotics Software Engineer, Data Scientist",
        postStudyWorkInfo: "2 Years UK Graduate Route Visa",
        selfFinanceAccepted: true,
        sourceUrl: "https://api.mockglobaluni.org/v1/oxford/courses",
        sourceNote: "Synced via mock API connector",
      },
      {
        title: "Bachelor of Science in Robotics and Automation",
        universityName: "Tokyo Institute of Technology Mock",
        degreeLevel: "BACHELOR",
        duration: "4 Years",
        tuitionFee: 8200,
        applicationFee: 50,
        intakeDates: "Spring (April)",
        scholarshipAvailable: true,
        description: "A comprehensive undergraduate degree covering kinematics, control systems, and mechanical design.",
        faculty: "School of Engineering",
        currency: "USD",
        depositAmount: 1000,
        applicationDeadline: "2026-09-30T23:59:59Z",
        englishRequirement: "TOEFL 80 / IELTS 6.5",
        academicRequirement: "High school transcripts with advanced physics & math",
        minimumGpa: 3.0,
        courseDescription: "Undergraduate degree in robotics engineering.",
        careerOutcomes: "Automation Developer, Manufacturing Engineer",
        postStudyWorkInfo: "Japan Work Visa upon employment",
        selfFinanceAccepted: true,
        sourceUrl: "https://api.mockglobaluni.org/v1/titech/courses",
        sourceNote: "Synced via mock API connector",
      },
    ];
  }

  public async fetchScholarships(): Promise<NormalizedScholarship[]> {
    return [
      {
        name: "Oxford AI Excellence Scholarship",
        universityName: "Oxford University Mock",
        courseTitle: "Master of Science in Artificial Intelligence",
        country: "United Kingdom",
        scholarshipType: "MERIT_BASED",
        amount: 20000,
        currency: "GBP",
        coverageType: "PARTIAL_TUITION",
        eligibilityCriteria: "First class degree, exceptional interview score",
        requiredGpa: 3.9,
        requiredEnglishScore: 112,
        deadline: "2026-06-01T23:59:59Z",
        numberOfSeats: 5,
        isAutomatic: false,
        requiredDocuments: "Personal statement, Research proposal, 2 Academic references",
        termsAndConditions: "Must maintain good academic standing",
        sourceUrl: "https://api.mockglobaluni.org/v1/oxford/scholarships",
        sourceNote: "Synced via mock API",
      },
      {
        name: "MEXT Scholarship Recommendation",
        universityName: "Tokyo Institute of Technology Mock",
        courseTitle: "Bachelor of Science in Robotics and Automation",
        country: "Japan",
        scholarshipType: "GOVERNMENT_FUNDED",
        amount: 15000,
        currency: "USD",
        coverageType: "FULL_TUITION",
        eligibilityCriteria: "Outstanding academic record, recommendation by embassy",
        requiredGpa: 3.5,
        requiredEnglishScore: 85,
        deadline: "2026-05-30T23:59:59Z",
        numberOfSeats: 2,
        isAutomatic: false,
        requiredDocuments: "Application form, Recommendation letters",
        termsAndConditions: "Fully funded including living allowance",
        sourceUrl: "https://api.mockglobaluni.org/v1/titech/scholarships",
        sourceNote: "Synced via mock API",
      },
    ];
  }

  public async fetchCosts(): Promise<NormalizedCost[]> {
    return [
      {
        courseTitle: "Master of Science in Artificial Intelligence",
        universityName: "Oxford University Mock",
        tuitionFeePerYear: 39000,
        totalTuitionFee: 39000,
        applicationFee: 150,
        depositAmount: 5000,
        visaFeeEstimate: 620,
        insuranceEstimate: 800,
        livingCostEstimate: 14000,
        accommodationEstimate: 9000,
        travelCostEstimate: 1200,
        proofOfFundsRequirement: "Bank statement showing £24,000",
        bankBalanceRequirement: 28000,
        sponsorAllowed: true,
        educationLoanAccepted: true,
        installmentPaymentAvailable: true,
        partTimeWorkAllowed: true,
        refundPolicy: "100% refund if visa rejected",
        currency: "GBP",
        sourceUrl: "https://api.mockglobaluni.org/v1/oxford/costs",
        sourceNote: "Synced via mock API",
      },
      {
        courseTitle: "Bachelor of Science in Robotics and Automation",
        universityName: "Tokyo Institute of Technology Mock",
        tuitionFeePerYear: 8200,
        totalTuitionFee: 32800,
        applicationFee: 50,
        depositAmount: 1000,
        visaFeeEstimate: 200,
        insuranceEstimate: 500,
        livingCostEstimate: 10000,
        accommodationEstimate: 6000,
        travelCostEstimate: 1800,
        proofOfFundsRequirement: "Proof of financial capability or scholarship letter",
        bankBalanceRequirement: 12000,
        sponsorAllowed: true,
        educationLoanAccepted: false,
        installmentPaymentAvailable: false,
        partTimeWorkAllowed: true,
        refundPolicy: "Refundable up to 2 weeks before classes start",
        currency: "USD",
        sourceUrl: "https://api.mockglobaluni.org/v1/titech/costs",
        sourceNote: "Synced via mock API",
      },
    ];
  }

  public async fetchFees(): Promise<NormalizedCost[]> {
    return this.fetchCosts();
  }
}
