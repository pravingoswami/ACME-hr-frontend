# ACME HR Portal

A full-stack HR compensation management portal for ACME — replacing spreadsheet-based salary tracking with a secure, role-based web application backed by PostgreSQL (Supabase) and a React SPA.

| Repository | Stack | Default port |
|------------|-------|--------------|
| **ACME-hr-frontend** (this repo) | Vite, React 19, TypeScript, MUI, React Query | `3000` |
| **ACME-hr-backend** (sibling repo) | Express 5, Prisma, PostgreSQL, JWT | `4000` |

---

## 1. Requirements Document

### 1.1 Goal

Replace Excel-based salary spreadsheets with a web application that lets ACME HR staff **manage compensation data** and **answer org-wide pay questions** reliably, securely, and at scale — supporting ~10,000 employees across multiple countries and concurrent HR users.

The persona is an **HR Manager** at ACME (not employees). The system must support growth beyond 10k records through indexed queries, server-side pagination, and batched bulk operations.

### 1.2 Scope & Features (In)

| Area | Feature | Priority | Status |
|------|---------|----------|--------|
| **Authentication** | Login, JWT access + refresh tokens, logout, session restore | P0 | Done |
| **User management** | Admin creates/manages HR Manager accounts | P0 | Done |
| **Employee registry** | List, search, filter (department, status), server-side pagination | P0 | Done |
| **Employee CRUD** | Create, update, deactivate, delete; reference data (country, department, job grade) | P0 | Done |
| **Salary management** | Update salary with effective dating, revision history, salary records | P0 | Done |
| **Salary slips** | Individual PDF download; bulk ZIP by month/department/status | P0 | Done |
| **Pay analytics** | Dashboard: headcount, avg/median/min/max pay, breakdowns by department & status | P0 | Done |
| **Bulk operations** | Percentage or flat salary adjustment with preview → confirm → apply | P0 | Done |
| **Import / export** | CSV upload, job processing, CSV export with download | P1 | Done |
| **Audit trail** | Log of create/update/delete/bulk/import/export actions | P1 | Done |
| **Reference data** | Countries, departments, job grades (seeded on startup) | P0 | Done |
| **Role-based access** | `ADMIN` (full access) vs `HR_MANAGER` (operations, no admin tools) | P0 | Done |
| **Data seeding** | 10,000 realistic employees, reference data, hardcoded admin | P0 | Done |
| **Deployment** | Frontend on Netlify; backend + Supabase PostgreSQL | P1 | Configured |

### 1.3 Deliberately Out of Scope (v1)

| Excluded | Reason |
|----------|--------|
| **Payroll processing & tax withholding** | Different domain — HR needs compensation management, not payroll runs |
| **Employee self-service portal** | Persona is HR staff only; employees are data records, not users |
| **Multi-tenant SaaS** | Single org (ACME); schema is org-scoped, not tenant-scoped |
| **Real-time collaboration / WebSockets** | Batch HR workflows do not require live co-editing |
| **Full RBAC matrix (10+ roles)** | Two roles (`ADMIN`, `HR_MANAGER`) satisfy the assessment and keep authorization testable |
| **Microservices** | Modular monolith scales to 100k+ employees with proper indexing |
| **Mobile native app** | Responsive MUI web UI is sufficient |
| **Leave / attendance / recruitment** | Outside compensation-management scope |
| **Cloudflare R2 object storage** | Simplified to local filesystem uploads in `uploads/` for the assessment timeline |
| **npm workspaces monorepo** | Split into two repos for independent deploy and clearer API boundary |
| **Automated test suite & CI** | Planned in original roadmap (Phase 7); not required for initial delivery |
| **Charting libraries (Recharts/ApexCharts)** | Analytics shown as KPI cards and tables; charts deferred to reduce scope |

### 1.4 Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Employee list p95 latency | < 500 ms at 10k rows (indexed queries + pagination) |
| Concurrent HR users | 50+ simultaneous sessions |
| Scalability | Schema and API designed for 100k+ employees |
| Correctness | No overlapping active salary records per employee |
| Security | Role guards on all mutation endpoints; refresh tokens revoked on logout |
| Availability | Netlify (frontend) + hosted backend + Supabase PostgreSQL |

### 1.5 Success Criteria

1. HR can find any employee and update salary in fewer than three clicks.
2. HR can answer *"What is our average pay by department?"* from the analytics dashboard.
3. 10,000 employees seeded with reference data across countries and job grades.
4. Incremental git history shows evolution from boilerplate → core modules → advanced features.

---

## 2. Architecture Overview

```
┌─────────────────────┐     REST / JSON      ┌─────────────────────┐
│  ACME-hr-frontend   │ ◄──────────────────► │  ACME-hr-backend    │
│  Vite + React SPA   │   Bearer JWT         │  Express + Prisma   │
│  Netlify (prod)     │                      │  Port 4000          │
└─────────────────────┘                      └──────────┬──────────┘
                                                        │
                                                        ▼
                                             ┌─────────────────────┐
                                             │  Supabase PostgreSQL │
                                             │  (pooled connection) │
                                             └─────────────────────┘
```

**Frontend layers:** Pages → React Query hooks → API clients → Express backend  
**Backend layers:** Routes → Controllers → Services → Prisma → PostgreSQL

---

## 3. Role Access Matrix

| Feature / Route | ADMIN | HR_MANAGER |
|-----------------|:-----:|:----------:|
| Login / logout | Yes | Yes |
| Dashboard (`/dashboard`) | Yes | Yes |
| Employees (`/employees`, `/employees/:id`) | Yes | Yes |
| Salary slips (`/salary-slips`) | Yes | Yes |
| Users (`/users`) | Yes | No |
| Audit logs (`/audit-logs`) | Yes | No |
| Bulk adjustments (`/bulk-adjustments`) | Yes | No |
| Import / export (`/import-export`) | Yes | No |

**Default admin account** (seeded on backend startup):

- Email: `admin@acme.com`
- Password: `Admin@12345`

---

## 4. Frontend — Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Email/password authentication |
| `/dashboard` | Dashboard | KPI cards, pay analytics by department/status |
| `/employees` | Employees | Paginated list with debounced search and filters |
| `/employees/:id` | Employee detail | Profile, salary history, salary update, deactivate, PDF slip |
| `/salary-slips` | Salary slips | Bulk PDF generation by month and filters |
| `/users` | Users | HR Manager account CRUD (Admin only) |
| `/audit-logs` | Audit logs | Paginated action history (Admin only) |
| `/bulk-adjustments` | Bulk adjustments | Preview and apply salary changes (Admin only) |
| `/import-export` | Import / export | CSV upload, job status, export download (Admin only) |

---

## 5. Backend — API Endpoints

Base URL: `http://localhost:4000` (dev) or your deployed backend URL.

### Auth — `/api/auth`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/login` | Public | Returns access + refresh tokens |
| POST | `/refresh` | Public | Rotate access token |
| POST | `/logout` | Public | Revoke refresh token |
| GET | `/me` | Authenticated | Current user profile |

### Users — `/api/users`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | ADMIN | List HR users |
| GET | `/:id` | ADMIN | Get user by ID |
| POST | `/` | ADMIN | Create HR Manager |
| PUT | `/:id` | ADMIN | Update user |
| DELETE | `/:id` | ADMIN | Delete user |

### Employees — `/api/employees`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | ADMIN, HR_MANAGER | Paginated list with search/filters |
| GET | `/:id` | ADMIN, HR_MANAGER | Employee detail |
| GET | `/:id/salary-history` | ADMIN, HR_MANAGER | Salary revision history |
| GET | `/:id/salary-slip?month=YYYY-MM` | ADMIN, HR_MANAGER | Download individual PDF |
| POST | `/` | ADMIN, HR_MANAGER | Create employee |
| PUT | `/:id` | ADMIN, HR_MANAGER | Update employee |
| PATCH | `/:id/salary` | ADMIN, HR_MANAGER | Update salary with effective dating |
| PATCH | `/:id/deactivate` | ADMIN, HR_MANAGER | Deactivate employee |
| DELETE | `/:id` | ADMIN, HR_MANAGER | Delete employee |

### Analytics — `/api/analytics`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/summary` | ADMIN, HR_MANAGER | Headcount, avg/median/min/max pay |
| GET | `/by-department` | ADMIN, HR_MANAGER | Pay breakdown by department |
| GET | `/by-status` | ADMIN, HR_MANAGER | Headcount by employee status |
| GET | `/pay-range` | ADMIN, HR_MANAGER | Pay range percentiles |

### Reference — `/api/reference`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/countries` | ADMIN, HR_MANAGER | Country list |
| GET | `/departments` | ADMIN, HR_MANAGER | Department list |
| GET | `/job-grades` | ADMIN, HR_MANAGER | Job grade list with salary bands |

### Bulk — `/api/bulk`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/adjustment/preview` | ADMIN | Preview bulk salary adjustment |
| POST | `/adjustment/apply` | ADMIN | Apply bulk salary adjustment |

### Audit — `/api/audit-logs`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | ADMIN | Paginated audit log |

### Import / Export — `/api/import`, `/api/export`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/import/upload` | ADMIN | Upload CSV file |
| POST | `/import/:jobId/process` | ADMIN | Process import job |
| GET | `/import/:jobId/status` | ADMIN | Import job status |
| POST | `/export/` | ADMIN | Create export job |
| GET | `/export/:jobId/download` | ADMIN | Download export file |

### Payroll — `/api/payroll`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/salary-slips/bulk` | ADMIN, HR_MANAGER | Bulk salary slip ZIP download |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service and database connectivity check |

---

## 6. Technology Stack & Packages

### 6.1 Frontend (`ACME-hr-frontend`)

| Package | Version | Purpose |
|---------|---------|---------|
| **react** | ^19.1.0 | UI library |
| **react-dom** | ^19.1.0 | React DOM renderer |
| **react-router-dom** | ^7.18.0 | Client-side routing and protected routes |
| **@tanstack/react-query** | ^5.101.2 | Server-state caching, mutations, background refetch |
| **@mui/material** | ^9.1.2 | Material Design component library |
| **@mui/icons-material** | ^9.1.1 | MUI icon set |
| **@emotion/react** | ^11.14.0 | CSS-in-JS (required by MUI) |
| **@emotion/styled** | ^11.14.1 | Styled components (required by MUI) |
| **react-hook-form** | ^7.80.0 | Performant form state management |
| **@hookform/resolvers** | ^5.4.0 | Zod resolver for React Hook Form |
| **zod** | ^4.4.3 | Runtime schema validation (forms mirror backend rules) |
| **vite** | ^6.3.5 | Dev server and production bundler |
| **@vitejs/plugin-react** | ^4.4.1 | React Fast Refresh for Vite |
| **typescript** | ~5.8.3 | Static typing |
| **eslint** | ^9.25.0 | Linting |
| **typescript-eslint** | ^8.30.1 | TypeScript ESLint rules |

**Frontend scripts:**

```bash
npm run dev       # Start Vite dev server (port 3000)
npm run build     # Type-check + production build → dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

**Frontend environment:**

```env
VITE_API_URL=http://localhost:4000
```

### 6.2 Backend (`ACME-hr-backend`)

| Package | Version | Purpose |
|---------|---------|---------|
| **express** | ^5.1.0 | HTTP API framework |
| **@prisma/client** | ^6.9.0 | Type-safe database ORM client |
| **prisma** | ^6.9.0 | Schema migrations and code generation (dev) |
| **@supabase/supabase-js** | ^2.108.2 | Supabase client (project integration) |
| **@supabase/ssr** | ^0.6.1 | Supabase SSR utilities |
| **jsonwebtoken** | ^9.0.3 | JWT access token signing and verification |
| **bcryptjs** | ^3.0.3 | Password hashing |
| **zod** | ^3.25.76 | Request body validation |
| **cors** | ^2.8.5 | Cross-origin resource sharing |
| **dotenv** | ^16.5.0 | Environment variable loading |
| **multer** | ^2.2.0 | Multipart file upload (CSV import) |
| **pdfkit** | ^0.19.1 | Salary slip PDF generation |
| **archiver** | ^8.0.0 | ZIP archive for bulk salary slips |
| **tsx** | ^4.19.4 | TypeScript execution (dev) |
| **nodemon** | ^3.1.14 | Auto-restart on file changes (dev) |
| **typescript** | ^5.8.3 | Static typing |

**Backend scripts:**

```bash
npm run dev          # Start with nodemon + tsx (port 4000)
npm run build        # prisma generate + tsc → dist/
npm run start        # Run compiled production server
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run Prisma migrations
npm run db:studio    # Open Prisma Studio GUI
```

**Backend environment** (see `ACME-hr-backend/.env.example`):

```env
PORT=4000
FRONTEND_URL=http://localhost:3000

SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

DATABASE_URL=postgresql://postgres:[password]@db.<project>.supabase.co:5432/postgres?sslmode=require
DIRECT_URL=postgresql://postgres:[password]@db.<project>.supabase.co:5432/postgres?sslmode=require

JWT_SECRET=<min-32-chars>
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_DAYS=7

# Optional: override default 10,000 employee seed target
# SEED_EMPLOYEE_COUNT=10000
```

---

## 7. Database Schema (Summary)

PostgreSQL via Prisma. Key models:

| Model | Purpose |
|-------|---------|
| `User` | HR staff accounts (`ADMIN`, `HR_MANAGER`) |
| `Employee` | Employee records (~10k seeded) |
| `Country`, `Department`, `JobGrade` | Reference / lookup data |
| `SalaryRecord` | Effective-dated salary with bonus and allowances |
| `SalaryRevision` | Field-level change history per salary record |
| `AuditLog` | User action audit trail |
| `ImportJob`, `ExportJob` | Async CSV job tracking |
| `RefreshToken` | Refresh token rotation and revocation |

---

## 8. Local Development Setup

### Prerequisites

- **Node.js** ≥ 20
- **npm**
- Supabase PostgreSQL project with connection strings configured in the backend `.env`

### Steps

1. **Backend**

   ```bash
   cd ../ACME-hr-backend
   cp .env.example .env   # fill in Supabase and JWT values
   npm install
   npm run dev            # http://localhost:4000
   ```

   On first start the backend seeds: admin user, reference data, and up to 10,000 employees.

2. **Frontend**

   ```bash
   cd ../ACME-hr-frontend
   cp .env.example .env   # VITE_API_URL=http://localhost:4000
   npm install
   npm run dev            # http://localhost:3000
   ```

3. **Sign in** with `admin@acme.com` / `Admin@12345`.

---

## 9. Deployment

### Frontend (Netlify)

`netlify.toml` is configured:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 20
- **SPA redirect:** all routes → `index.html`

Set `VITE_API_URL` in Netlify environment variables to your production backend URL.

### Backend

Deploy the Express server (e.g. Render) with:

- `DATABASE_URL` and `DIRECT_URL` pointing to Supabase
- `FRONTEND_URL` set to your Netlify domain (for CORS)
- `JWT_SECRET` and Supabase keys

---

## 10. Project Structure

### Frontend (`src/`)

```
src/
├── api/              # REST clients (auth, employees, users, analytics, bulk, …)
├── components/       # Layout, ProtectedRoute, form dialogs, ConfirmDialog
├── context/          # NotificationContext
├── hooks/            # React Query hooks (useEmployees, useAuth, useAnalytics, …)
├── lib/              # queryClient, queryKeys, MUI theme
├── pages/            # Route-level page components
├── providers/        # AppProviders, AuthProvider
├── schemas/          # Zod validation schemas (mirror backend validators)
├── types/            # Shared TypeScript types and enums
└── utils/            # format, payroll, sessionStorage helpers
```

### Backend (`src/`)

```
src/
├── config/           # Admin seed config, Supabase config
├── controllers/      # HTTP request handlers
├── data/             # Seed data generators
├── lib/              # Prisma client, database connection, seed scripts
├── middleware/       # authenticate, authorize, validate, upload, errorHandler
├── routes/           # Express route definitions
├── services/         # Business logic
├── types/            # Enums and Express type extensions
├── utils/            # JWT, pagination, PDF generation, password hashing
└── validators/       # Zod request schemas
```

---

## 11. Engineering Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| SPA vs Next.js | Vite + React SPA | Clear API boundary, independent deploy, matches MERN expertise |
| State management | React Query only | Server-state heavy app; no Redux needed beyond AuthProvider |
| UI library | Material UI | Professional HR admin UI, responsive DataGrid-style tables |
| Validation | Zod on both layers | Type-safe forms on frontend; request validation on backend |
| Database | Supabase PostgreSQL | Managed Postgres with pooling; no DevOps overhead |
| Auth | Custom JWT + refresh tokens | Full control over roles; refresh revocation on logout |
| File storage | Local `uploads/` directory | Simpler than R2 for assessment; upgrade path to S3/R2 in v2 |
| Pagination | Always server-side | Never load 10k rows to the browser |
| Salary history | `salary_records` table | Effective dating, audit trail, point-in-time analytics |

---

## 12. License
Private — ACME HR Portal assessment project.
