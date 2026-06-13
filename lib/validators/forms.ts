import { z } from "zod";

export const SignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(7, "Phone number must be valid").max(15).optional().or(z.literal("")),
  dob: z.string().optional(),
  nationality: z.string().optional(),
  currentAddress: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const StudentProfileSchema = z.object({
  academicLevel: z.string().nullable().optional(),
  gpa: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().min(0).max(4.0).nullable().optional()
  ),
  englishTestType: z.string().nullable().optional(),
  englishTestScore: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().min(0).max(120).nullable().optional()
  ),
  intendedDegree: z.string().nullable().optional(),
  preferredCountry: z.string().nullable().optional(),
  budgetRange: z.string().nullable().optional(),
  fundingSource: z.string().nullable().optional(),
  gapHistory: z.string().nullable().optional(),
  workExperience: z.string().nullable().optional(),
  passportStatus: z.string().nullable().optional(),
  visaRefusalHistory: z.string().nullable().optional(),
  preferredIntake: z.string().nullable().optional(),
  guardianConsent: z.boolean().default(false),
});

export const DocumentUploadSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileType: z.string().min(1, "Document type is required"),
  fileSize: z.number().int().positive("File size must be positive"),
  mimeType: z.string().min(1, "Mime type is required"),
  storageKey: z.string().min(1, "Storage key is required"),
  storageUrl: z.string().optional(),
});

export const ApplicationSchema = z.object({
  universityId: z.string().min(1, "University is required"),
  courseId: z.string().min(1, "Course is required"),
  intake: z.string().min(2, "Intake date is required"),
  notes: z.string().optional(),
});

export const ApplicationUpdateSchema = z.object({
  status: z.string().optional(),
  notes: z.string().optional(),
  counselorId: z.string().optional().nullable(),
});

export const CheckoutSchema = z.object({
  packageId: z.string().min(1, "Package is required"),
  amount: z.number().positive("Amount must be positive"),
  method: z.string().min(2, "Payment method is required"),
  transactionId: z.string().optional(),
});

// ==========================================
// NEW UNIVERSITY & DATA MANAGEMENT SCHEMAS
// ==========================================

export const UniversitySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  countryId: z.string().min(1, "Country is required"),
  city: z.string().optional().nullable(),
  campus: z.string().optional().nullable(),
  websiteUrl: z.string().url("Invalid website URL").optional().or(z.literal("")).nullable(),
  logoUrl: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  ranking: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().int().positive().nullable().optional()
  ),
  institutionType: z.enum(["PUBLIC", "PRIVATE", "GOVERNMENT", "COMMUNITY", "OTHER"]).default("PUBLIC"),
  partnerStatus: z.enum(["PARTNER", "NON_PARTNER", "PENDING_PARTNER", "FORMER_PARTNER", "PARTNERED", "NON_PARTNERED"]).default("NON_PARTNER"),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")).nullable(),
  applicationPortalUrl: z.string().url("Invalid application portal link").optional().or(z.literal("")).nullable(),
  sourceUrl: z.string().optional().nullable(),
  sourceNote: z.string().optional().nullable(),
  dataStatus: z.enum(["DRAFT", "PENDING_REVIEW", "VERIFIED", "OUTDATED", "REJECTED"]).default("DRAFT"),
});

export const CourseSchema = z.object({
  title: z.string().min(2, "Title is required"),
  universityId: z.string().min(1, "University ID is required"),
  degreeLevel: z.string().min(2, "Degree level is required"),
  duration: z.string().min(1, "Duration is required"),
  tuitionFee: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().nonnegative("Tuition fee cannot be negative")
  ),
  applicationFee: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().nonnegative("Application fee cannot be negative")
  ),
  intakeDates: z.string().min(2, "Intake dates are required"),
  scholarshipAvailable: z.boolean().default(false),
  description: z.string().optional().nullable(),
  
  faculty: z.string().optional().nullable(),
  currency: z.string().default("USD"),
  depositAmount: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().nonnegative().nullable().optional()
  ),
  applicationDeadline: z.string().optional().nullable(),
  englishRequirement: z.string().optional().nullable(),
  academicRequirement: z.string().optional().nullable(),
  minimumGpa: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().min(0).max(4.0).nullable().optional()
  ),
  courseDescription: z.string().optional().nullable(),
  careerOutcomes: z.string().optional().nullable(),
  postStudyWorkInfo: z.string().optional().nullable(),
  selfFinanceAccepted: z.boolean().default(true),
  sourceUrl: z.string().optional().nullable(),
  sourceNote: z.string().optional().nullable(),
  dataStatus: z.enum(["DRAFT", "PENDING_REVIEW", "VERIFIED", "OUTDATED", "REJECTED"]).default("DRAFT"),
});

export const ScholarshipSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional().nullable(),
  amount: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().nonnegative("Amount must be positive")
  ),
  universityId: z.string().min(1, "University ID is required"),
  courseId: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  scholarshipType: z.enum([
    "MERIT_BASED", "NEED_BASED", "COUNTRY_SPECIFIC", "NEPAL_SPECIFIC",
    "WOMEN_STEM", "RESEARCH", "SPORTS", "EARLY_APPLICATION",
    "UNIVERSITY_FUNDED", "GOVERNMENT_FUNDED", "OTHER"
  ]).default("MERIT_BASED"),
  currency: z.string().default("USD"),
  coverageType: z.enum([
    "FULL_TUITION", "PARTIAL_TUITION", "FIXED_AMOUNT_DISCOUNT",
    "LIVING_COST_SUPPORT", "ACCOMMODATION_SUPPORT", "ONE_TIME_GRANT",
    "STIPEND", "OTHER"
  ]).default("PARTIAL_TUITION"),
  eligibilityCriteria: z.string().optional().nullable(),
  requiredGpa: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().min(0).max(4.0).nullable().optional()
  ),
  requiredEnglishScore: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().nullable().optional()
  ),
  deadline: z.string().optional().nullable(),
  numberOfSeats: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().int().positive().nullable().optional()
  ),
  isAutomatic: z.boolean().default(false),
  requiredDocuments: z.string().optional().nullable(),
  termsAndConditions: z.string().optional().nullable(),
  sourceUrl: z.string().optional().nullable(),
  sourceNote: z.string().optional().nullable(),
  dataStatus: z.enum(["DRAFT", "PENDING_REVIEW", "VERIFIED", "OUTDATED", "REJECTED"]).default("DRAFT"),
});

export const CourseCostSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  universityId: z.string().min(1, "University ID is required"),
  tuitionFeePerYear: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().nonnegative()
  ),
  totalTuitionFee: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().nonnegative()
  ),
  applicationFee: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().nonnegative()
  ),
  depositAmount: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().nonnegative()
  ),
  visaFeeEstimate: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().nonnegative()
  ),
  insuranceEstimate: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().nonnegative()
  ),
  livingCostEstimate: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().nonnegative()
  ),
  accommodationEstimate: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().nonnegative()
  ),
  travelCostEstimate: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().nonnegative()
  ),
  proofOfFundsRequirement: z.string().optional().nullable(),
  bankBalanceRequirement: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().nonnegative().nullable().optional()
  ),
  sponsorAllowed: z.boolean().default(true),
  educationLoanAccepted: z.boolean().default(true),
  installmentPaymentAvailable: z.boolean().default(false),
  partTimeWorkAllowed: z.boolean().default(true),
  refundPolicy: z.string().optional().nullable(),
  currency: z.string().default("USD"),
  sourceUrl: z.string().optional().nullable(),
  sourceNote: z.string().optional().nullable(),
  dataStatus: z.enum(["DRAFT", "PENDING_REVIEW", "VERIFIED", "OUTDATED", "REJECTED"]).default("DRAFT"),
});

export const ExternalDataSourceSchema = z.object({
  name: z.string().min(2, "Name is required"),
  providerType: z.enum([
    "COLLEGE_SCORECARD", "OPEN_COLLEGE_DATA", "UNIVERSITY_DIRECT",
    "RECRUITMENT_PARTNER_PLATFORM", "CENTRAL_ADMISSION_SYSTEM",
    "COMMON_APP", "STUDY_LINK", "PUBLIC_DATA_API", "MANUAL", "CSV_IMPORT", "MOCK"
  ]),
  baseUrl: z.string().url("Invalid base URL").optional().or(z.literal("")).nullable(),
  authType: z.enum(["API_KEY", "OAUTH2", "BASIC_AUTH", "JWT", "NONE"]),
  connectorStatus: z.enum([
    "ACTIVE", "INACTIVE", "TESTING", "ERROR",
    "PENDING_CONFIGURATION", "PENDING_CREDENTIALS", "DISABLED"
  ]).default("INACTIVE"),
  description: z.string().optional().nullable(),
});

export const ExternalApiCredentialSchema = z.object({
  dataSourceId: z.string().min(1, "Data Source is required"),
  credentialName: z.string().min(2, "Credential Name is required"),
  encryptedApiKey: z.string().optional().nullable(),
  encryptedClientId: z.string().optional().nullable(),
  encryptedClientSecret: z.string().optional().nullable(),
  encryptedAccessToken: z.string().optional().nullable(),
  encryptedRefreshToken: z.string().optional().nullable(),
  scopes: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
});

export const FieldMappingSchema = z.object({
  dataSourceId: z.string().min(1, "Data Source is required"),
  externalFieldName: z.string().min(1, "External field name is required"),
  internalModel: z.string().min(1, "Internal model is required"),
  internalFieldName: z.string().min(1, "Internal field name is required"),
  transformRule: z.string().optional().nullable(),
  required: z.boolean().default(false),
});

export const CSVImportSchema = z.object({
  university_name: z.string().min(1, "University Name is required"),
  country: z.string().min(1, "Country is required"),
  city: z.string().optional(),
  campus: z.string().optional(),
  course_name: z.string().min(1, "Course Name is required"),
  degree_level: z.string().min(1, "Degree Level is required"),
  tuition_fee: z.coerce.number().positive(),
  currency: z.string().default("USD"),
  intake: z.string().optional(),
  deadline: z.string().optional(),
  scholarship_available: z.coerce.boolean().default(false),
  scholarship_name: z.string().optional(),
  scholarship_amount: z.coerce.number().optional(),
  scholarship_type: z.string().optional(),
  self_finance_available: z.coerce.boolean().default(true),
  living_cost_estimate: z.coerce.number().optional(),
  application_fee: z.coerce.number().optional(),
  deposit_amount: z.coerce.number().optional(),
  source_url: z.string().optional(),
  last_verified_date: z.string().optional(),
});

export const PartnerUpdateSubmissionSchema = z.object({
  universityId: z.string().min(1, "University ID is required"),
  targetModel: z.enum(["Course", "Scholarship", "CourseCost", "University"]),
  targetRecordId: z.string().optional().nullable(),
  updatePayload: z.string().min(2, "Update Payload must be valid JSON"),
});

export const ImportedDataReviewSchema = z.object({
  reviewStatus: z.enum(["PENDING_REVIEW", "APPROVED", "REJECTED", "NEEDS_CHANGES"]),
  reviewNotes: z.string().optional(),
});

export const TriggerSyncSchema = z.object({
  syncType: z.enum(["UNIVERSITIES", "COURSES", "SCHOLARSHIPS", "FEES", "ADMISSIONS_DATA", "PROGRAMS", "APPLICATION_STATUS", "OFFER_LETTERS", "ALL"]).default("ALL"),
});
