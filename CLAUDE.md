# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

This repository is in the scaffolding phase. Architecture and design are documented in `docs/`. No application code exists yet.

## Project

A single Next.js application — the patient & doctor portal. There is no admin dashboard in this repo.

## Design System — Serene Bloom

The app uses the **Serene Bloom** design language. Open `docs/design-system.html` in a browser for the full interactive reference.

- **Theme files**: `src/theme/tokens.ts` (raw tokens) and `src/theme/index.ts` (Chakra UI v3 `createSystem`)
- **Always use semantic tokens** from `tokens.ts` (`bg.canvas`, `text.primary`, `action.primary`, etc.) — never raw hex values
- **Fonts**: DM Serif Display (headings/brand) + Outfit (body/UI) + DM Mono (data/code)
- **Background**: a fixed `165deg` gradient (cream→sage wash in light, dark-teal in dark) applied globally in `styles.global` — individual pages need no background
- **Cards**: glass morphic (`bg.glass` + `backdropFilter: blur`) with `border.subtle` borders; use `variant="glass"` on gradient backgrounds
- **Buttons**: always `borderRadius="full"`; primary uses `action.primary`, has a soft lift on hover
- **Progress bars**: always use `progressGradient` (teal→sage→amber) for health metrics; single-color variants (sage/amber/coral) for status indication
- **Motion**: lotus bloom (full-page loading), pulse ring (live status), heartbeat SVG line (vitals), leaf particles (ambient) — see `docs/design-system.html §04`
- **Ambient orbs**: three blurred circles (`orb.primary/secondary/tertiary`) float in the page background — implemented once in the root layout, not per-page

## Common Commands

Once scaffolded, the expected commands are:

```bash
npm install

npm run dev        # localhost:3000
npm run build
npm run lint
```

## Tech Stack

- **Next.js 16** with App Router + React Server Components
- **React 19** + **TypeScript 5** strict mode
- **Chakra UI v3** — theme config in `src/theme/` (uses `createSystem` + `defineTokens` + `defineSemanticTokens`)
- **next-themes** — color mode (dark/light) persistence
- **NextAuth.js v5** with custom Cognito PKCE provider
- **TanStack Query v5** — all server state; no global state library (Redux/Zustand/etc.)
- **React Hook Form + Zod** — all forms; schemas in `src/lib/schemas/`
- **Recharts v2** — vitals/parameter trend charts
- **react-pdf** — embedded PDF viewer
- **next-pwa** — service worker + offline support

## Architecture Decisions

### Authentication
BFF (Backend-for-Frontend) pattern: NextAuth.js stores tokens server-side in an encrypted JWE session cookie (httpOnly, SameSite=Lax). The `access_token` never reaches client JavaScript. All API calls are proxied through Next.js API routes which attach the Bearer token.

PKCE flow: `POST /auth/pkce/authorize` → Cognito hosted UI (OTP / Google / Email) → `POST /auth/pkce/token` → NextAuth session. Token rotation is enforced on each refresh via `POST /auth/token/refresh`.

### State Management
- **Server state**: TanStack Query with configured stale times (reports: 2min, profile: 10min, access-grants: 1min, consents: 30min). ETag support on report list.
- **Form state**: React Hook Form + Zod; schemas in `src/lib/schemas/`
- **UI state**: `useState` local to components; theme/sidebar/toasts via React Context + localStorage

### Component Layers
1. **UI primitives** (`src/components/ui/`) — generic, no business logic: `DataTable`, `FileDropzone`, `StatusBadge`, `EmptyState`, `ConfirmDialog`, `DateRangePicker`
2. **Feature components** (`src/components/{reports,access,charts}/`) — business logic, use TanStack Query hooks
3. **Page components** (`src/app/`) — route-level composition only

### File Upload Flow
1. `POST /v1/reports/upload-url` → get presigned S3 PUT URL
2. Client uploads directly to S3 via XHR (progress tracking, max 50MB, PDF/JPEG/PNG)
3. `POST /v1/reports` → create report record after S3 upload completes
4. Downloads via CloudFront signed URLs (`POST /v1/reports/download-url`)

### Route Groups
```
src/app/
  (auth)/login/         # Public
  (auth)/callback/      # NextAuth callback
  (portal)/reports/     # Protected — listing, [id] detail, upload
  (portal)/access/      # Doctor access grants
  (portal)/emergency/   # Emergency contacts
  (portal)/settings/    # Profile + notifications
  api/auth/[...nextauth]/
```

## Backend
ASP.NET Core 9.0 API (separate repo: `kinveetech/AarogyaBackend`) — PostgreSQL + Redis + AWS. All API endpoints are versioned under `/v1/` except auth which is unversioned (`/auth/*`).
