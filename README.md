# VidyarthiiConnect

VidyarthiiConnect is an AI-powered study-abroad platform designed for Nepali students (expandable globally). It replaces traditional, paper-heavy, and opaque study-abroad agency workflows with a secure, transparent, digital experience.

## Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS v4, Lucide Icons
- **Database & ORM**: PostgreSQL (Neon Serverless), Prisma ORM
- **Security & Auth**: Custom secure JWTs stored in HTTP-Only, Secure, SameSite cookies, edge middleware checks, in-memory IP rate-limiting, failed-login lockout protection, and passkey/WebAuthn biometric mock-ready flows.
- **Form Validation**: Zod Schemas

---

## Key Features

1. **Unbiased AI Recommendation Engine**: Evaluates student profiles (GPA, English test scores, budget, intake timelines) to suggest Safe, Moderate, and Ambitious matches with explanations.
2. **Secure Document Vault**: Stores document metadata in Neon PostgreSQL. Actual files are handled through a storage provider abstraction layer (local public directory for development). It includes sharing consent logs.
3. **Application Tracker**: Real-time visual timeline monitoring for submissions, offer decisions, visa filing, and enrollments.
4. **Visa & NOC Checklist**: Country-specific checklists (USA, UK, Canada, Australia) and Nepal MoEST No Objection Certificate (NOC) checklist guidelines.
5. **Secure Audited messaging**: Counselor-student messaging portal with read/unread flags and counselor workspace checklists.
6. **Billing & mock Payments**: Service package selection (Free, Premium, Visa, End-to-End) and checkout vouchers showing 13% Nepal VAT tax breakdowns.
7. **Security Dashboard (SuperAdmin)**: Audit logs, threat flags, commission tracking ledgers, and platform-wide configurations.

---

## Folder Structure
```text
vidyarthiconnect/
├── app/
│   ├── api/               # API Route Handlers (auth, documents, applications, search, etc.)
│   ├── student/           # Student Portal pages (dashboard, search, documents, applications, etc.)
│   ├── counselor/         # Counselor portal (workspace reviews, task creation)
│   ├── partner/           # University Partner dashboard (admissions pipeline decisions)
│   ├── admin/             # Administrator console (CRM, assignment matrix, payments log)
│   ├── superadmin/        # SuperAdmin system settings (audit trails, settings, threat logs)
│   ├── login/             # Login & biometric prompt screen
│   ├── signup/            # Student signup screen
│   ├── privacy/           # GDPR/Data compliance page
│   └── terms/             # Admissions disclaimer page
├── components/            # Reusable UI dashboard elements
├── lib/
│   ├── auth/              # JWT session creation & verification helpers
│   ├── db/                # Global Prisma Client singleton instance
│   ├── security/          # Audit loggers, check rate-limits, locked out counters
│   ├── storage/           # File upload abstraction layer provider
│   └── validators/        # Zod validation schemas
├── prisma/
│   ├── schema.prisma      # Relational database models (30+ models)
│   └── seed.ts            # Seed script with mock roles, courses, and logs
└── middleware.ts          # Edge-safe role authorization check middleware
```

---

## Demo Credentials
For testing and evaluation, log in with the following default accounts (Password for all accounts is **`password123`**):

| Role | Email | Password | Features to Test |
| :--- | :--- | :--- | :--- |
| **SuperAdmin** | `superadmin@example.com` | `password123` | Audit logs, Suspicious activity, Settings, Ledger |
| **Admin** | `admin@example.com` | `password123` | Student CRM, Counselor assignments, Payments log |
| **Counselor** | `counselor@example.com` | `password123` | File reviews (approve/needs revision), Task allocation |
| **Partner** | `partner@example.com` | `password123` | University of Sydney admissions pipeline (accept/decline) |
| **Student** | `student@example.com` | `password123` | Profile builder, AI matches, Doc vault, Payments, Chat |

*Note: Counseling, Partner, and Admin roles will trigger a mock Multi-Factor Authentication (MFA) OTP screen. Simply input any 6-digit number (e.g. `123456`) to pass.*

---

## Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (e.g., local database or Neon PostgreSQL account)

### 2. Installation
Clone this repository and run:
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and configure the database link and security key:
```env
DATABASE_URL="postgresql://username:password@ep-cool-flower-123.us-east-2.neon.tech/neondb?sslmode=require"
AUTH_SECRET="your-super-secret-jwt-signing-key-at-least-32-characters"
FILE_STORAGE_PROVIDER="mock"
```
*(Refer to `.env.example` for all configurable variables)*

### 4. Database Setup & Seeding
Validate the database structure, apply migrations, and seed the mock dataset:
```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations
npx prisma migrate dev --name init

# Seed mock database
npm run prisma:seed
```

### 5. Running the Application
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the landing page.

---

## Security Notes
- **OWASP Compliance**: Protects routes against injections, XSS, and CSRF.
- **Encrypted Session**: All credentials are hashed using `Bcrypt`. Session keys are signed using `jsonwebtoken` and saved in HTTP-Only, Secure, SameSite cookies.
- **Biometrics ready**: The `/api/auth/webauthn` endpoint simulates credential exchange and challenges for biometric logins.
- **Metadata Storage**: Real files are never written directly inside Neon PostgreSQL, keeping queries fast and storage optimized.

---

## University, Course, Scholarship & API Sync Module (Phase 2)

### 1. Data Management
- **Universities**: Supports CRUD operations for universities. Fields track city, campus, ranking, institution type, logo, data status (`DRAFT`, `PENDING_REVIEW`, `VERIFIED`, `OUTDATED`, `REJECTED`), and creator audit tags.
- **Courses**: Tracks faculty, duration, tuition, deposit requirements, deadlines, entry scores (GPA and English IELTS/TOEFL requirements), and self-finance acceptance.
- **Scholarships**: Dedicated models linking course/university requirements with scholarship types (`MERIT_BASED`, `NEPAL_SPECIFIC`, `GOVERNMENT_FUNDED`, etc.) and coverage types (`FULL_TUITION`, `ACCOMMODATION_SUPPORT`, etc.).
- **Self-Finance Costs**: Captures visa fee estimates, insurance, travel, living costs, sponsor policies, and proof of funds bank balances.

### 2. Estimated Cost Calculator
- **Formula**:
  \[\text{Total Estimated Cost} = \text{tuition} + \text{application fee} + \text{living cost} + \text{insurance} + \text{visa fee} + \text{travel estimate}\]
  If a scholarship is applicable:
  \[\text{Final Self-Finance Estimate} = \text{total estimated cost} - \text{scholarship amount}\]
- calculations are displayed on the Student course details list, the Side-by-Side Comparison modal, and Admin management portals.

### 3. CSV Bulk Upload
- **How to import**: Administrators upload CSV templates containing university, course, cost, and scholarship details.
- **Review Queue**: Parsed rows are validated using Zod and created in `ImportedDataReview` as `PENDING_REVIEW`. They do not appear on student search pages until verified by an Admin/SuperAdmin.
- **Sample Template**: Downloadable sample CSV templates are served dynamically from `GET /api/admin/import/csv?template=true`.

### 4. Partner Submission Workflow
- University partners propose updates for program details or fees. The updates are saved in `PartnerUpdateSubmission` as `PENDING_REVIEW`. Admins review proposals in the queue to approve or reject them before they become visible to students.

### 5. External API Connectors (lib/integrations/)
- **CollegeScorecardConnector**: Implements live synchronization with the official U.S. College Scorecard API (`api.data.gov`). Requires `COLLEGE_SCORECARD_API_KEY`. If the key is missing, the application automatically flags the connection as `PENDING_CONFIGURATION` without crashing.
- **MockGlobalUniversityConnector**: Seeds mock global data (Oxford, Tokyo Tech) to demonstrate syncing pipelines, mapping, and the review queue.
- **OpenCollegeDataConnector**: A pre-wired placeholder for legitimate open dataset integrations.
- **PartnerApiConnectorPlaceholder**: Prepared for recruitment partner platforms, Common App, and StudyLink APIs.

- **No Leaks**: Decrypted API keys are never printed in console logs or returned in JSON route payloads.

---

## Production Deployment Environment Variables

When deploying VidyarthiiConnect to Vercel, configure the following environment variables under **Project Settings > Environment Variables**:

### 1. Database & Authentication
- `DATABASE_URL`: The Neon PostgreSQL production database connection string. (Do not run seed scripts in production).
- `AUTH_SECRET`: A secure random 32-character encryption secret for JWT session signing.
- `NEXTAUTH_SECRET`: Duplicate value of `AUTH_SECRET` for NextAuth compatibility.
- `AUTH_URL`: Your absolute production Vercel URL (e.g. `https://vidyarthiconnect.vercel.app`).
- `NEXTAUTH_URL`: Duplicate value of `AUTH_URL`.

### 2. File Storage
- `FILE_STORAGE_PROVIDER`: Set to `"mock"` for local/temporary demo storage, or `"s3"` / `"r2"` / `"supabase"` for secure cloud object storage.

### 3. OpenAI AI Assistant
- `OPENAI_API_KEY`: Your live OpenAI developer key (keep empty if disabled).
- `OPENAI_MODEL`: `"gpt-4.1-mini"` (highly recommended default for speed and cost efficiency).
- `OPENAI_ASSISTANT_ENABLED`: Set to `"false"` to disable live OpenAI calls and use mock fallback responses for testing. Set to `"true"` in production.
- `OPENAI_DAILY_TOKEN_LIMIT_PER_USER`: Daily usage quota limit per student.
- `OPENAI_MONTHLY_TOKEN_LIMIT_GLOBAL`: Monthly global usage safety ceiling limit.

### 4. Integration APIs
- `COLLEGE_SCORECARD_API_KEY`: U.S. Higher Education data.gov API credential.
- `EXTERNAL_API_ENCRYPTION_KEY`: A secure key used to encrypt connection credentials stored in Neon database.

> [!WARNING]
> - Never commit `.env` file to your GitHub repository.
> - Do not run seed scripts (`npm run prisma:seed`) or push raw mock data in production.


