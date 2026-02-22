# Aarogya Frontend

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=kinveetech_AarogyaFrontend&metric=alert_status&token=3a64600123347547caaf340de919c549f8a20131)](https://sonarcloud.io/summary/new_code?id=kinveetech_AarogyaFrontend)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=kinveetech_AarogyaFrontend&metric=coverage&token=3a64600123347547caaf340de919c549f8a20131)](https://sonarcloud.io/summary/new_code?id=kinveetech_AarogyaFrontend)

A patient and doctor portal for managing health records, built with Next.js and the **Serene Bloom** design system. Part of the Aarogya platform by [Kinvee Technologies](https://github.com/kinveetech).

> **Status:** Scaffolding phase — architecture and design are documented, application code is in progress.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, React Server Components) |
| Language | TypeScript (strict mode) |
| UI | Chakra UI v2 with custom Serene Bloom theme |
| Auth | NextAuth.js v5 + AWS Cognito (PKCE) |
| Server State | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts v2 |
| PDF | react-pdf |
| PWA | next-pwa |
| Backend | ASP.NET Core 9.0 ([AarogyaBackend](https://github.com/kinveetech/AarogyaBackend)) |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev        # http://localhost:3000
```

### Build & Lint

```bash
npm run build
npm run lint
```

### Testing

```bash
npm test               # Unit tests
npm run test:coverage  # Unit tests with coverage report
npm run test:e2e       # Playwright E2E tests (all browsers)
```

Coverage thresholds are enforced in CI — builds fail if coverage drops below 80% lines, 80% functions, or 70% branches. SonarCloud tracks coverage trends and gates PRs on new code quality.

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/           # Public — login page
│   ├── (auth)/callback/        # NextAuth callback
│   ├── (portal)/reports/       # Protected — report listing, detail, upload
│   ├── (portal)/access/        # Doctor access grants
│   ├── (portal)/emergency/     # Emergency contacts
│   ├── (portal)/settings/      # Profile + notifications
│   └── api/auth/[...nextauth]/ # Auth API routes
├── components/
│   ├── ui/                     # Generic UI primitives (no business logic)
│   └── {reports,access,charts}/ # Feature components with data fetching
├── lib/
│   └── schemas/                # Zod validation schemas
└── theme/
    ├── tokens.ts               # Design tokens (colors, fonts, spacing)
    └── index.ts                # Chakra UI extendTheme config
```

## Architecture

### Authentication

Uses a BFF (Backend-for-Frontend) pattern. NextAuth.js stores tokens server-side in an encrypted JWE session cookie (`httpOnly`, `SameSite=Lax`). The access token never reaches client JavaScript — all API calls are proxied through Next.js API routes which attach the Bearer token.

### State Management

- **Server state** — TanStack Query with configured stale times per resource
- **Form state** — React Hook Form + Zod schemas
- **UI state** — `useState` local to components; theme/sidebar/toasts via React Context

### File Uploads

Direct-to-S3 uploads via presigned URLs with progress tracking (max 50 MB, PDF/JPEG/PNG). Downloads served through CloudFront signed URLs.

## Design System

The app uses the **Serene Bloom** design language. Open `docs/design-system.html` in a browser for the full interactive reference.

- **Fonts:** DM Serif Display (headings) · Outfit (body) · DM Mono (data)
- **Theme:** Glassmorphic cards, full-radius buttons, teal/sage/cream palette
- **Motion:** Shield Tree loading animation, pulse rings, heartbeat lines, ambient orbs

Design tokens live in `src/theme/tokens.ts` — always use semantic tokens (`bg.canvas`, `text.primary`, `action.primary`) instead of raw hex values.

## Security

- **CI** — Lint, type-check, `npm audit`, and build verification on every PR
- **CodeQL** — Static analysis for JavaScript/TypeScript on PRs and weekly
- **Dependabot** — Weekly dependency and GitHub Actions update PRs
- **SonarCloud** — Automatic code quality and security analysis on every PR
- **CODEOWNERS** — All changes require review; security-sensitive paths explicitly guarded

See [SECURITY.md](SECURITY.md) for the vulnerability disclosure policy.

## License

Private — Kinvee Technologies. All rights reserved.
