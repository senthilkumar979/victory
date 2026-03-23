# MentorBridge (victory)

A [Next.js](https://nextjs.org) application for **MentorBridge**, a not-for-profit community that helps students prepare for the IT industry through training, mentorship, and hands-on experience. The site combines marketing pages, student profiles, learning roadmaps, blogs, and authenticated member areas.

## Tech stack

| Area               | Technologies                                                                           |
| ------------------ | -------------------------------------------------------------------------------------- |
| Framework          | **Next.js 16** (App Router), **React 19**, **TypeScript**                              |
| Styling            | **Tailwind CSS 4**, **Radix UI**, **class-variance-authority**, **tw-animate-css**     |
| Auth               | **Clerk** (`@clerk/nextjs`)                                                            |
| Data               | **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`)                                |
| Forms & validation | **react-hook-form**, **Zod**, **@hookform/resolvers**                                  |
| Tables             | **TanStack Table**                                                                     |
| Animation          | **motion**, **framer-motion**                                                          |
| Diagrams / canvas  | **React Flow**, **D3**                                                                 |
| Rich text          | **react-quill** (and a Quill-based editor in `src/ui/organisms/rich-text-editor`)      |
| Email / APIs       | **Resend**, **Google APIs** (Calendar, Forms), **Cloudinary**, **Vercel Blob**         |
| Analytics          | **Vercel Analytics**, **Speed Insights**, **Microsoft Clarity**                        |
| Tooling            | **ESLint**, **Vitest** (with Storybook browser tests via Playwright), **Storybook 10** |
| Compiler           | **React Compiler** (enabled in `next.config.ts`)                                       |

## Repository layout (high level)

```
src/
  app/                 # App Router: pages, layouts, API routes (`app/api`)
  components/          # Shared UI (navbar, profile, roadmap, etc.)
  hooks/               # Reusable React hooks (data, auth helpers, etc.)
  lib/                 # Clients (Supabase, Resend, Google helpers, etc.)
  types/               # Shared TypeScript types
  ui/                  # Design-system style atoms / molecules / organisms / templates
  data/roadmaps/       # Roadmap content and metadata (e.g. React learning path)
public/
  service-worker.js    # Used for web push subscription flow
supabase/
  functions/           # Supabase Edge Functions (e.g. push notification helpers)
```

Path aliases are defined in `tsconfig.json` (e.g. `@/*` → `src/*`, `@/modules/*`, `@/organisms/*`).

## Getting started

**Requirements:** Node.js compatible with Next.js 16 (see Next.js docs), npm (or pnpm/yarn).

```bash
npm install
# Create .env.local at the repo root and add variables your features need (see below).
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command                   | Purpose                               |
| ------------------------- | ------------------------------------- |
| `npm run dev`             | Development server with hot reload    |
| `npm run build`           | Production build                      |
| `npm start`               | Run production server (after `build`) |
| `npm run lint`            | ESLint                                |
| `npm run storybook`       | Storybook on port 6006                |
| `npm run build-storybook` | Static Storybook build                |

Vitest is configured in `vitest.config.ts` (Storybook integration with Playwright browser tests).

## Main product areas

- **Homepage** — Hero, programs, mentors, mission/vision, placements, contact, and related sections under `src/app/modules/Homepage/`.
- **Students** — Directory and profile pages (`/students`, `/students/[id]`) backed by Supabase student data and rich profile components.
- **Roadmaps** — Interactive learning roadmaps (`/roadmaps`, `/roadmaps/[slug]`) using React Flow and structured content in `src/data/roadmaps/`.
- **Blogs** — Listing and blog experience under `src/app/blogs/`.
- **Hall of Fame** — Dedicated hall-of-fame experience under `src/app/hall-of-fame/`.
- **Events, gallery, products** — Standalone pages for events, gallery, and products.
- **Legal** — Privacy policy and terms.
- **Auth** — Clerk-powered sign-in/sign-up and password reset flows (`/sign-in`, `/sign-up`, `/session-tasks/reset-password`).
- **Authenticated app** — Routes under `/secured/` and profile flows (e.g. account area, profile editing) use Clerk; middleware uses `clerkMiddleware` for protected paths such as `/post-login` and `/secured/*`.

> **Note:** This README intentionally does not document internal operational or restricted tools.

## API routes (`src/app/api`)

Server routes include (non-exhaustive): contact email, blog sync/add, Cloudinary image helpers, calendar/meeting operations (Google Calendar), meeting feedback forms, invitations, profile uploads, AI-assisted self-intro generation (Gemini), email send helpers, and scheduled/cron-style email jobs. See each `route.ts` for request/response details and required environment variables.

## Images

Remote image domains allowed for `next/image` are listed in `next.config.ts` under `images.remotePatterns`.

## Deployment

The project is set up for deployment on **Vercel** (Analytics and Speed Insights are integrated). Point environment variables to production values in the hosting dashboard.

## License / privacy

This repository is **private** (`package.json`). Respect user data and API keys in all environments.
