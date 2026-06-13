# Deployment Guide - VidyarthiiConnect

This guide outlines how to deploy the VidyarthiiConnect study abroad platform in a production-ready environment using **GitHub**, **Vercel**, and **Neon PostgreSQL**.

---

## Deployment Steps

### 1. Create a GitHub Repository
1. Go to [GitHub](https://github.com) and click **New Repository**.
2. Give your repository a name (e.g., `vidyarthi-connect`).
3. Set the visibility to Private or Public.
4. Do **not** initialize with a README or gitignore, as those are already created in your project folder.
5. Push the code from your local machine:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for VidyarthiiConnect MVP"
   git branch -M main
   git remote add origin https://github.com/your-username/vidyarthi-connect.git
   git push -u origin main
   ```

### 2. Set Up Neon PostgreSQL Database
1. Go to [Neon.tech](https://neon.tech) and sign up for a free account.
2. Click **Create Project** and select a name (e.g., `vidyarthi-db`).
3. Set the region closest to your Vercel deployment (e.g., AWS US East).
4. Neon will provide a database connection string. Copy the string in the format:
   ```text
   postgresql://username:password@ep-cool-flower-1234.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 3. Apply Local Schema & Seeds
Apply your database schema definitions and seed mock accounts into your Neon database:
1. Save the Neon connection string in your local `.env` file:
   ```env
   DATABASE_URL="YOUR_NEON_CONNECTION_STRING_HERE"
   ```
2. Run database setup commands:
   ```bash
   # Generate types
   npx prisma generate
   
   # Apply migrations to database
   npx prisma migrate dev --name init
   
   # Seed database
   npx prisma db seed
   ```

### 4. Connect to Vercel
1. Go to [Vercel](https://vercel.com) and sign in.
2. Click **Add New** and choose **Project**.
3. Import your GitHub repository (`vidyarthi-connect`).
4. In the **Environment Variables** section, add:
   - `DATABASE_URL`: Your Neon database connection string.
   - `AUTH_SECRET`: A secure random 32-character string (e.g., generated with `openssl rand -base64 32`).
   - `AUTH_URL`: Your production domain (e.g. `https://vidyarthi-connect.vercel.app` or use Vercel defaults).
   - `NEXTAUTH_SECRET`: Duplicate `AUTH_SECRET`.
   - `FILE_STORAGE_PROVIDER`: `"mock"` (or `"s3"` / `"r2"` when you switch to cloud storage).
5. Leave the **Build Command** and **Output Directory** as Vercel's default Next.js configurations (the build script in `package.json` will automatically run `prisma generate && next build` to guarantee compilation).
6. Click **Deploy**.

---

## Troubleshooting & Common Errors

### 1. Prisma Client Initialization Error
- **Symptom**: `PrismaClientInitializationError: WebAssembly is not supported in this environment` or missing types.
- **Fix**: The build command must generate client files first. Double-check that your `package.json` build script is exactly `"build": "prisma generate && next build"`. Vercel automatically runs this during deploy.

### 2. Migration Deployment in Vercel
- **Symptom**: New changes in database models are not reflected on Vercel backend.
- **Fix**: Vercel does not automatically run migrations during deploy. If you modify your schema, you must run migrations. It is highly recommended to run production migration deploy from your terminal locally targeting the production database URL:
  ```bash
  DATABASE_URL="YOUR_PRODUCTION_NEON_URL" npx prisma migrate deploy
  ```

### 3. Rate-Limiting reset in Serverless Functions
- **Symptom**: In-memory rate limits (locks) reset frequently.
- **Fix**: Vercel runs API routes inside serverless environments, meaning the in-memory map in `global` may reset when functions cold-start. For local development, this is perfectly fine. In production global usage, it is recommended to connect a Redis database (e.g., Upstash Redis) or query failed attempt audit logs directly in Neon to enforce locks.

### 4. Vercel Serverless Function Timeout
- **Symptom**: API routes fail with a `504 Gateway Timeout` under heavy loads.
- **Fix**: Free Vercel plans have a 10-second timeout limit for serverless functions. Ensure your Neon database is in the same region as Vercel and check that database queries are indexed correctly.

### 5. Configuring Phase 2 External API Credentials (Vercel)
When deploying to Vercel, navigate to **Project Settings > Environment Variables** and configure:
- `COLLEGE_SCORECARD_API_KEY`: U.S. government official higher education dataset credential (fetch key from data.gov).
- `OPEN_COLLEGE_DATA_API_KEY`: Optional open dataset key.
- `COMMON_APP_CLIENT_ID` / `COMMON_APP_CLIENT_SECRET`: Placeholders for future Common App credentials.
- `STUDYLINK_API_TOKEN`: Placeholder for StudyLink integrations.
- `EXTERNAL_API_ENCRYPTION_KEY`: A secure key used by server-side crypto tools to encrypt/decrypt connection credentials in PostgreSQL.

*Note: None of these environment variables should be prefixed with `NEXT_PUBLIC_`, ensuring they remain strictly server-side and never leak to the client.*

### 6. Executing and Managing API Sync Jobs
1. Log in as **SuperAdmin**.
2. Navigate to the **External Sources** UI.
3. Trigger a sync job for a specific connector. The service queues a background task, logs statuses to `DataSyncJob`, and writes records to `ImportedDataReview`.
4. Log in as **Admin** or **SuperAdmin** to review the approval queue and verify records.
5. Student search UI refreshes with the verified listings automatically.

### 7. Configuring Phase 3 OpenAI AI Assistant (Vercel)
When deploying the AI Assistant capabilities, navigate to **Project Settings > Environment Variables** on Vercel and configure:
- `OPENAI_API_KEY`: Your official OpenAI developer API key.
- `OPENAI_MODEL`: Set to `"gpt-4.1-mini"` (default model for cost efficiency).
- `OPENAI_ASSISTANT_ENABLED`: Set to `"true"` to connect to the live OpenAI API. Set to `"false"` (default) to bypass calls and use simulated offline fallback responses.
- `OPENAI_DAILY_TOKEN_LIMIT_PER_USER`: Sets the daily token limit per user (e.g. `"50000"`). Leave empty (`""`) to skip the check.
- `OPENAI_MONTHLY_TOKEN_LIMIT_GLOBAL`: Sets the system-wide global monthly token limit (e.g. `"1000000"`). Leave empty (`""`) to skip the check.

*Note: All OpenAI calls are handled in server-side Next.js App Router API routes. None of these variables should be prefixed with `NEXT_PUBLIC_` to keep them secure and hidden from client-side bundle inspects.*

---

## Production Security & Account Flow

### 1. Invitation-Based Accounts
- **Student Accounts**: Can register publicly at the `/signup` route.
- **SuperAdmin Account**: Initialized strictly via the secure bootstrap CLI script.
- **Admin Accounts**: Created/invited only by the SuperAdmin.
- **Counselor Accounts**: Created/invited by Admins or SuperAdmins.
- **University Partner Accounts**: Created/invited by Admins or SuperAdmins.

*Note: Public signups never create privileged accounts. Even if a malicious request attempts to send a `role` parameter to `/api/auth/signup`, it is strictly ignored or rejected.*

### 2. SuperAdmin Initialization
To create the first SuperAdmin against the production database, configure the environment variables and run the bootstrap script from your local workstation:

PowerShell:
```powershell
cd D:\deeplearnig\vidyarthiconnect

$env:DATABASE_URL="YOUR_PRODUCTION_NEON_DATABASE_URL"
$env:SUPERADMIN_EMAIL="YOUR_EMAIL"
$env:SUPERADMIN_NAME="YOUR_NAME"
$env:SUPERADMIN_PASSWORD="YOUR_STRONG_PASSWORD"
$env:FORCE_CREATE_SUPERADMIN="false"

npm run create-superadmin
```

> [!IMPORTANT]
> **Password Rotation**: After first login, change the password if the password was ever shared in chat, docs, screenshots, or logs.
> **Production Migrations**: In production, do not run `prisma db seed` or `prisma migrate dev`. Always run `prisma migrate deploy` to safely apply migrations to your live Neon database.

