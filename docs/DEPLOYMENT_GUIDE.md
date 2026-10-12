# Vercel + Supabase Deployment Runbook

**Target Architecture:** Next.js 16 (App Router + Turbopack) on Vercel + PostgreSQL with Row Level Security on Supabase.

---

## Part 1: Supabase Setup (Database & Authentication)

### Step 1.1: Create a Supabase Project
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **"New Project"**.
3. Choose an organization, select a strong database password, and pick a cloud region close to your primary learner demographic (e.g. `Frankfurt (eu-central-1)` for Germany/Europe).
4. Wait ~2 minutes for the database to provision.

### Step 1.2: Run Database Schema Migrations
1. In the Supabase Dashboard, navigate to the **SQL Editor** tab (left sidebar).
2. Click **"New Query"**.
3. Open [`supabase/schema.sql`](file:///Users/gauravpratap/Official/Dev/LearnGerman/deutsch-pfad/supabase/schema.sql) in this repository, copy the entire SQL content, and paste it into the editor.
4. Click **"Run"** (`Cmd/Ctrl + Enter`).
5. Confirm that tables, enums, triggers, and RLS policies are created successfully.

### Step 1.3: Run Curriculum & Content Seed
1. In the **SQL Editor**, open a second query tab.
2. Open [`supabase/seed.sql`](file:///Users/gauravpratap/Official/Dev/LearnGerman/deutsch-pfad/supabase/seed.sql), paste the content, and click **"Run"**.
3. This seeds:
   - CEFR Levels (A1 through C2).
   - Core curriculum units and introductory lessons.
   - Initial badge catalog and test questions.

### Step 1.4: Configure Authentication & Redirect URLs
1. Navigate to **Authentication → URL Configuration**.
2. Set **Site URL**:
   - For local development: `http://localhost:3000`
   - For production: `https://your-domain.vercel.app` (or custom domain).
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.vercel.app/auth/callback`
   - `https://*.vercel.app/auth/callback` (for Vercel preview branch deployments).
4. (Optional) Under **Authentication → Providers**, enable **Email/Password** and any social providers (Google, GitHub) if desired.

### Step 1.5: Retrieve API Credentials
1. Navigate to **Project Settings → API**.
2. Copy the following credentials:
   - **Project URL** (`https://<project-ref>.supabase.co`)
   - **anon / public key** (Used for client browser calls)
   - **service_role key** (Store securely; DO NOT expose in git or public envs)

---

## Part 2: Vercel Deployment

### Step 2.1: Connect Git Repository
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **"Add New..." → "Project"**.
3. Import your GitHub repository (`deutsch-pfad`).

### Step 2.2: Configure Project Build Settings
- **Framework Preset**: `Next.js`
- **Root Directory**: `./` (or `deutsch-pfad` if in monorepo)
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 2.3: Configure Environment Variables in Vercel
In the **Environment Variables** section of the Vercel project import screen, add the following variables:

| Variable Name | Environment | Value | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Dev | `https://<ref>.supabase.co` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Dev | `<anon-jwt-token>` | Supabase anonymous API key |
| `NEXT_PUBLIC_SITE_URL` | Production | `https://your-domain.vercel.app` | Canonical site URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | `<service-role-secret>` | Server-side administrative key |
| `NEXT_TELEMETRY_DISABLED` | All | `1` | Disables telemetry |

### Step 2.4: Trigger Deployment
1. Click **"Deploy"**.
2. Vercel will run `npm install` and `next build` with Turbopack.
3. Once completed, your application will be live at `https://<project-name>.vercel.app`.

---

## Part 3: Custom Domain & Production Hardening

### Step 3.1: Add Custom Domain
1. In Vercel, go to **Settings → Domains**.
2. Enter your custom domain (e.g., `deutschpfad.de` or `app.deutschpfad.com`).
3. Follow the DNS instructions (add CNAME or A records with your DNS registrar).
4. Vercel automatically provisions SSL certificates via Let's Encrypt.

### Step 3.2: Update Supabase Redirects
Return to Supabase **Authentication → URL Configuration** and update:
- **Site URL**: `https://your-custom-domain.com`
- **Redirect URL**: `https://your-custom-domain.com/auth/callback`

---

## Part 4: Production Smoke Testing Checklist
After deployment, verify the live production build:
- [ ] **Home Page**: Loads hero, curriculum cards, and tricolor brand styling.
- [ ] **Auth Flow**: Sign up a test user, check email confirmation, or log in via demo profile.
- [ ] **Courses & Roadmap**: Open `/courses` and `/courses/a1`; verify roadmap path renders.
- [ ] **Lesson Player**: Navigate to `/lesson/a1-u1-l1`; play audio, view grammar tables, and mark complete.
- [ ] **Flashcards**: Review flashcard flip animations and SM-2 ratings on `/flashcards`.
- [ ] **Mock Tests**: Take A1 Unit 1 quiz or placement assessment on `/tests`; verify results radar chart.
- [ ] **PWA Offline**: Enable airplane mode; verify cached lessons and flashcards load smoothly.
- [ ] **Dark Mode**: Toggle theme and ensure contrast is preserved across reloads.
