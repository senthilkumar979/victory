# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

MentorBridge (`victory`) is a single Next.js 16 App Router application (not a monorepo). See `README.md` for full tech stack and repository layout.

### Required runtime

- **Node.js 20** (matches CI) — use `nvm use 20`
- **pnpm 9** (matches CI lockfile) — `pnpm install --frozen-lockfile`

### Environment variables

The app requires a `.env.local` at the repo root. Two services are **required** for the app to fully function:

| Service | Env vars | Notes |
|---------|----------|-------|
| **Clerk** | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Auth middleware runs on every request; invalid keys cause a 500 on all routes |
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Core data layer for students, blogs, meetings, etc. |

All other services (Gemini AI, Resend, Cloudinary, Google Calendar, PostHog, Sentry, etc.) degrade gracefully when their env vars are absent.

### Commands reference

| Task | Command |
|------|---------|
| Dev server | `pnpm run dev` (port 3000) |
| Lint | `pnpm run lint` |
| Unit tests | `pnpm run test` |
| All tests (including Storybook browser) | `pnpm run test:all` |
| Storybook | `pnpm run storybook` (port 6006) |
| Build | `pnpm run build` |

### Gotchas

- **Clerk middleware 500**: Without valid Clerk keys in `.env.local`, every route returns HTTP 500 (`Publishable key not valid`). Static assets under `/_next/` still work. The dev server is healthy — the error is from the auth layer only.
- **ESLint baseline**: The repo has ~63 pre-existing lint errors (mostly `storybook/no-renderer-packages` and unused vars). CI only runs `pnpm run lint` but the workflow does not currently fail on these.
- **Vitest projects**: `pnpm run test` runs the `app` project (jsdom, `src/**/*.test.{ts,tsx}`). `pnpm run test:all` also runs the `storybook` project which requires Playwright/Chromium browser tests.
- **Next.js middleware deprecation warning**: The console shows "The middleware file convention is deprecated. Please use proxy instead." — this is a Next.js 16 migration notice and does not break anything.
