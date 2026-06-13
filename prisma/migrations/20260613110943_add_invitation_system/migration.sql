-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'COUNSELOR', 'PARTNER', 'ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFTING', 'DOCUMENTS_PENDING', 'COUNSELOR_REVIEW', 'SUBMITTED', 'AWAITING_DECISION', 'CONDITIONAL_OFFER', 'UNCONDITIONAL_OFFER', 'REJECTED', 'ACCEPTED', 'VISA_PREPARATION', 'VISA_SUBMITTED', 'VISA_APPROVED', 'VISA_REJECTED', 'ENROLLED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "DocumentReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'MANUALLY_VERIFIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'EXPECTED', 'INVOICED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'SUCCESS', 'ERROR', 'SECURITY');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('SAFE', 'MODERATE', 'AMBITIOUS');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('PARTNER', 'NON_PARTNER', 'PENDING_PARTNER', 'FORMER_PARTNER', 'PARTNERED', 'NON_PARTNERED');

-- CreateEnum
CREATE TYPE "DataStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'VERIFIED', 'OUTDATED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('PUBLIC', 'PRIVATE', 'GOVERNMENT', 'COMMUNITY', 'OTHER');

-- CreateEnum
CREATE TYPE "DegreeLevel" AS ENUM ('CERTIFICATE', 'DIPLOMA', 'BACHELOR', 'MASTER', 'PHD', 'POSTGRADUATE_DIPLOMA', 'FOUNDATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ScholarshipType" AS ENUM ('MERIT_BASED', 'NEED_BASED', 'COUNTRY_SPECIFIC', 'NEPAL_SPECIFIC', 'WOMEN_STEM', 'RESEARCH', 'SPORTS', 'EARLY_APPLICATION', 'UNIVERSITY_FUNDED', 'GOVERNMENT_FUNDED', 'OTHER');

-- CreateEnum
CREATE TYPE "CoverageType" AS ENUM ('FULL_TUITION', 'PARTIAL_TUITION', 'FIXED_AMOUNT_DISCOUNT', 'LIVING_COST_SUPPORT', 'ACCOMMODATION_SUPPORT', 'ONE_TIME_GRANT', 'STIPEND', 'OTHER');

-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('COLLEGE_SCORECARD', 'OPEN_COLLEGE_DATA', 'UNIVERSITY_DIRECT', 'RECRUITMENT_PARTNER_PLATFORM', 'CENTRAL_ADMISSION_SYSTEM', 'COMMON_APP', 'STUDY_LINK', 'PUBLIC_DATA_API', 'MANUAL', 'CSV_IMPORT', 'MOCK');

-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('API_KEY', 'OAUTH2', 'BASIC_AUTH', 'JWT', 'NONE');

-- CreateEnum
CREATE TYPE "ConnectorStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TESTING', 'ERROR', 'PENDING_CONFIGURATION', 'PENDING_CREDENTIALS', 'DISABLED');

-- CreateEnum
CREATE TYPE "SyncType" AS ENUM ('UNIVERSITIES', 'COURSES', 'SCHOLARSHIPS', 'FEES', 'ADMISSIONS_DATA', 'PROGRAMS', 'APPLICATION_STATUS', 'OFFER_LETTERS', 'ALL');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'PARTIAL_SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_CHANGES');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('DATA_SHARING', 'PRIVACY_POLICY', 'TERMS_OF_SERVICE');

-- CreateEnum
CREATE TYPE "DataRequestType" AS ENUM ('EXPORT', 'DELETION');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN', 'LOGOUT', 'SIGNUP', 'MFA_VERIFY', 'PROFILE_UPDATE', 'DOCUMENT_UPLOAD', 'DOCUMENT_REVIEW', 'APPLICATION_CREATE', 'APPLICATION_UPDATE', 'PAYMENT_CHECKOUT', 'PAYMENT_VERIFY', 'USER_MANAGE', 'SETTING_UPDATE', 'DATA_REQUEST', 'UNIVERSITY_MANAGE', 'COURSE_MANAGE', 'SCHOLARSHIP_MANAGE', 'COST_MANAGE', 'CSV_IMPORT', 'DATA_SOURCE_MANAGE', 'API_CREDENTIAL_MANAGE', 'SYNC_TRIGGER', 'SYNC_COMPLETE', 'SYNC_FAILED', 'IMPORTED_DATA_REVIEW', 'PARTNER_UPDATE_SUBMIT', 'PARTNER_UPDATE_REVIEW', 'DATA_MARK_OUTDATED', 'DATA_VERIFY', 'AI_CONSENT_UPDATE', 'AI_CHAT_CLEAR', 'AI_CHAT_RATE_LIMIT', 'AI_CHAT_LIMIT', 'COUNSELOR_HANDOFF_CREATE');

-- CreateEnum
CREATE TYPE "AIContextType" AS ENUM ('GENERAL_SUPPORT', 'DOCUMENT_CHECKLIST', 'SOP_HELP', 'VISA_NOC', 'UNIVERSITY_RECOMMENDATION', 'SCHOLARSHIP_HELP', 'SELF_FINANCE_HELP', 'APPLICATION_STATUS', 'PLATFORM_HELP', 'COUNSELOR_ASSISTANT', 'ADMIN_DATA_REVIEW');

-- CreateEnum
CREATE TYPE "AIMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AIConsentType" AS ENUM ('PROFILE_ANALYSIS', 'DOCUMENT_METADATA_ANALYSIS', 'SOP_TEXT_REVIEW', 'VISA_GUIDANCE', 'RECOMMENDATION_EXPLANATION', 'SCHOLARSHIP_ANALYSIS', 'SELF_FINANCE_ANALYSIS', 'CHAT_HISTORY');

-- CreateEnum
CREATE TYPE "HandoffStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "HandoffPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "dob" TIMESTAMP(3),
    "nationality" TEXT,
    "currentAddress" TEXT,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "device" TEXT,
    "ip" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "academicLevel" TEXT,
    "gpa" DOUBLE PRECISION,
    "englishTestType" TEXT,
    "englishTestScore" DOUBLE PRECISION,
    "intendedDegree" TEXT,
    "preferredCountry" TEXT,
    "budgetRange" TEXT,
    "fundingSource" TEXT,
    "gapHistory" TEXT,
    "workExperience" TEXT,
    "passportStatus" TEXT,
    "visaRefusalHistory" TEXT,
    "preferredIntake" TEXT,
    "guardianConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CounselorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialty" TEXT,
    "activeStudentsCount" INTEGER NOT NULL DEFAULT 0,
    "workloadLimit" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CounselorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityPartnerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "UniversityPartnerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "rankingWorld" INTEGER,
    "rankingCountry" INTEGER,
    "tuitionMin" DOUBLE PRECISION,
    "tuitionMax" DOUBLE PRECISION,
    "partnerStatus" "PartnerStatus" NOT NULL DEFAULT 'NON_PARTNER',
    "logoUrl" TEXT,
    "verifiedStatus" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "city" TEXT,
    "campus" TEXT,
    "websiteUrl" TEXT,
    "coverImageUrl" TEXT,
    "description" TEXT,
    "ranking" INTEGER,
    "institutionType" "InstitutionType" NOT NULL DEFAULT 'PUBLIC',
    "contactEmail" TEXT,
    "applicationPortalUrl" TEXT,
    "sourceUrl" TEXT,
    "sourceNote" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "dataStatus" "DataStatus" NOT NULL DEFAULT 'DRAFT',
    "lastSyncedAt" TIMESTAMP(3),
    "externalDataSourceId" TEXT,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "degreeLevel" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "tuitionFee" DOUBLE PRECISION NOT NULL,
    "applicationFee" DOUBLE PRECISION NOT NULL,
    "intakeDates" TEXT NOT NULL,
    "scholarshipAvailable" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "faculty" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "depositAmount" DOUBLE PRECISION,
    "applicationDeadline" TIMESTAMP(3),
    "englishRequirement" TEXT,
    "academicRequirement" TEXT,
    "minimumGpa" DOUBLE PRECISION,
    "courseDescription" TEXT,
    "careerOutcomes" TEXT,
    "postStudyWorkInfo" TEXT,
    "selfFinanceAccepted" BOOLEAN NOT NULL DEFAULT true,
    "sourceUrl" TEXT,
    "sourceNote" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "dataStatus" "DataStatus" NOT NULL DEFAULT 'DRAFT',
    "lastSyncedAt" TIMESTAMP(3),
    "externalDataSourceId" TEXT,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "universityId" TEXT NOT NULL,
    "courseId" TEXT,
    "country" TEXT,
    "scholarshipType" "ScholarshipType" NOT NULL DEFAULT 'MERIT_BASED',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "coverageType" "CoverageType" NOT NULL DEFAULT 'PARTIAL_TUITION',
    "eligibilityCriteria" TEXT,
    "requiredGpa" DOUBLE PRECISION,
    "requiredEnglishScore" DOUBLE PRECISION,
    "deadline" TIMESTAMP(3),
    "numberOfSeats" INTEGER,
    "isAutomatic" BOOLEAN NOT NULL DEFAULT false,
    "requiredDocuments" TEXT,
    "termsAndConditions" TEXT,
    "sourceUrl" TEXT,
    "sourceNote" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "dataStatus" "DataStatus" NOT NULL DEFAULT 'DRAFT',
    "lastSyncedAt" TIMESTAMP(3),
    "externalDataSourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseCost" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "tuitionFeePerYear" DOUBLE PRECISION NOT NULL,
    "totalTuitionFee" DOUBLE PRECISION NOT NULL,
    "applicationFee" DOUBLE PRECISION NOT NULL,
    "depositAmount" DOUBLE PRECISION NOT NULL,
    "visaFeeEstimate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "insuranceEstimate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "livingCostEstimate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "accommodationEstimate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "travelCostEstimate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "proofOfFundsRequirement" TEXT,
    "bankBalanceRequirement" DOUBLE PRECISION,
    "sponsorAllowed" BOOLEAN NOT NULL DEFAULT true,
    "educationLoanAccepted" BOOLEAN NOT NULL DEFAULT true,
    "installmentPaymentAvailable" BOOLEAN NOT NULL DEFAULT false,
    "partTimeWorkAllowed" BOOLEAN NOT NULL DEFAULT true,
    "refundPolicy" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "sourceUrl" TEXT,
    "sourceNote" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "dataStatus" "DataStatus" NOT NULL DEFAULT 'DRAFT',
    "lastSyncedAt" TIMESTAMP(3),
    "externalDataSourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalDataSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "providerType" "ProviderType" NOT NULL,
    "baseUrl" TEXT,
    "authType" "AuthType" NOT NULL,
    "connectorStatus" "ConnectorStatus" NOT NULL DEFAULT 'INACTIVE',
    "description" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalDataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalApiCredential" (
    "id" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "credentialName" TEXT NOT NULL,
    "encryptedApiKey" TEXT,
    "encryptedClientId" TEXT,
    "encryptedClientSecret" TEXT,
    "encryptedAccessToken" TEXT,
    "encryptedRefreshToken" TEXT,
    "scopes" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalApiCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSyncJob" (
    "id" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "syncType" "SyncType" NOT NULL,
    "status" "SyncStatus" NOT NULL DEFAULT 'QUEUED',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "recordsFetched" INTEGER NOT NULL DEFAULT 0,
    "recordsCreated" INTEGER NOT NULL DEFAULT 0,
    "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "triggeredBy" TEXT,

    CONSTRAINT "DataSyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalFieldMapping" (
    "id" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "externalFieldName" TEXT NOT NULL,
    "internalModel" TEXT NOT NULL,
    "internalFieldName" TEXT NOT NULL,
    "transformRule" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalFieldMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportedDataReview" (
    "id" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "syncJobId" TEXT,
    "targetModel" TEXT NOT NULL,
    "targetRecordId" TEXT,
    "rawPayload" TEXT NOT NULL,
    "normalizedPayload" TEXT NOT NULL,
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "universityId" TEXT,

    CONSTRAINT "ImportedDataReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerUpdateSubmission" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "targetModel" TEXT NOT NULL,
    "targetRecordId" TEXT,
    "updatePayload" TEXT NOT NULL,
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerUpdateSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "intake" TEXT NOT NULL,
    "counselorId" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFTING',
    "submittedDate" TIMESTAMP(3),
    "offerLetterStatus" TEXT,
    "visaStatus" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationTimeline" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storageProvider" TEXT NOT NULL DEFAULT 'mock',
    "storageKey" TEXT NOT NULL,
    "storageUrl" TEXT,
    "reviewStatus" "DocumentReviewStatus" NOT NULL DEFAULT 'PENDING',
    "approvalStatus" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "uploadedBy" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentAccessLog" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentSharePermission" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "universityId" TEXT,
    "counselorId" TEXT,
    "isGranted" BOOLEAN NOT NULL DEFAULT true,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentSharePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentComment" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "readStatus" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "readStatus" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "packageId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "features" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServicePackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commission" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "tuitionAmount" DOUBLE PRECISION NOT NULL,
    "commissionPercentage" DOUBLE PRECISION NOT NULL,
    "expectedAmount" DOUBLE PRECISION NOT NULL,
    "receivedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "paymentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "ip" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuspiciousActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "details" TEXT,
    "severity" TEXT NOT NULL,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuspiciousActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "universityId" TEXT,
    "type" "ConsentType" NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "DataRequestType" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "DataRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIRecommendation" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "missingRequirements" TEXT,
    "suggestedNextSteps" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShortlistedUniversity" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShortlistedUniversity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaChecklist" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "passport" BOOLEAN NOT NULL DEFAULT false,
    "offerLetter" BOOLEAN NOT NULL DEFAULT false,
    "academicDocs" BOOLEAN NOT NULL DEFAULT false,
    "englishScore" BOOLEAN NOT NULL DEFAULT false,
    "financialDocs" BOOLEAN NOT NULL DEFAULT false,
    "sopGte" BOOLEAN NOT NULL DEFAULT false,
    "medicalInsurance" BOOLEAN NOT NULL DEFAULT false,
    "visaForm" BOOLEAN NOT NULL DEFAULT false,
    "visaFeePaid" BOOLEAN NOT NULL DEFAULT false,
    "biometricsScheduled" BOOLEAN NOT NULL DEFAULT false,
    "interviewPrepared" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NOCChecklist" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "citizenship" BOOLEAN NOT NULL DEFAULT false,
    "offerLetter" BOOLEAN NOT NULL DEFAULT false,
    "academicTranscripts" BOOLEAN NOT NULL DEFAULT false,
    "paymentReceipt" BOOLEAN NOT NULL DEFAULT false,
    "nocStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "nocNumber" TEXT,
    "timeline" TEXT,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NOCChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contextType" "AIContextType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "AIMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIUsageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'OPENAI',
    "model" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "estimatedCost" DOUBLE PRECISION NOT NULL,
    "requestStatus" TEXT NOT NULL,
    "errorMessage" TEXT,
    "latencyMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIConsentRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentType" "AIConsentType" NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CounselorHandoff" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "counselorId" TEXT,
    "conversationId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "priority" "HandoffPriority" NOT NULL,
    "status" "HandoffStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CounselorHandoff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InviteUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "invitedById" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "universityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InviteUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_token_key" ON "UserSession"("token");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CounselorProfile_userId_key" ON "CounselorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UniversityPartnerProfile_userId_key" ON "UniversityPartnerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "University_name_key" ON "University"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CourseCost_courseId_key" ON "CourseCost"("courseId");

-- CreateIndex
CREATE INDEX "Application_studentId_idx" ON "Application"("studentId");

-- CreateIndex
CREATE INDEX "Application_counselorId_idx" ON "Application"("counselorId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Document_ownerId_idx" ON "Document"("ownerId");

-- CreateIndex
CREATE INDEX "Document_reviewStatus_idx" ON "Document"("reviewStatus");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Payment_studentId_idx" ON "Payment"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_paymentId_key" ON "Invoice"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Commission_applicationId_key" ON "Commission"("applicationId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AIRecommendation_studentId_idx" ON "AIRecommendation"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "VisaChecklist_applicationId_key" ON "VisaChecklist"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "NOCChecklist_applicationId_key" ON "NOCChecklist"("applicationId");

-- CreateIndex
CREATE INDEX "AIConversation_userId_idx" ON "AIConversation"("userId");

-- CreateIndex
CREATE INDEX "AIMessage_conversationId_idx" ON "AIMessage"("conversationId");

-- CreateIndex
CREATE INDEX "AIUsageLog_userId_idx" ON "AIUsageLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AIConsentRecord_userId_consentType_key" ON "AIConsentRecord"("userId", "consentType");

-- CreateIndex
CREATE UNIQUE INDEX "InviteUser_token_key" ON "InviteUser"("token");

-- CreateIndex
CREATE INDEX "InviteUser_token_idx" ON "InviteUser"("token");

-- CreateIndex
CREATE INDEX "InviteUser_email_idx" ON "InviteUser"("email");

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselorProfile" ADD CONSTRAINT "CounselorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityPartnerProfile" ADD CONSTRAINT "UniversityPartnerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityPartnerProfile" ADD CONSTRAINT "UniversityPartnerProfile_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "University" ADD CONSTRAINT "University_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "University" ADD CONSTRAINT "University_externalDataSourceId_fkey" FOREIGN KEY ("externalDataSourceId") REFERENCES "ExternalDataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campus" ADD CONSTRAINT "Campus_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_externalDataSourceId_fkey" FOREIGN KEY ("externalDataSourceId") REFERENCES "ExternalDataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_externalDataSourceId_fkey" FOREIGN KEY ("externalDataSourceId") REFERENCES "ExternalDataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseCost" ADD CONSTRAINT "CourseCost_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseCost" ADD CONSTRAINT "CourseCost_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalApiCredential" ADD CONSTRAINT "ExternalApiCredential_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "ExternalDataSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataSyncJob" ADD CONSTRAINT "DataSyncJob_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "ExternalDataSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalFieldMapping" ADD CONSTRAINT "ExternalFieldMapping_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "ExternalDataSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportedDataReview" ADD CONSTRAINT "ImportedDataReview_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "ExternalDataSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportedDataReview" ADD CONSTRAINT "ImportedDataReview_syncJobId_fkey" FOREIGN KEY ("syncJobId") REFERENCES "DataSyncJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportedDataReview" ADD CONSTRAINT "ImportedDataReview_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerUpdateSubmission" ADD CONSTRAINT "PartnerUpdateSubmission_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "CounselorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationTimeline" ADD CONSTRAINT "ApplicationTimeline_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAccessLog" ADD CONSTRAINT "DocumentAccessLog_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAccessLog" ADD CONSTRAINT "DocumentAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSharePermission" ADD CONSTRAINT "DocumentSharePermission_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentComment" ADD CONSTRAINT "DocumentComment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentComment" ADD CONSTRAINT "DocumentComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "CounselorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "ServicePackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuspiciousActivityLog" ADD CONSTRAINT "SuspiciousActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataRequest" ADD CONSTRAINT "DataRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIRecommendation" ADD CONSTRAINT "AIRecommendation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIRecommendation" ADD CONSTRAINT "AIRecommendation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShortlistedUniversity" ADD CONSTRAINT "ShortlistedUniversity_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShortlistedUniversity" ADD CONSTRAINT "ShortlistedUniversity_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaChecklist" ADD CONSTRAINT "VisaChecklist_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NOCChecklist" ADD CONSTRAINT "NOCChecklist_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMessage" ADD CONSTRAINT "AIMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsageLog" ADD CONSTRAINT "AIUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConsentRecord" ADD CONSTRAINT "AIConsentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselorHandoff" ADD CONSTRAINT "CounselorHandoff_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselorHandoff" ADD CONSTRAINT "CounselorHandoff_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselorHandoff" ADD CONSTRAINT "CounselorHandoff_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
