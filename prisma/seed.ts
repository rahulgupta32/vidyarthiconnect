import { PrismaClient, UserRole, ApplicationStatus, DocumentReviewStatus, PaymentStatus, CommissionStatus, NotificationType, RiskLevel, PartnerStatus, ConsentType, AuditAction, DataStatus, InstitutionType, DegreeLevel, ScholarshipType, CoverageType, ProviderType, AuthType, ConnectorStatus, SyncType, SyncStatus, ReviewStatus, AIContextType, AIMessageRole, AIConsentType, HandoffStatus, HandoffPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Service Packages
  console.log('Seeding Service Packages...');
  const packages = [
    {
      id: 'pkg-free',
      name: 'Free Plan',
      price: 0,
      description: 'Basic university discovery and document organization',
      features: 'University Search, Document Vault, General FAQ Bot',
    },
    {
      id: 'pkg-premium-app',
      name: 'Premium Application Package',
      price: 15000, // NPR 15,000
      description: 'Dedicated counseling and up to 3 university applications',
      features: '1-on-1 Counselor, Document Verification, 3 Applications, AI SOP Reviewer',
    },
    {
      id: 'pkg-visa-guidance',
      name: 'Visa Guidance Package',
      price: 10000, // NPR 10,000
      description: 'Comprehensive visa processing and mock interviews',
      features: 'Visa Checklist, Financial Document Audit, 2 Mock Visa Interviews, NOC Assistance',
    },
    {
      id: 'pkg-end-to-end',
      name: 'Complete End-to-End Package',
      price: 25000, // NPR 25,000
      description: 'Full support from university selection to visa approval',
      features: 'Unlimited Applications, Dedicated Counselor, Full Visa Guidance, SOP Assistant, Mock Interviews, NOC Prep',
    },
  ];

  for (const pkg of packages) {
    await prisma.servicePackage.upsert({
      where: { id: pkg.id },
      update: pkg,
      create: pkg,
    });
  }

  // 2. Users and Profiles
  console.log('Seeding Users & Profiles...');

  // SuperAdmin
  const superadminUser = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      email: 'superadmin@example.com',
      passwordHash,
      role: UserRole.SUPERADMIN,
      name: 'Suresh Adhikari',
      phone: '+977-9851000001',
      dob: new Date('1985-05-15'),
      nationality: 'Nepali',
      currentAddress: 'Kathmandu, Nepal',
    },
  });

  // Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      role: UserRole.ADMIN,
      name: 'Anjali Sharma',
      phone: '+977-9851000002',
      dob: new Date('1990-08-20'),
      nationality: 'Nepali',
      currentAddress: 'Lalitpur, Nepal',
    },
  });

  // Counselor
  const counselorUser = await prisma.user.upsert({
    where: { email: 'counselor@example.com' },
    update: {},
    create: {
      email: 'counselor@example.com',
      passwordHash,
      role: UserRole.COUNSELOR,
      name: 'Binod Karki',
      phone: '+977-9851000003',
      dob: new Date('1988-12-10'),
      nationality: 'Nepali',
      currentAddress: 'Bhaktapur, Nepal',
    },
  });

  const counselorProfile = await prisma.counselorProfile.upsert({
    where: { userId: counselorUser.id },
    update: {},
    create: {
      userId: counselorUser.id,
      specialty: 'USA & Australia Higher Education',
      workloadLimit: 20,
      activeStudentsCount: 1,
    },
  });

  // Student
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      passwordHash,
      role: UserRole.STUDENT,
      name: 'Rohan Shrestha',
      phone: '+977-9841123456',
      dob: new Date('2002-04-12'),
      nationality: 'Nepali',
      currentAddress: 'Koteshwor, Kathmandu',
    },
  });

  const studentProfile = await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      academicLevel: 'Bachelor',
      gpa: 3.65,
      englishTestType: 'IELTS',
      englishTestScore: 7.5,
      intendedDegree: 'Master',
      preferredCountry: 'USA',
      budgetRange: '$20,000 - $35,000',
      fundingSource: 'Parent Savings & Education Loan',
      gapHistory: 'No study gap',
      workExperience: '1 year as Junior Software Engineer',
      passportStatus: 'Valid',
      visaRefusalHistory: 'No prior visa refusals',
      preferredIntake: 'Fall 2026',
      guardianConsent: true,
    },
  });

  // 3. Countries, Universities, Campuses, Courses, Scholarships
  console.log('Seeding Countries & Universities...');
  
  // Countries
  const usa = await prisma.country.upsert({
    where: { code: 'US' },
    update: {},
    create: { name: 'United States', code: 'US' },
  });

  const aus = await prisma.country.upsert({
    where: { code: 'AU' },
    update: {},
    create: { name: 'Australia', code: 'AU' },
  });

  // Universities
  const uniMIT = await prisma.university.upsert({
    where: { name: 'Massachusetts Institute of Technology (MIT)' },
    update: {},
    create: {
      name: 'Massachusetts Institute of Technology (MIT)',
      countryId: usa.id,
      rankingWorld: 1,
      rankingCountry: 1,
      tuitionMin: 55000,
      tuitionMax: 65000,
      partnerStatus: PartnerStatus.NON_PARTNERED,
      logoUrl: '/images/mit_logo.png',
      verifiedStatus: true,
    },
  });

  const uniSydney = await prisma.university.upsert({
    where: { name: 'University of Sydney' },
    update: {},
    create: {
      name: 'University of Sydney',
      countryId: aus.id,
      rankingWorld: 18,
      rankingCountry: 2,
      tuitionMin: 35000,
      tuitionMax: 48000,
      partnerStatus: PartnerStatus.PARTNERED,
      logoUrl: '/images/sydney_logo.png',
      verifiedStatus: true,
    },
  });

  // Partner User
  const partnerUser = await prisma.user.upsert({
    where: { email: 'partner@example.com' },
    update: {},
    create: {
      email: 'partner@example.com',
      passwordHash,
      role: UserRole.PARTNER,
      name: 'Dr. Sarah Jenkins',
      phone: '+61-2-9351-2222',
      dob: new Date('1976-03-22'),
      nationality: 'Australian',
      currentAddress: 'Sydney, NSW, Australia',
    },
  });

  await prisma.universityPartnerProfile.upsert({
    where: { userId: partnerUser.id },
    update: {},
    create: {
      userId: partnerUser.id,
      universityId: uniSydney.id,
    },
  });

  // Campuses
  const campusMIT = await prisma.campus.create({
    data: {
      name: 'Cambridge Campus',
      universityId: uniMIT.id,
      location: 'Cambridge, Massachusetts',
    },
  });

  const campusSydney = await prisma.campus.create({
    data: {
      name: 'Camperdown Main Campus',
      universityId: uniSydney.id,
      location: 'Sydney, New South Wales',
    },
  });

  // Courses
  console.log('Seeding Courses & Scholarships...');
  
  const courseCS = await prisma.course.create({
    data: {
      title: 'Master of Science in Computer Science',
      universityId: uniMIT.id,
      degreeLevel: 'Master',
      duration: '2 Years',
      tuitionFee: 57500,
      applicationFee: 75,
      intakeDates: 'Fall (September)',
      scholarshipAvailable: true,
      description: 'An advanced curriculum focusing on Artificial Intelligence, System Architecture, and Algorithms.',
    },
  });

  const courseSydneyCS = await prisma.course.create({
    data: {
      title: 'Master of Information Technology (Software Engineering)',
      universityId: uniSydney.id,
      degreeLevel: 'Master',
      duration: '2 Years',
      tuitionFee: 42000,
      applicationFee: 125,
      intakeDates: 'Semester 1 (Feb), Semester 2 (Aug)',
      scholarshipAvailable: true,
      description: 'Designed for computing professionals looking to accelerate their career in software design and cloud systems.',
    },
  });

  // Scholarships
  await prisma.scholarship.create({
    data: {
      name: 'Presidential Graduate Fellowship',
      description: 'Fully funded tuition plus stipend for top international students',
      amount: 60000,
      courseId: courseCS.id,
      universityId: uniMIT.id,
      dataStatus: DataStatus.VERIFIED,
    },
  });

  await prisma.scholarship.create({
    data: {
      name: 'Vice-Chancellor International Scholarship',
      description: 'Partial tuition scholarship for academic excellence',
      amount: 10000,
      courseId: courseSydneyCS.id,
      universityId: uniSydney.id,
      dataStatus: DataStatus.VERIFIED,
    },
  });

  // 4. Applications and check lists
  console.log('Seeding Applications...');
  const application = await prisma.application.create({
    data: {
      studentId: studentProfile.id,
      universityId: uniSydney.id,
      courseId: courseSydneyCS.id,
      intake: 'Feb 2027',
      counselorId: counselorProfile.id,
      status: ApplicationStatus.COUNSELOR_REVIEW,
      notes: 'Rohan is highly interested in the Software Engineering track. Document review is pending.',
    },
  });

  await prisma.applicationTimeline.create({
    data: {
      applicationId: application.id,
      status: ApplicationStatus.DRAFTING,
      note: 'Application drafted by student.',
    },
  });

  await prisma.applicationTimeline.create({
    data: {
      applicationId: application.id,
      status: ApplicationStatus.COUNSELOR_REVIEW,
      note: 'Submitted to counselor for document verification.',
    },
  });

  // Checklists
  await prisma.visaChecklist.create({
    data: {
      applicationId: application.id,
      passport: true,
      offerLetter: false,
      academicDocs: true,
      englishScore: true,
      financialDocs: false,
      sopGte: false,
      medicalInsurance: false,
      visaForm: false,
      visaFeePaid: false,
    },
  });

  await prisma.nOCChecklist.create({
    data: {
      applicationId: application.id,
      citizenship: true,
      offerLetter: false,
      academicTranscripts: true,
      paymentReceipt: false,
      nocStatus: 'PENDING',
    },
  });

  // 5. Shortlisted Universities
  await prisma.shortlistedUniversity.create({
    data: {
      studentId: studentProfile.id,
      universityId: uniMIT.id,
    },
  });

  // 6. AI Recommendations
  await prisma.aIRecommendation.create({
    data: {
      studentId: studentProfile.id,
      courseId: courseSydneyCS.id,
      score: 95,
      reason: 'Perfect academic profile alignment. Student meets the IELTS score of 7.5 (required 6.5) and budget range fits after partial scholarship.',
      riskLevel: RiskLevel.SAFE,
      missingRequirements: 'None. All prerequisites met.',
      suggestedNextSteps: 'Proceed to submit document vault for Counselor validation.',
    },
  });

  await prisma.aIRecommendation.create({
    data: {
      studentId: studentProfile.id,
      courseId: courseCS.id,
      score: 82,
      reason: 'Excellent academic history, but highly competitive entry criteria. Tuition exceeds preferred budget unless Presidential Fellowship is secured.',
      riskLevel: RiskLevel.AMBITIOUS,
      missingRequirements: 'Funding proof for full tuition ($57,500/year).',
      suggestedNextSteps: 'Draft and upload Presidential Fellowship application statement.',
    },
  });

  // 7. Documents (Vault Metadata)
  console.log('Seeding Documents...');
  const passportDoc = await prisma.document.create({
    data: {
      ownerId: studentProfile.id,
      fileName: 'rohan_passport_2026.pdf',
      originalName: 'rohan_passport_2026.pdf',
      fileType: 'Passport',
      fileSize: 1542100, // ~1.5 MB
      mimeType: 'application/pdf',
      storageProvider: 'mock',
      storageKey: 'uploads/student-rohan/rohan_passport_2026.pdf',
      storageUrl: '/api/storage/view?key=uploads/student-rohan/rohan_passport_2026.pdf',
      reviewStatus: DocumentReviewStatus.APPROVED,
      approvalStatus: true,
      uploadedBy: studentUser.name,
      reviewedBy: counselorUser.name,
    },
  });

  const transcriptsDoc = await prisma.document.create({
    data: {
      ownerId: studentProfile.id,
      fileName: 'rohan_transcripts_bsc.pdf',
      originalName: 'rohan_transcripts_bsc.pdf',
      fileType: 'Academic Transcripts',
      fileSize: 3450000, // ~3.4 MB
      mimeType: 'application/pdf',
      storageProvider: 'mock',
      storageKey: 'uploads/student-rohan/rohan_transcripts_bsc.pdf',
      storageUrl: '/api/storage/view?key=uploads/student-rohan/rohan_transcripts_bsc.pdf',
      reviewStatus: DocumentReviewStatus.PENDING,
      approvalStatus: false,
      uploadedBy: studentUser.name,
    },
  });

  // Document Access Logs
  await prisma.documentAccessLog.create({
    data: {
      documentId: passportDoc.id,
      userId: studentUser.id,
      action: 'UPLOAD',
    },
  });

  await prisma.documentAccessLog.create({
    data: {
      documentId: passportDoc.id,
      userId: counselorUser.id,
      action: 'VIEW',
    },
  });

  await prisma.documentAccessLog.create({
    data: {
      documentId: passportDoc.id,
      userId: counselorUser.id,
      action: 'APPROVE',
    },
  });

  // Document Share Permissions
  await prisma.documentSharePermission.create({
    data: {
      documentId: passportDoc.id,
      universityId: uniSydney.id,
      isGranted: true,
    },
  });

  // Document Comments
  await prisma.documentComment.create({
    data: {
      documentId: transcriptsDoc.id,
      userId: counselorUser.id,
      comment: 'Please upload the original scanned copy. This version is slightly blurry.',
    },
  });

  // 8. Communications (Conversations & Messages)
  console.log('Seeding Communications...');
  const conversation = await prisma.conversation.create({
    data: {
      studentId: studentProfile.id,
      counselorId: counselorProfile.id,
      lastMessageAt: new Date(),
    },
  });

  await prisma.message.create({
    data: {
      senderId: studentUser.id,
      conversationId: conversation.id,
      content: 'Hi Binod, I have uploaded my passport and IELTS score. Could you please review them?',
      readStatus: true,
    },
  });

  await prisma.message.create({
    data: {
      senderId: counselorUser.id,
      conversationId: conversation.id,
      content: 'Hello Rohan! Yes, I reviewed your passport and it looks great. Your transcript scan is a bit blurry, please re-upload a clear copy.',
      readStatus: false,
    },
  });

  // Counselor Task
  await prisma.task.create({
    data: {
      counselorId: counselorProfile.id,
      studentId: studentProfile.id,
      title: 'Review re-uploaded transcripts',
      description: 'Check image quality and match GPA against University of Sydney eligibility criteria.',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days later
      isCompleted: false,
    },
  });

  // 9. Payments
  console.log('Seeding Payments...');
  const payment = await prisma.payment.create({
    data: {
      studentId: studentProfile.id,
      amount: 15000,
      status: PaymentStatus.PAID,
      packageId: 'pkg-premium-app',
      method: 'eSewa',
      transactionId: 'TXN-ESEWA-88912A',
    },
  });

  await prisma.invoice.create({
    data: {
      paymentId: payment.id,
      invoiceNumber: 'INV-2026-0001',
      amount: 15000,
      taxAmount: 1950, // 13% VAT
      issuedAt: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // 10. Commission tracking
  console.log('Seeding Commission tracking...');
  await prisma.commission.create({
    data: {
      applicationId: application.id,
      tuitionAmount: 42000,
      commissionPercentage: 10.0, // 10% commission
      expectedAmount: 4200,
      receivedAmount: 0,
      status: CommissionStatus.PENDING,
    },
  });

  // 11. Security Audit Logs & Notifications
  console.log('Seeding Logs & Notifications...');
  
  await prisma.auditLog.create({
    data: {
      userId: studentUser.id,
      action: AuditAction.SIGNUP,
      ip: '110.44.112.56',
      details: 'Account created with email student@example.com',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: studentUser.id,
      action: AuditAction.LOGIN,
      ip: '110.44.112.56',
      details: 'User authenticated successfully',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: counselorUser.id,
      action: AuditAction.DOCUMENT_REVIEW,
      ip: '110.44.115.10',
      details: 'Approved document passportDoc.id',
    },
  });

  // Suspicious Activity
  await prisma.suspiciousActivityLog.create({
    data: {
      userId: studentUser.id,
      type: 'Suspicious Location Switch',
      details: 'Account logged in from Kathmandu and Sydney within 10 minutes.',
      severity: 'HIGH',
      ip: '14.137.110.2',
    },
  });

  // Notifications
  await prisma.notification.create({
    data: {
      userId: studentUser.id,
      content: 'Your Passport document has been approved by Counselor Binod Karki.',
      type: NotificationType.SUCCESS,
      readStatus: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: studentUser.id,
      content: 'Transcripts document needs revision. See comment: "blur copy".',
      type: NotificationType.WARNING,
      readStatus: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: counselorUser.id,
      content: 'Rohan Shrestha has sent you a new message.',
      type: NotificationType.INFO,
      readStatus: false,
    },
  });

  // Consent Record
  await prisma.consentRecord.create({
    data: {
      studentId: studentProfile.id,
      universityId: uniSydney.id,
      type: ConsentType.DATA_SHARING,
      granted: true,
    },
  });

  // 12. University Data, Costs, and External APIs Seeding
  console.log('Seeding University Data, Costs, and External APIs...');

  // Outdated University
  const uniOutdated = await prisma.university.create({
    data: {
      name: 'Old Landmark University',
      countryId: usa.id,
      city: 'Boston',
      websiteUrl: 'https://oldlandmark.edu',
      ranking: 500,
      partnerStatus: PartnerStatus.NON_PARTNER,
      dataStatus: DataStatus.OUTDATED,
      verifiedStatus: false,
      description: 'An older university with data that hasn\'t been updated in years.',
      sourceUrl: 'https://wikipedia.org/wiki/oldlandmark',
      sourceNote: 'Outdated manual entry',
      lastVerifiedAt: new Date('2020-01-01'),
    }
  });

  // Pending Review University
  const uniPending = await prisma.university.create({
    data: {
      name: 'Future tech University',
      countryId: usa.id,
      city: 'San Francisco',
      websiteUrl: 'https://futuretech.edu',
      ranking: 150,
      partnerStatus: PartnerStatus.PENDING_PARTNER,
      dataStatus: DataStatus.PENDING_REVIEW,
      verifiedStatus: false,
      description: 'A new university application pending approval.',
      sourceUrl: 'https://futuretech.edu/about',
      sourceNote: 'Submitted via partner application',
      lastVerifiedAt: null,
    }
  });

  // Update courseCS with the new fields
  await prisma.course.update({
    where: { id: courseCS.id },
    data: {
      faculty: 'Electrical Engineering & Computer Science',
      currency: 'USD',
      depositAmount: 5000,
      applicationDeadline: new Date('2026-12-01'),
      englishRequirement: 'IELTS 7.5 / TOEFL 100',
      academicRequirement: 'Bachelor degree in CS or related field',
      minimumGpa: 3.8,
      courseDescription: 'Advanced MS in CS program',
      careerOutcomes: 'Software Architect, Machine Learning Engineer, Research Scientist',
      postStudyWorkInfo: '3 Years STEM OPT available',
      selfFinanceAccepted: true,
      dataStatus: DataStatus.VERIFIED,
      lastVerifiedAt: new Date(),
    }
  });

  // Create CourseCost for courseCS
  await prisma.courseCost.create({
    data: {
      courseId: courseCS.id,
      universityId: courseCS.universityId,
      tuitionFeePerYear: 57500,
      totalTuitionFee: 115000,
      applicationFee: 75,
      depositAmount: 5000,
      visaFeeEstimate: 510,
      insuranceEstimate: 3000,
      livingCostEstimate: 20000,
      accommodationEstimate: 12000,
      travelCostEstimate: 1500,
      proofOfFundsRequirement: 'Bank statement showing at least $85,000',
      bankBalanceRequirement: 85000,
      sponsorAllowed: true,
      educationLoanAccepted: true,
      installmentPaymentAvailable: true,
      partTimeWorkAllowed: true,
      refundPolicy: 'Full refund if visa is rejected',
      currency: 'USD',
      dataStatus: DataStatus.VERIFIED,
      lastVerifiedAt: new Date(),
    }
  });

  // Update courseSydneyCS
  await prisma.course.update({
    where: { id: courseSydneyCS.id },
    data: {
      faculty: 'Engineering',
      currency: 'AUD',
      depositAmount: 4000,
      applicationDeadline: new Date('2026-11-15'),
      englishRequirement: 'IELTS 7.0 / TOEFL 96',
      academicRequirement: 'Bachelor in IT or related',
      minimumGpa: 3.2,
      courseDescription: 'Designed for IT professionals',
      careerOutcomes: 'Senior Developer, Systems Analyst',
      postStudyWorkInfo: '2 Years Temporary Graduate Visa',
      selfFinanceAccepted: true,
      dataStatus: DataStatus.VERIFIED,
      lastVerifiedAt: new Date(),
    }
  });

  // Create CourseCost for courseSydneyCS
  await prisma.courseCost.create({
    data: {
      courseId: courseSydneyCS.id,
      universityId: courseSydneyCS.universityId,
      tuitionFeePerYear: 42000,
      totalTuitionFee: 84000,
      applicationFee: 125,
      depositAmount: 4000,
      visaFeeEstimate: 710,
      insuranceEstimate: 2500,
      livingCostEstimate: 25000,
      accommodationEstimate: 15000,
      travelCostEstimate: 2000,
      proofOfFundsRequirement: 'Bank statement showing AUD $70,000',
      bankBalanceRequirement: 70000,
      sponsorAllowed: true,
      educationLoanAccepted: true,
      installmentPaymentAvailable: true,
      partTimeWorkAllowed: true,
      refundPolicy: 'Partial refund if request sent 4 weeks before start',
      currency: 'AUD',
      dataStatus: DataStatus.VERIFIED,
      lastVerifiedAt: new Date(),
    }
  });

  // Seed External Data Sources
  const srcMock = await prisma.externalDataSource.create({
    data: {
      name: 'Mock Global University API Provider',
      providerType: ProviderType.MOCK,
      baseUrl: 'https://api.mockglobaluni.org/v1',
      authType: AuthType.NONE,
      connectorStatus: ConnectorStatus.ACTIVE,
      description: 'Used for testing the API integration and syncing workflow.',
    }
  });

  const srcScorecard = await prisma.externalDataSource.create({
    data: {
      name: 'US College Scorecard Official API',
      providerType: ProviderType.COLLEGE_SCORECARD,
      baseUrl: 'https://api.data.gov/ed/collegescorecard/v1',
      authType: AuthType.API_KEY,
      connectorStatus: ConnectorStatus.PENDING_CONFIGURATION,
      description: 'Integrates with official US Government Higher Education dataset.',
    }
  });

  // Seed API Credentials Reference (without real keys)
  await prisma.externalApiCredential.create({
    data: {
      dataSourceId: srcScorecard.id,
      credentialName: 'College Scorecard API Key Reference',
      encryptedApiKey: 'REF_ENV_COLLEGE_SCORECARD_API_KEY',
      expiresAt: null,
    }
  });

  // Seed Sync Jobs
  const job = await prisma.dataSyncJob.create({
    data: {
      dataSourceId: srcMock.id,
      syncType: SyncType.ALL,
      status: SyncStatus.SUCCESS,
      startedAt: new Date(Date.now() - 3600 * 1000),
      completedAt: new Date(Date.now() - 3500 * 1000),
      recordsFetched: 10,
      recordsCreated: 8,
      recordsUpdated: 2,
      recordsFailed: 0,
      triggeredBy: 'SuperAdmin User',
    }
  });

  // Seed Field Mappings
  await prisma.externalFieldMapping.create({
    data: {
      dataSourceId: srcScorecard.id,
      externalFieldName: 'school.name',
      internalModel: 'University',
      internalFieldName: 'name',
      required: true,
    }
  });

  await prisma.externalFieldMapping.create({
    data: {
      dataSourceId: srcScorecard.id,
      externalFieldName: 'school.school_url',
      internalModel: 'University',
      internalFieldName: 'websiteUrl',
      required: false,
    }
  });

  // Seed Imported Data Review Records
  await prisma.importedDataReview.create({
    data: {
      dataSourceId: srcMock.id,
      syncJobId: job.id,
      targetModel: 'University',
      rawPayload: JSON.stringify({ name: 'Oxford University Mock', country: 'United Kingdom', ranking: 3 }),
      normalizedPayload: JSON.stringify({ name: 'Oxford University Mock', countryId: usa.id, ranking: 3, city: 'Oxford', dataStatus: 'PENDING_REVIEW' }),
      reviewStatus: ReviewStatus.PENDING_REVIEW,
    }
  });

  // Seed Partner Submitted Update
  await prisma.partnerUpdateSubmission.create({
    data: {
      partnerId: partnerUser.id,
      universityId: uniSydney.id,
      targetModel: 'Course',
      targetRecordId: courseSydneyCS.id,
      updatePayload: JSON.stringify({
        tuitionFee: 45000,
        applicationDeadline: new Date('2027-01-15').toISOString(),
        scholarshipAvailable: true,
      }),
      reviewStatus: ReviewStatus.PENDING_REVIEW,
    }
  });

  // Seed Student Recommendations affected by budget/scholarship
  await prisma.aIRecommendation.create({
    data: {
      studentId: studentProfile.id,
      courseId: courseSydneyCS.id,
      score: 92,
      reason: 'Recommended because tuition fits your budget and Vice-Chancellor Scholarship is available for your academic profile.',
      riskLevel: RiskLevel.SAFE,
      missingRequirements: 'None',
      suggestedNextSteps: 'Prepare SOP and English test scores.',
    }
  });

  // Seed AI Privacy Consent Records for the student
  console.log('Seeding AI Privacy Consents...');
  await prisma.aIConsentRecord.createMany({
    data: [
      { userId: studentUser.id, consentType: AIConsentType.PROFILE_ANALYSIS, granted: true },
      { userId: studentUser.id, consentType: AIConsentType.DOCUMENT_METADATA_ANALYSIS, granted: true },
      { userId: studentUser.id, consentType: AIConsentType.SOP_TEXT_REVIEW, granted: false },
      { userId: studentUser.id, consentType: AIConsentType.RECOMMENDATION_EXPLANATION, granted: true },
      { userId: studentUser.id, consentType: AIConsentType.SCHOLARSHIP_ANALYSIS, granted: true },
      { userId: studentUser.id, consentType: AIConsentType.SELF_FINANCE_ANALYSIS, granted: true },
      { userId: studentUser.id, consentType: AIConsentType.CHAT_HISTORY, granted: true },
    ]
  });

  // Seed AI Conversation & Messages
  console.log('Seeding AI Conversations and Messages...');
  const conv1 = await prisma.aIConversation.create({
    data: {
      userId: studentUser.id,
      title: 'Visa & NOC Process Support',
      contextType: AIContextType.VISA_NOC,
    }
  });

  await prisma.aIMessage.createMany({
    data: [
      { conversationId: conv1.id, role: AIMessageRole.USER, content: 'What is a NOC?' },
      { conversationId: conv1.id, role: AIMessageRole.ASSISTANT, content: 'NOC stands for No Objection Certificate. It is a mandatory document issued by the Ministry of Education, Science and Technology (MoEST) in Nepal, allowing students to study abroad and exchange currency for international tuition payments. You will need a verified university offer letter and payment receipts to apply for it.' },
      { conversationId: conv1.id, role: AIMessageRole.USER, content: 'How do I apply for visa?' },
      { conversationId: conv1.id, role: AIMessageRole.ASSISTANT, content: 'To apply for a student visa, you typically need to prepare your passport, academic documents, proof of financial capacity (like bank balance or loan details), and a No Objection Certificate (NOC) from MoEST. It is recommended to contact your counselor for personalized visa step guidance.' }
    ]
  });

  // Seed AI Usage Logs
  console.log('Seeding AI Usage Logs...');
  await prisma.aIUsageLog.createMany({
    data: [
      {
        userId: studentUser.id,
        provider: 'OPENAI',
        model: 'gpt-4.1-mini',
        feature: 'STUDENT_CHAT',
        promptTokens: 250,
        completionTokens: 120,
        totalTokens: 370,
        estimatedCost: ((250 * 0.15) + (120 * 0.60)) / 1000000,
        requestStatus: 'SUCCESS',
        latencyMs: 450,
      },
      {
        userId: studentUser.id,
        provider: 'FAQ_RULE_ENGINE',
        model: 'STATIC_RULES',
        feature: 'STUDENT_CHAT',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCost: 0.0,
        requestStatus: 'SUCCESS',
        latencyMs: 12,
      },
      {
        userId: studentUser.id,
        provider: 'OPENAI',
        model: 'gpt-4.1-mini',
        feature: 'SOP_REVIEW',
        promptTokens: 850,
        completionTokens: 300,
        totalTokens: 1150,
        estimatedCost: ((850 * 0.15) + (300 * 0.60)) / 1000000,
        requestStatus: 'SUCCESS',
        latencyMs: 980,
      },
      {
        userId: studentUser.id,
        provider: 'OPENAI',
        model: 'gpt-4.1-mini',
        feature: 'STUDENT_CHAT',
        promptTokens: 400,
        completionTokens: 0,
        totalTokens: 400,
        estimatedCost: (400 * 0.15) / 1000000,
        requestStatus: 'FAILED',
        errorMessage: 'OpenAI API rate limit exceeded or key not configured.',
        latencyMs: 110,
      }
    ]
  });

  // Seed Counselor Handoff Record
  console.log('Seeding Counselor Handoffs...');
  await prisma.counselorHandoff.create({
    data: {
      studentId: studentUser.id,
      counselorId: counselorProfile.id,
      conversationId: conv1.id,
      reason: 'Visa refusal history',
      summary: 'Student query: "What if my visa was refused last year for Australia? Can I apply to USA now?"',
      priority: HandoffPriority.HIGH,
      status: HandoffStatus.OPEN,
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
