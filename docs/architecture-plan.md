# Aarogya Frontend — Architecture Plan

> Phase 6: Web Frontends · 10 Issues · 6 Weeks · 1 Application
> Backend repo: [kinveetech/AarogyaBackend](https://github.com/kinveetech/AarogyaBackend)

---

## 01 — System Overview

A public-facing patient & doctor portal consuming the Aarogya REST API.

```
┌──────────────────────────────┐
│   Patient / Doctor Portal    │
│   Next.js 14 + Chakra UI     │
│                              │
│ • Report management & PDF    │
│ • Doctor access grants       │  REST/JWT
│ • Vitals visualization       │◄──────────►  Aarogya Backend
│ • Emergency contacts         │              ASP.NET Core 9.0
│ • Report upload              │              PostgreSQL + Redis + AWS
│ • Consent management         │
│ • Push notification prefs    │
│ • PWA offline support        │
└──────────────────────────────┘
```

**Backend endpoints consumed:**

| Method | Path |
|---|---|
| POST | `/auth/otp/*` |
| POST | `/auth/pkce/*` |
| POST | `/auth/social/*` |
| GET | `/v1/users/me` |
| GET/POST/DEL | `/v1/reports`, `/v1/reports/:id`, `/v1/reports/upload*`, `/v1/reports/download-url` |
| GET/POST/DEL | `/v1/access-grants`, `/v1/access-grants/:id` |
| GET/POST/DEL | `/v1/emergency-contacts`, `/v1/emergency-contacts/:id` |
| GET/PUT | `/v1/consents`, `/v1/consents/:purpose` |
| GET/POST | `/v1/notifications/*` |
| POST | `/v1/emergency-access/*` |
| GET | `/health/ready` |

---

## 02 — Tech Stack

> Next.js App Router — `localhost:3000`

| Technology | Version |
|---|---|
| Next.js | 14 App Router |
| TypeScript | strict mode |
| Chakra UI | v2 |
| NextAuth.js | v5 + Cognito |
| TanStack Query | v5 |
| React Hook Form | + Zod |
| Recharts | v2 |
| react-pdf | PDF viewer |
| next-pwa | service worker |

---

## 03 — Directory Structure

```
src/
  app/                        # Next.js App Router
    (auth)/                   # Auth route group
      login/page.tsx
      callback/page.tsx
    (portal)/                 # Protected route group
      reports/
        page.tsx              # Report listing
        [id]/page.tsx         # Report detail
        upload/page.tsx       # Upload flow
      access/
        page.tsx              # Doctor access grants
      emergency/
        page.tsx              # Emergency contacts
      settings/
        page.tsx              # Profile + notifications
      layout.tsx              # Portal shell layout
    layout.tsx                # Root layout + providers
    api/auth/[...nextauth]/
  components/
    reports/                  # Report feature components
    access/                   # Access grant components
    charts/                   # Recharts visualizations
    ui/                       # Shared UI primitives
  hooks/                      # Custom React hooks
  lib/                        # Auth config, utils
  providers/                  # Query, Auth, Theme
  theme/                      # Chakra UI theme config
next.config.js
tsconfig.json
package.json
```

---

## 04 — Authentication Flow

NextAuth.js v5 with a custom Cognito PKCE provider. Tokens are kept server-side, exposing only a secure session cookie to the browser.

### Step 1 — Browser: User clicks "Sign In"
NextAuth.js redirects to `POST /api/auth/pkce/authorize` which generates a PKCE challenge and returns the Cognito hosted UI URL with `code_challenge` + `state`.

### Step 2 — AWS Cognito: User authenticates (Phone OTP / Google / Email)
Cognito presents the hosted login UI. For phone-based auth, the backend handles `POST /api/auth/otp/request` and `/otp/verify`. Social login (Google) goes via `POST /api/auth/social/token`. All flows produce an authorization code.

### Step 3 — Callback: Code exchange for tokens
The callback hits `POST /api/auth/pkce/token` with the auth code + `code_verifier`. The backend exchanges with Cognito and returns `access_token`, `refresh_token`, and `id_token`. NextAuth stores them server-side.

### Step 4 — Session: Secure httpOnly session cookie set
NextAuth.js encrypts the session (JWE) into an httpOnly, SameSite=Lax cookie. The `access_token` **never reaches client JavaScript**. API requests are proxied through Next.js API routes which attach the Bearer token.

### Step 5 — Refresh: Silent token rotation
When the access token expires, the NextAuth `jwt` callback detects it and calls `POST /api/auth/token/refresh`. If the refresh fails, the user is signed out. Token rotation is enforced — each refresh invalidates the previous refresh token.

---

## 05 — API Integration Layer

TanStack Query hooks wrap typed API functions with caching, stale-while-revalidate, and optimistic updates.

### Reports API (7 endpoints)

| Endpoint | Description |
|---|---|
| `GET /v1/reports` | Report listing — paginated, filtered by type/status/date. ETag caching via TanStack Query. |
| `GET /v1/reports/:id` | Report detail — structured parameters, signed download URL, PDF viewer. |
| `POST /v1/reports/upload-url` | Upload step 1 — get presigned S3 PUT URL for client-direct upload. |
| `POST /v1/reports` | Upload step 2 — create report record after S3 upload completes. |
| `POST /v1/reports/upload` | Alternative: direct multipart upload (PDF/JPEG/PNG, max 50MB). |
| `POST /v1/reports/download-url` | Generates signed S3/CloudFront GET URL for secure download. |
| `DELETE /v1/reports/:id` | Soft-delete. Optimistic update with TanStack Query rollback. |

### Auth API (8 endpoints)

| Endpoint | Description |
|---|---|
| `POST /auth/pkce/authorize` | Generate PKCE challenge + Cognito redirect URL |
| `POST /auth/pkce/token` | Exchange auth code for access + refresh + ID tokens |
| `POST /auth/otp/request` | Request phone OTP for Indian mobile numbers |
| `POST /auth/otp/verify` | Verify phone OTP code |
| `POST /auth/social/token` | Exchange Google OAuth code for Cognito tokens |
| `POST /auth/token/refresh` | Silent token refresh (called by NextAuth jwt callback) |
| `POST /auth/token/revoke` | Revoke refresh token on sign-out |
| `GET /auth/me` | Validate JWT + return claims (sub, email, roles) |

### Access & Emergency API (6 endpoints)

| Endpoint | Description |
|---|---|
| `GET /v1/access-grants` | List grants given by patient to doctors |
| `POST /v1/access-grants` | Create time-scoped report access for a doctor |
| `DELETE /v1/access-grants/:id` | Revoke an active access grant |
| `GET /v1/emergency-contacts` | List emergency contacts (max 3) |
| `POST /v1/emergency-contacts` | Add new emergency contact |
| `DELETE /v1/emergency-contacts/:id` | Remove emergency contact |

### Users, Consents & Notifications API (7 endpoints)

| Endpoint | Description |
|---|---|
| `GET /v1/users/me` | Fetch user profile (decrypted PII fields) |
| `PUT /v1/users/me` | Update profile fields (name, phone, blood group, etc.) |
| `POST /v1/users/me/aadhaar/verify` | Verify Aadhaar via tokenized vault |
| `GET /v1/consents` | Fetch consent records for all 4 purposes |
| `PUT /v1/consents/:purpose` | Grant or withdraw consent for a purpose |
| `GET /v1/notifications/preferences` | Notification channel preferences (push, email, SMS) |
| `POST /v1/notifications/devices` | Register FCM device token for push notifications |

---

## 06 — State Management

Server-cached data (TanStack Query) is separated from ephemeral UI state (React useState/useReducer). No global state library needed.

### Server State — TanStack Query v5
All API data flows through TanStack Query with configured stale times, background refetch, and cache invalidation.
- Reports list: staleTime 2min, refetch on window focus
- User profile: staleTime 10min, cached across routes
- Access grants: staleTime 1min, invalidate on mutation
- Consents: staleTime 30min, rarely changes
- ETag support for report list (conditional GET)

### Form State — React Hook Form + Zod
Every form uses React Hook Form with Zod schema validation. Schemas live in `src/lib/schemas/`.
- Report upload: multi-step with file + metadata
- Access grant creation: doctor search + scope
- Profile edit: inline field editing
- Emergency contacts: add/edit modal
- Consent toggles: immediate PUT on change

### UI State — React useState / Context
Ephemeral UI state stays local to components. Theme, sidebar state, and notification toasts use lightweight React Context.
- Filter/search inputs: local useState
- Modal open/close: local useState
- Theme preference: Context + localStorage
- Sidebar collapsed: Context + localStorage
- Upload progress: local useState in uploader

---

## 07 — Component Architecture

Components follow a three-layer pattern: UI primitives, feature components (business logic), and page components (route-level composition).

### Layer 1 — UI Primitives (`src/components/ui/`)

| Component | Description |
|---|---|
| `<DataTable />` | Generic sortable, paginated table with virtual scroll option |
| `<FileDropzone />` | Drag-and-drop file input with preview and validation |
| `<StatusBadge />` | Colored badge for report status, grant status, etc. |
| `<EmptyState />` | Illustrated empty state with configurable action button |
| `<ConfirmDialog />` | Accessible confirmation modal (delete, revoke, etc.) |
| `<DateRangePicker />` | Calendar-based date range selection for filters |

### Layer 2 — Feature Components — Reports (`src/components/reports/`)

| Component | Description |
|---|---|
| `<ReportList />` | Filtered report grid with type/status/date range controls |
| `<ReportCard />` | Summary card with status badge, date, and actions |
| `<ReportDetail />` | Full report view with parameter table + PDF viewer |
| `<ParameterTable />` | Test parameters with abnormal value highlighting |
| `<ReportUploader />` | Multi-step upload: file → metadata → submit |
| `<PDFViewer />` | Embedded PDF viewer via react-pdf |

### Layer 2 — Feature Components — Access & Emergency (`src/components/access/`)

| Component | Description |
|---|---|
| `<GrantList />` | Active grants with expiry countdown and revoke action |
| `<CreateGrantFlow />` | Multi-step: search doctor → select scope → set expiry |
| `<DoctorSearch />` | Typeahead doctor search with debounced API calls |
| `<EmergencyContactList />` | Contact cards with edit/delete, max 3 enforcement |
| `<ContactForm />` | Add/edit contact modal with phone validation |
| `<ConsentManager />` | Toggle switches for 4 consent purposes with confirmation |

### Layer 2 — Feature Components — Charts (`src/components/charts/`)

| Component | Description |
|---|---|
| `<VitalsTrend />` | Line chart with normal range overlay (Recharts) |
| `<ParameterHistory />` | Historical values for a specific test parameter |
| `<BloodSugarChart />` | Specialized glucose trending with meal context |
| `<ReportTimeline />` | Visual timeline of all reports by date |

---

## 08 — Implementation Roadmap

10 issues organized into sequential phases.

### Phase 1 — Scaffolding (Week 1)

| Issue | Size | Title | Dependencies |
|---|---|---|---|
| #72 | M (1–3d) | Scaffold Next.js 14 patient portal | None |

**#72** — Initialize Next.js 14 with App Router, TypeScript strict, Chakra UI, ESLint, Prettier.

### Phase 2 — Core Features (Weeks 2–4)

| Issue | Size | Title | Dependencies |
|---|---|---|---|
| #73 | L (3–5d) | Patient portal authentication flow | #72 |
| #74 | L (3–5d) | Report listing page | #73 |
| #75 | L (3–5d) | Report detail view | #74 |

**#73** — NextAuth.js v5 + AWS Cognito integration. Login, register, social login (Google), logout. PKCE flow with secure session cookies.

**#74** — Paginated report list with filters (type, date, status). TanStack Query with ETag caching. Responsive design.

**#75** — Structured data display (test parameters with abnormal flags), embedded PDF viewer, download via signed URL.

### Phase 3 — Advanced Features (Weeks 4–6)

| Issue | Size | Title | Dependencies |
|---|---|---|---|
| #76 | L (3–5d) | Report upload flow | #73 |
| #77 | L (3–5d) | Doctor access management UI | #73 |
| #78 | M (1–3d) | Emergency contact management UI | #73 |
| #81 | M (1–3d) | Medical charts & vitals visualization | #75 |

**#76** — Drag-and-drop file upload + structured metadata form. React Hook Form + Zod validation. S3 presigned URL upload with progress.

**#77** — Grant/revoke doctor access. Search doctors, select reports, set expiry. View active grants with countdown.

**#78** — CRUD UI for emergency contacts. Max 3 contacts with validation. Confirmation on delete.

**#81** — Recharts.js for trending test parameters over time. Date range selectable, responsive, normal range overlay.

### Phase 4 — Quality & Polish (Week 6)

| Issue | Size | Title | Dependencies |
|---|---|---|---|
| #80 | M (1–3d) | PWA support | #74, #75 |
| #79 | L (3–5d) | WCAG 2.1 AA compliance | #74–#78 |

**#80** — Service worker, offline report viewing (cached recently viewed), install prompt. Critical asset caching.

**#79** — Keyboard navigation, screen reader compatibility, color contrast AA, aria labels throughout. Lighthouse accessibility >= 90.

---

## 09 — Dependency Graph

```
#72 Scaffold ──► #73 Auth ──► #74 Report List ──► #75 Report Detail ──► #81 Charts
                         │                    └──────────────────────► #80 PWA
                         ├──► #76 Upload
                         ├──► #77 Access Management
                         └──► #78 Emergency Contacts
                                                   └──► #79 WCAG (all pages)
```

---

## 10 — Security Considerations

The frontend inherits the backend's zero-trust model. Tokens never touch client JavaScript, and all PII is encrypted at the API layer.

### Token Security
- Access tokens stored server-side in NextAuth.js encrypted JWE session
- httpOnly, Secure, SameSite=Lax session cookie — never accessible to JS
- API requests proxied through Next.js API routes (BFF pattern)
- Refresh token rotation: each use invalidates previous token
- Sign-out explicitly revokes refresh token via `/auth/token/revoke`

### CORS & CSP
- Backend CORS allows `localhost:3000` in development
- Production: strict origin allowlist per environment
- Content-Security-Policy with nonce-based script-src
- `X-Frame-Options: DENY` (no iframe embedding)
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### Data Protection
- All PII encrypted at rest (AES-256-GCM + AWS KMS) — frontend never sees raw encrypted data
- File downloads via time-limited signed URLs (S3/CloudFront)
- Report files scanned for viruses before being marked Clean
- Consent required before any data access (4 purposes)
- Aadhaar numbers tokenized — frontend only sees reference tokens

### Input & Transport
- Zod schemas validate all form inputs before submission
- Backend InputSanitizer strips dangerous characters as a second defense
- File upload validation: PDF/JPEG/PNG only, max 50MB, checksum verified
- HTTPS enforced in production (HSTS preload)
- Rate limiting on auth endpoints (per-IP and per-user)

---

## 11 — Performance Strategy

Target: sub-second interactions with aggressive caching, code splitting, and progressive enhancement via PWA.

### Time to Interactive — target < 1s
- Next.js App Router with React Server Components
- Streaming SSR for initial page load
- Route-level code splitting (dynamic imports)
- Chakra UI tree-shaking for minimal CSS

### Caching Strategy — Stale While Revalidate
- TanStack Query stale-while-revalidate
- ETag support on report list (HTTP 304)
- Redis-backed API cache (2min reports, 10min profile)
- Service worker caches recently viewed reports

### PWA — Offline Support
- Service worker pre-caches app shell + critical assets
- Recently viewed reports available offline
- Background sync for queued mutations
- App install prompt for mobile users

### Direct S3 Upload
- Client uploads directly to S3 via presigned URL
- Bypasses API server for large file transfer
- Progress tracking via XMLHttpRequest
- SHA-256 checksum verified server-side

### CDN — Asset Delivery
- CloudFront signed URLs for report downloads
- Edge-cached with RSA-signed custom policy
- Cache invalidation on report soft-delete
- Vercel Edge for Next.js static assets

### Lighthouse Targets
- Performance score >= 90
- Accessibility score >= 90
- Core Web Vitals within "good" thresholds
- Bundle analyzer to track JS size budget
