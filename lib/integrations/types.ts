import { ProviderType } from "@prisma/client";

export interface NormalizedUniversity {
  name: string;
  country: string;
  city?: string;
  campus?: string;
  websiteUrl?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  description?: string;
  ranking?: number;
  institutionType?: string; // PUBLIC, PRIVATE, GOVERNMENT, etc.
  partnerStatus?: string; // PARTNER, NON_PARTNER, etc.
  contactEmail?: string;
  applicationPortalUrl?: string;
  sourceUrl?: string;
  sourceNote?: string;
}

export interface NormalizedCourse {
  title: string;
  universityName: string;
  degreeLevel: string; // BACHELOR, MASTER, etc.
  duration: string;
  tuitionFee: number;
  applicationFee: number;
  intakeDates: string;
  scholarshipAvailable: boolean;
  description?: string;
  faculty?: string;
  currency?: string;
  depositAmount?: number;
  applicationDeadline?: string; // ISO string
  englishRequirement?: string;
  academicRequirement?: string;
  minimumGpa?: number;
  courseDescription?: string;
  careerOutcomes?: string;
  postStudyWorkInfo?: string;
  selfFinanceAccepted?: boolean;
  sourceUrl?: string;
  sourceNote?: string;
}

export interface NormalizedScholarship {
  name: string;
  universityName: string;
  courseTitle?: string;
  country?: string;
  scholarshipType: string; // MERIT_BASED, etc.
  amount: number;
  currency: string;
  coverageType: string; // FULL_TUITION, etc.
  eligibilityCriteria?: string;
  requiredGpa?: number;
  requiredEnglishScore?: number;
  deadline?: string; // ISO string
  numberOfSeats?: number;
  isAutomatic: boolean;
  requiredDocuments?: string;
  termsAndConditions?: string;
  sourceUrl?: string;
  sourceNote?: string;
}

export interface NormalizedCost {
  courseTitle: string;
  universityName: string;
  tuitionFeePerYear: number;
  totalTuitionFee: number;
  applicationFee: number;
  depositAmount: number;
  visaFeeEstimate: number;
  insuranceEstimate: number;
  livingCostEstimate: number;
  accommodationEstimate: number;
  travelCostEstimate: number;
  proofOfFundsRequirement?: string;
  bankBalanceRequirement?: number;
  sponsorAllowed: boolean;
  educationLoanAccepted: boolean;
  installmentPaymentAvailable: boolean;
  partTimeWorkAllowed: boolean;
  refundPolicy?: string;
  currency: string;
  sourceUrl?: string;
  sourceNote?: string;
}

export interface IConnector {
  providerType: ProviderType;
  testConnection(): Promise<{ success: boolean; message: string }>;
  fetchUniversities(): Promise<NormalizedUniversity[]>;
  fetchCourses(): Promise<NormalizedCourse[]>;
  fetchScholarships(): Promise<NormalizedScholarship[]>;
  fetchCosts(): Promise<NormalizedCost[]>;
}
