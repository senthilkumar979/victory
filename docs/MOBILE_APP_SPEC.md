# MentorBridge Admin Mobile App — Technical Specification

**Version:** 1.0  
**Date:** July 19, 2026  
**Domain:** [https://www.mentorbridge.in/](https://www.mentorbridge.in/)  
**Status:** Planning — no implementation yet  
**Audience:** Engineering, product, and mobile development teams

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Goals & Scope](#2-goals--scope)
3. [Target Users & Roles](#3-target-users--roles)
4. [Recommended Tech Stack](#4-recommended-tech-stack)
5. [Platform Strategy](#5-platform-strategy)
6. [Authentication & Security](#6-authentication--security)
7. [Feature Specifications](#7-feature-specifications)
8. [Complete API Specification](#8-complete-api-specification)
9. [Web App Backend Changes Required](#9-web-app-backend-changes-required)
10. [Data Models & TypeScript Interfaces](#10-data-models--typescript-interfaces)
11. [Navigation Architecture](#11-navigation-architecture)
12. [State Management Architecture](#12-state-management-architecture)
13. [Push Notifications](#13-push-notifications)
14. [Deep Linking](#14-deep-linking)
15. [Project Structure](#15-project-structure)
16. [Environment Configuration](#16-environment-configuration)
17. [Testing Strategy](#17-testing-strategy)
18. [CI/CD Pipeline](#18-cicd-pipeline)
19. [Performance & Accessibility](#19-performance--accessibility)
20. [Security Checklist](#20-security-checklist)
21. [Implementation Phases / Roadmap](#21-implementation-phases--roadmap)
22. [Appendix](#22-appendix)

---

## 1. Executive Summary

MentorBridge is a mentorship platform for students and administrators, currently delivered as a **Next.js 16 web application** deployed on Vercel. Authentication is handled by **Clerk**; persistent data lives in **Supabase (Postgres)**. The web app is **not API-first** — most admin CRUD operations (students, meetings, announcements, awards, etc.) call Supabase directly from the browser using the anon key, while a smaller set of features use Next.js API routes with Clerk session validation.

This document specifies a **React Native admin mobile app** that gives MentorBridge administrators full operational control from Android (priority) and iOS devices. The mobile app will authenticate via Clerk, consume a new **Mobile BFF (Backend-for-Frontend) API layer** hosted under `https://www.mentorbridge.in/api/mobile/v1/`, and mirror the admin capabilities currently available at `/secured/admin`.

**Critical prerequisite:** Before mobile development can proceed beyond auth and read-only features, the web backend must expose secured REST endpoints for all admin modules currently accessed via direct Supabase client calls. Sections 8 and 9 detail existing endpoints and required new ones.

**Cost & deployment strategy:** Use **Expo SDK + Expo Router** (free OSS) with **local release builds** and optional **GitHub Actions** (free tier) for Android AABs. **Do not rely on paid EAS Build/Submit/Update tiers.** Android ships to **Google Play** (Console already owned). iOS is **Phase 2, solo personal use only** — no public App Store listing; sideload via Xcode or optional TestFlight with Apple Developer ($99/yr). See §4.8 and §18.

---

## 2. Goals & Scope

### 2.1 Goals

| Goal | Description |
|------|-------------|
| **Admin mobility** | Enable admins to manage students, meetings, assignments, videos, and announcements from mobile devices |
| **Login gate** | App is unusable until the user completes Clerk sign-in; non-admin users are rejected |
| **Feature parity (phased)** | Reach functional parity with web admin panel over 3 implementation phases |
| **Production quality** | Secure auth, offline-tolerant reads, push notifications, analytics, CI/CD, store deployment |
| **Shared types** | Reuse existing TypeScript interfaces from the web codebase where possible |

### 2.2 In Scope (Admin App v1 → v3)

- Dashboard (admin homepage with KPIs and quick actions)
- Administration hub (all admin modules from `GeneralSettings`)
- Videos (session video CRUD)
- Meetings (CRUD, attendance, Google Meet/Forms integrations, cover images)
- Students List (search, filter, pagination)
- Student Profile View (read + admin edit + guardian details)
- Profile Management (admin's own Clerk profile + linked student record if applicable)
- Account Management (Clerk account settings)
- Roadmaps (static content + progress tracking)
- Blogs (list, sync trigger)
- Gallery (Cloudinary read-only)
- Assignments (CRUD, submission review, feedback)

### 2.3 Out of Scope (Initial Releases)

- Student-facing mobile app (separate product; this spec is **admin-only**)
- Offline write/sync for all modules (Phase 1: read cache only)
- Native video upload (videos are YouTube links, not file uploads)
- Gallery upload (web uses read-only Cloudinary; no upload API exists)
- LinkedIn publish, visitor chat admin, award PDF generation (low-priority admin tools)
- Module Federation / shared React components with web (different runtime)

### 2.4 Assumptions

- Admins are provisioned in Clerk with `publicMetadata.role = "admin"` or `publicMetadata.isAdmin = true`
- Mobile app connects to production API at `https://www.mentorbridge.in`
- Backend changes ship to the existing Next.js repo before mobile Phase 1 feature work
- Android ships first; iOS follows after Android beta validation

---

## 3. Target Users & Roles

### 3.1 Role Matrix

| Role | Clerk Metadata | Mobile Access | Web Equivalent |
|------|----------------|---------------|----------------|
| **Admin** | `publicMetadata.role === "admin"` OR `publicMetadata.isAdmin === true` | Full admin app | `/secured/admin` |
| **Student** | `publicMetadata.role === "student"` | **Denied** — show "Admin access required" screen | `/secured/dashboard` |
| **Unauthenticated** | — | **Denied** — login screen only | `/sign-in` |

### 3.2 Admin Personas

1. **Program Manager** — manages students, meetings, announcements, assignments
2. **Content Admin** — manages videos, blogs sync, gallery browsing
3. **Super Admin** — all modules including awards, hall of fame, partners, Google Groups

### 3.3 Post-Login Routing (Mobile)

Mirror web `/post-login` logic (`src/app/post-login/route.ts`):

```
Signed in?
  NO  → Login screen
  YES → isAdmin?
          YES → Admin Dashboard (Home)
          NO  → Access Denied screen (with sign-out option)
```

Unlike the web student flow, mobile does **not** require a Supabase `students` row for admin users.

---

## 4. Recommended Tech Stack

### 4.1 Core Framework

| Layer | Recommendation | Justification |
|-------|----------------|---------------|
| **Framework** | **Expo SDK 52+** (React Native) | Free OSS; fast iteration, strong Android/iOS parity. **EAS cloud services are optional and not recommended** (see §4.8) |
| **Language** | **TypeScript 5.9+** | Matches web codebase; shared types via monorepo or npm package |
| **Navigation** | **Expo Router v4** (file-based) | Mirrors Next.js App Router mental model; deep linking built-in |
| **UI** | **NativeWind v4** (Tailwind for RN) + **React Native Paper** or **Gluestack UI** | Tailwind parity with web; accessible component primitives |
| **Forms** | **react-hook-form** + **Zod 4** | Identical to web stack (`profileEditFormSchema`, `assignmentFormSchema`, etc.) |

### 4.2 Data & State

| Layer | Recommendation | Justification |
|-------|----------------|---------------|
| **Server state** | **TanStack Query v5** | Caching, refetch, pagination, optimistic updates; web lacks this but mobile needs it |
| **Client state** | **Zustand** (minimal) | Auth session flags, UI toggles, filter persistence |
| **API client** | **Axios** or **fetch wrapper** | Interceptors for Clerk JWT, error normalization, retry |
| **Secure storage** | **expo-secure-store** | Clerk tokens, refresh tokens |
| **Offline cache** | TanStack Query `persistQueryClient` + **AsyncStorage** | Read-only cache for lists (students, meetings) |

### 4.3 Authentication

| Layer | Recommendation | Justification |
|-------|----------------|---------------|
| **Auth provider** | **@clerk/clerk-expo** | Same provider as web; supports OAuth, email/password, session tokens |
| **Token strategy** | Clerk session JWT in `Authorization: Bearer <token>` header | Required for mobile — cookies don't work cross-app |

### 4.4 Media & Files

| Layer | Recommendation | Justification |
|-------|----------------|---------------|
| **Images** | **expo-image** | Optimized caching for student avatars, meeting covers, gallery |
| **File pickers** | **expo-document-picker**, **expo-image-picker** | Profile resume/picture upload (mirrors Vercel Blob flow) |
| **YouTube** | **react-native-youtube-iframe** or **WebView embed** | Session videos are YouTube URLs only |

### 4.5 Push, Analytics, Monitoring

| Layer | Recommendation | Justification |
|-------|----------------|---------------|
| **Push (FCM/APNs)** | **Expo Notifications** + **FCM** (Android) / APNs (iOS) | Replace web VAPID push; new `mobile_push_subscriptions` table needed |
| **Analytics** | **PostHog React Native SDK** | Web already uses PostHog (`NEXT_PUBLIC_POSTHOG_KEY`) |
| **Crash reporting** | **Sentry React Native** | Web uses `@sentry/nextjs` |
| **Session replay** | Skip for v1 | Not applicable on native |

### 4.6 Testing & CI/CD

| Layer | Recommendation | Justification |
|-------|----------------|---------------|
| **Unit tests** | **Vitest** + **@testing-library/react-native** | Consistent with web Vitest setup |
| **E2E (Android first)** | **Maestro** | Simpler than Detox for Expo; YAML flows, fast CI |
| **E2E (iOS)** | Maestro (same flows) | Cross-platform test files |
| **CI/CD** | **Local builds** (`expo prebuild`, `expo run:*`) + optional **GitHub Actions** (free tier) | Zero-cost path; manual Play Console upload for Android. Fastlane optional for iOS metadata |
| **App updates** | **Play Store releases** (Android); sideload/TestFlight (iOS) | Avoid paid EAS Update; ship fixes via new native builds |

### 4.7 Monorepo Strategy (Recommended)

```
mentorbridge/
├── apps/
│   ├── web/          # existing Next.js app
│   └── mobile/       # Expo app
└── packages/
    └── shared-types/ # ProfileData, Assignment, SessionVideo, Zod schemas
```

Alternative: copy types initially, extract shared package in Phase 2.

### 4.8 Cost & Licensing

| Item | Cost | Notes |
|------|------|-------|
| **Expo SDK + Expo Router** | Free (OSS) | Recommended core stack; no EAS subscription required |
| **Local builds** (`expo prebuild`, `expo run:android`, `expo run:ios`) | Free | Requires Android Studio and/or Xcode on dev machine |
| **GitHub Actions** (free tier) | Free | Optional CI for lint, tests, and Android AAB artifact builds |
| **Clerk** (auth) | Free tier | Matches existing web auth; upgrade only if MAU limits exceeded |
| **FCM** (Android push) | Free | Firebase Cloud Messaging |
| **Google Play Console** | **Already paid ($25 one-time)** | Primary production distribution path for admin app |
| **Apple Developer Program** | Optional **$99/yr** | Recommended for solo iOS daily use: 1-year cert, TestFlight, ad-hoc |
| **Free Apple ID + Xcode** | Free | 7-day signing cert; reinstall weekly — fine for occasional iOS testing |
| **Avoid** | **EAS Build / Submit / Update paid tiers** | Use local builds + optional GitHub Actions instead |

---

## 5. Platform Strategy

### 5.1 Android First

| Phase | Platform | Milestone |
|-------|----------|-----------|
| Phase 0 | Android internal | Auth + API smoke tests on physical devices (local release builds) |
| Phase 1 | Android closed beta | Google Play Internal Testing track (AAB upload via Play Console) |
| Phase 2 | Android production | Google Play production release — **primary distribution path** |
| Phase 3 | iOS personal/dev | Solo admin device only; **no public App Store listing** |
| Phase 4 | iOS convenience (optional) | TestFlight or ad-hoc with Apple Developer ($99/yr) if weekly Xcode reinstall is undesirable |

**Android** is the production target. **Google Play Console is already purchased** — all public admin distribution goes through Play Store tracks (Internal → Open → Production).

**iOS** is Phase 2 (after Android stabilizes), **personal use only** (single admin user). Distribution options:

| Option | Cost | Certificate | Best for |
|--------|------|-------------|----------|
| Free Apple ID + Xcode (`expo run:ios --device`) | Free | 7-day; reinstall weekly | Occasional iOS checks |
| Apple Developer + TestFlight/ad-hoc | $99/yr | 1-year | Daily personal iOS use (recommended if iOS is used regularly) |

No App Store public listing or review process is required for iOS.

### 5.2 Minimum OS Versions

| Platform | Minimum | Target |
|----------|---------|--------|
| Android | API 26 (Android 8.0) | API 34+ |
| iOS | iOS 15 | iOS 17+ |

### 5.3 Device Support

- **Phones:** Primary target (360dp–430dp width)
- **Tablets:** Responsive layouts in Phase 3 (optional split-pane for student list + detail)
- **Orientation:** Portrait primary; landscape supported for video watch screen

### 5.4 Store Listing

- **App name:** MentorBridge Admin
- **Package ID (Android):** `in.mentorbridge.admin`
- **Bundle ID (iOS):** `in.mentorbridge.admin`
- **Category:** Business / Education
- **Android:** Full Play Store listing (production distribution)
- **iOS:** No public App Store listing; internal/personal install only (see §5.1)

---

## 6. Authentication & Security

### 6.1 Login Flow

```
App Launch
  → Check SecureStore for valid Clerk session
    → Valid + admin → Dashboard
    → Valid + not admin → Access Denied
    → Invalid/missing → Login Screen
        → Clerk SignIn (email/password or OAuth if enabled)
        → Fetch Clerk session token
        → GET /api/mobile/v1/me (verify admin role server-side)
        → Store session → Dashboard
```

### 6.2 Clerk Expo Integration

```typescript
// Required Clerk env vars (mobile)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...  // server only, never in mobile bundle
```

Use `@clerk/clerk-expo` with `ClerkProvider`, `SignedIn`, `SignedOut`, `useAuth`, `useUser`.

### 6.3 Token Storage & Refresh

| Item | Storage | Notes |
|------|---------|-------|
| Clerk session token | `expo-secure-store` | Short-lived JWT |
| Refresh handling | Clerk SDK automatic refresh | On 401, attempt refresh once then force re-login |
| User metadata cache | AsyncStorage (non-sensitive) | `isAdmin`, display name, email |

### 6.4 API Authentication Header

All mobile API requests:

```http
Authorization: Bearer <clerk_session_jwt>
Content-Type: application/json
Accept: application/json
X-Client-Platform: android | ios
X-App-Version: 1.0.0
```

Backend validates JWT via Clerk's `verifyToken` or `@clerk/backend` `authenticateRequest`.

### 6.5 Biometric Unlock (Optional — Phase 2)

- After initial Clerk login, offer "Unlock with fingerprint/face"
- Store a device-local flag in SecureStore; re-prompt Clerk only after session expiry
- Use `expo-local-authentication`

### 6.6 Session Expiry UX

- 401 from API → attempt Clerk token refresh
- Refresh fails → clear SecureStore → Login screen with toast "Session expired"
- Background > 30 min → optional re-auth prompt (configurable)

### 6.7 Admin-Only Enforcement

**Client-side:** Check `user.publicMetadata.role === 'admin'` before rendering admin UI.

**Server-side (mandatory):** Every `/api/mobile/v1/admin/*` route calls `requireAdmin()` (existing helper in `src/lib/auth/requireAuth.ts`).

---

## 7. Feature Specifications

### 7.1 Dashboard (Homepage)

#### User Stories

- As an admin, I want to see today's meetings and recent announcements so I can plan my day.
- As an admin, I want quick links to create a meeting, add a student, or post an announcement.
- As an admin, I want assignment submission stats so I know what needs review.

#### Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Admin Dashboard | `/(admin)/dashboard` | KPI cards, today's meetings, recent announcements, pending assignment reviews |

#### Data Requirements

| Source | Data |
|--------|------|
| **NEW** `GET /api/mobile/v1/admin/dashboard` | Aggregated: meeting count today, open assignments, recent announcements, student count, pending submissions |
| Existing | Meetings this week, announcements, assignment stats (currently assembled client-side on web) |

#### UI/UX Notes

- Pull-to-refresh on dashboard
- Skeleton loaders for each section
- Tap KPI card → navigate to relevant module

#### Offline/Cache

- Cache dashboard response for 5 minutes (stale-while-revalidate)
- Show "Last updated X min ago" when offline

---

### 7.2 Administration

#### User Stories

- As an admin, I want a single hub listing all admin modules (mirroring web `GeneralSettings` nav).
- As an admin, I want to manage Google Groups, award categories, partners, presenters, hall of fame, and visitor queries.

#### Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Admin Hub | `/(admin)/administration` | Grid/list of all admin modules |
| Google Groups | `/(admin)/administration/google-groups` | CRUD |
| Announcements | `/(admin)/administration/announcements` | CRUD + push broadcast |
| Hall of Fame | `/(admin)/administration/hall-of-fame` | CRUD |
| Partners | `/(admin)/administration/partners` | CRUD |
| Presenters | `/(admin)/administration/presenters` | CRUD |
| Award Categories | `/(admin)/administration/award-categories` | CRUD |
| Awards | `/(admin)/administration/awards` | CRUD + cover image generate |
| Visitor Queries | `/(admin)/administration/visitor-queries` | Read-only list |

#### Data Requirements

All **need backend implementation** — currently Supabase direct:

| Entity | Supabase Table | Web Hook |
|--------|----------------|----------|
| Google Groups | `google_groups` | `useGoogleGroups` |
| Announcements | `announcements` | `useAnnouncements` |
| Hall of Fame | `hall_of_fame` | `useHallOfFame` |
| Partners | `partners` | `usePartners` |
| Presenters | `presenters` | `usePresenters` |
| Award Categories | `award_categories` | AwardCategories module |
| Awards | `awards` | `useAwards` |
| Visitor Queries | `visitor_chat_queries` | `GET /api/admin/visitor-chat-queries` (exists, needs admin guard) |

#### UI/UX Notes

- Mirror web admin sidebar as a scrollable module grid on mobile
- Destructive actions (delete) require confirmation dialog
- Announcement create triggers push broadcast (same as web `NEXT_PUBLIC_PUSH_BROADCAST_ENDPOINT`)

---

### 7.3 Videos

#### User Stories

- As an admin, I want to browse all session videos with category filters.
- As an admin, I want to add/edit/delete YouTube session videos.
- As an admin, I want to mark videos as featured.

#### Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Videos List | `/(admin)/videos` | Filterable list with category chips |
| Video Detail | `/(admin)/videos/[id]` | YouTube embed + metadata |
| Video Form | `/(admin)/videos/form` | Create/edit drawer/modal |

#### Data Requirements

**Existing API (mobile-ready):**

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/session-videos` | Clerk |
| POST | `/api/session-videos` | Admin |
| GET | `/api/session-videos/[id]` | Clerk |
| PATCH | `/api/session-videos/[id]` | Admin |
| DELETE | `/api/session-videos/[id]` | Admin |
| POST | `/api/session-videos/[id]/view` | Clerk |

#### Categories (from `sessionVideoCategories.ts`)

`general_session`, `chit_chat`, `react_session`, `java_session`, `data_session`, `story_lab`

#### UI/UX Notes

- Category filter chips (horizontal scroll)
- YouTube thumbnail preview in list
- Featured badge on list items
- Delete confirmation

#### Offline/Cache

- Video list cached 15 min
- YouTube embed requires network

---

### 7.4 Meetings

#### User Stories

- As an admin, I want to create/edit/delete meetings with Google Meet links.
- As an admin, I want to mark student attendance by serial number.
- As an admin, I want to generate/upload meeting cover images and create feedback forms.

#### Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Meetings List | `/(admin)/meetings` | Paginated, sorted by date desc |
| Meeting Detail | `/(admin)/meetings/[id]` | Full detail + actions |
| Meeting Form | `/(admin)/meetings/form` | Create/edit |
| Attendance | `/(admin)/meetings/[id]/attendance` | Multi-select students by serial no |
| Cover Image | `/(admin)/meetings/[id]/cover` | Upload or AI generate |

#### Data Requirements

| Operation | Status | Endpoint |
|-----------|--------|----------|
| List/CRUD meetings | **Needs backend** | `GET/POST/PATCH/DELETE /api/mobile/v1/admin/meetings` |
| Attendance update | **Needs backend** | `PATCH /api/mobile/v1/admin/meetings/[id]/attendance` |
| Create Google Meet | Exists | `POST /api/meetings/create-google-meet` |
| Create feedback form | Exists | `POST /api/meetings/create-feedback-form` |
| Send feedback email | Exists | `POST /api/meetings/[id]/send-feedback-email` |
| Cover upload | Exists | `POST /api/meetings/[id]/cover-image/upload` (multipart) |
| Cover AI generate | Exists | `POST /api/meetings/[id]/cover-image/generate` |
| Cover confirm | Exists | `POST /api/meetings/[id]/cover-image/confirm` |
| Calendar create/cancel | Exists | `POST /api/calendar/create-meeting`, `POST /api/calendar/cancel-meeting` |

#### Meeting Schema (from `MeetingFormState`)

```typescript
interface Meeting {
  id: string
  title: string
  date: string           // ISO timestamptz (IST-normalized on write)
  googleGroupId: string
  description: string
  meetingLink: string
  coverImageUrl: string
  feedbackForm?: string
  feedbackEmailSentAt?: string | null
  attendance?: number[]  // student serial numbers
}
```

#### UI/UX Notes

- Date/time picker with IST display
- "Create Google Meet" action button in form
- Attendance screen: searchable student list with checkboxes
- Cover image: camera/gallery picker + "Generate with AI" button

---

### 7.5 Students List

#### User Stories

- As an admin, I want to search and filter students by cohort, company, role, and name.
- As an admin, I want to invite new students via Clerk invitation.
- As an admin, I want to tap a student to view their full profile.

#### Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Students List | `/(admin)/students` | Filterable, searchable list |
| Invite Student | `/(admin)/students/invite` | Email input → Clerk invitation |

#### Data Requirements

| Operation | Status | Endpoint |
|-----------|--------|----------|
| List + filter | **Needs backend** | `GET /api/mobile/v1/admin/students?cohort=&company=&role=&search=&page=&limit=` |
| Filter options | **Needs backend** | `GET /api/mobile/v1/admin/students/filter-options` |
| Invite | Exists (needs admin guard) | `POST /api/invitations/create` |

#### Filters (from `useStudentsWithFilters`)

- Cohort (by `cohort_id` or legacy `batch`)
- Company
- Role
- Name search (ilike)

#### UI/UX Notes

- Sticky search bar
- Filter bottom sheet
- Student card: avatar, name, role, company, batch
- FAB: "Invite Student"

#### Offline/Cache

- Cache last fetched page for offline browsing (read-only)

---

### 7.6 Student Profile View

#### User Stories

- As an admin, I want to view a student's complete profile including experience, skills, and social links.
- As an admin, I want to view guardian contact details (admin-only fields).
- As an admin, I want to edit a student's profile and upload resume/picture.

#### Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Profile View | `/(admin)/students/[id]` | Read-only profile sections |
| Profile Edit | `/(admin)/students/[id]/edit` | Full edit form |
| Guardian Details | `/(admin)/students/[id]/guardian` | Admin-only section |

#### Data Requirements

| Operation | Status | Endpoint |
|-----------|--------|----------|
| Get profile | **Needs backend** | `GET /api/mobile/v1/admin/students/[id]` |
| Update profile | **Needs backend** | `PATCH /api/mobile/v1/admin/students/[id]` |
| Guardian details | Exists | `GET /api/students/[id]/guardian-details` |
| Profile file upload | Exists | `POST /api/profile/upload` (Vercel Blob token) |
| Student awards | **Needs backend** | `GET /api/mobile/v1/admin/students/[id]/awards` |

#### Profile Fields (from `ProfileData`)

See Section 10 for full interface. Admin edit uses `profileEditFormSchema` validation.

#### UI/UX Notes

- Sectioned profile (About, Experience, Skills, Social, Resume)
- Resume: open in in-app browser or PDF viewer
- Edit: multi-step form or long scroll with sticky save
- Guardian details behind "Admin Only" badge

---

### 7.7 Profile Management

#### User Stories

- As an admin, I want to view and edit my own Clerk profile (name, email, avatar).
- If I also have a linked student record, I want to edit it.

#### Screens

| Screen | Route | Description |
|--------|-------|-------------|
| My Profile | `/(admin)/profile` | Clerk user info + optional student link |

#### Data Requirements

- Clerk `useUser()` for account fields
- Optional: `GET /api/mobile/v1/me` returns admin user + linked student row if email matches

---

### 7.8 Account Management

#### User Stories

- As an admin, I want to change my password, manage connected accounts, and sign out.

#### Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Account Settings | `/(admin)/account` | Clerk `<UserProfile />` or custom screens |

#### Implementation

Use Clerk Expo components or deep link to Clerk hosted account portal:
`https://accounts.mentorbridge.in/user` (Clerk configured domain)

Sign out: `signOut()` → clear SecureStore → Login screen

---

### 7.9 Roadmaps

#### User Stories

- As an admin, I want to browse learning roadmaps (React, TypeScript, Java, etc.).
- As an admin, I want to view roadmap node details and resources.

#### Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Roadmaps List | `/(admin)/roadmaps` | Static roadmap catalog |
| Roadmap Detail | `/(admin)/roadmaps/[slug]` | Interactive node graph/list |

#### Data Requirements

| Source | Status |
|--------|--------|
| Roadmap content | **Static** — bundle JSON from `src/data/roadmaps/` at build time OR `GET /api/mobile/v1/roadmaps/[slug]` (new, serves static files) |
| Progress (`roadmap_completions`) | **Needs backend** for admin viewing student progress: `GET /api/mobile/v1/admin/students/[id]/roadmap-progress` |

#### Available Roadmap Slugs

`react`, `typescript`, `javascript`, `java`, `spring-boot`, `storytelling`, `design-thinking`

#### UI/UX Notes

- Read-only for admin v1 (progress tracking is student-facing on web)
- Node list with completion indicators if viewing a student's progress

---

### 7.10 Blogs

#### User Stories

- As an admin, I want to browse synced Medium blogs from students.
- As an admin, I want to trigger blog sync for a student's Medium username.

#### Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Blogs List | `/(admin)/blogs` | Paginated blog cards |
| Sync Blog | `/(admin)/blogs/sync` | Username input |

#### Data Requirements

| Operation | Status | Endpoint |
|-----------|--------|----------|
| List blogs | **Needs backend** | `GET /api/mobile/v1/blogs?page=&author=` |
| Sync single | Exists | `POST /api/add-blog` body: `{ username }` |
| Batch sync | Exists | `GET /api/sync-blogs/[startingIndex]` |

#### Blog Schema

```typescript
interface Blog {
  id: string | null
  title: string | null
  author_name: string | null
  published_date: string | null
  cover_image_url: string | null
  link: string
  username: string | null
}
```

---

### 7.11 Gallery

#### User Stories

- As an admin, I want to browse event photos organized by Cloudinary folders.

#### Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Gallery | `/(admin)/gallery` | Folder tabs + image grid |
| Image Viewer | `/(admin)/gallery/[id]` | Full-screen pinch-to-zoom |

#### Data Requirements

| Operation | Status | Endpoint |
|-----------|--------|----------|
| List images | Exists (public) | `GET /api/cloudinary/images?folder=&max_results=&transformation=` |

#### Known Folders

Configure at build time or fetch folder list (needs new endpoint or hardcoded list from web).

#### UI/UX Notes

- Masonry or uniform grid
- Lazy loading with `expo-image`
- No upload in v1 (web is read-only)

---

### 7.12 Assignments

#### User Stories

- As an admin, I want to create/edit/delete assignments for a cohort.
- As an admin, I want to see submission stats and review individual submissions.
- As an admin, I want to rate submissions and leave feedback comments.

#### Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Assignments List | `/(admin)/assignments` | Cards with stats chips |
| Assignment Detail | `/(admin)/assignments/[id]` | Description, submissions table |
| Assignment Form | `/(admin)/assignments/form` | Create/edit |
| Submission Review | `/(admin)/assignments/[id]/submissions/[submissionId]` | Google Doc + GitHub preview, feedback form |

#### Data Requirements

**Existing API (mobile-ready with Bearer auth):**

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/assignments` | Admin gets all with stats |
| POST | `/api/assignments` | Create (admin) |
| GET | `/api/assignments/[id]` | Detail + stats |
| PATCH | `/api/assignments/[id]` | Update (admin) |
| DELETE | `/api/assignments/[id]` | Delete (admin) |
| GET | `/api/assignments/[id]/submissions/[submissionId]` | Submission detail |
| PATCH | `/api/assignments/[id]/submissions/[submissionId]/feedback` | Rate + comment |
| GET | `/api/github/repo`, `/readme`, `/tree`, `/file` | Repo preview |

#### Categories

`Frontend`, `Backend`, `Data`, `Misc`

#### UI/UX Notes

- Stats chips: submitted/pending counts, percentage
- Submission review: embedded Google Doc link + GitHub file tree (WebView or native markdown)
- Rating: 1–5 stars with one decimal
- Due date badges: upcoming / due soon / past due

---

## 8. Complete API Specification

### 8.1 Base URL Structure

| Environment | Base URL |
|-------------|----------|
| Production | `https://www.mentorbridge.in` |
| Staging | `https://staging.mentorbridge.in` (to be provisioned) |
| Development | `http://localhost:3000` |

### 8.2 API Versioning

```
https://www.mentorbridge.in/api/mobile/v1/...   ← New mobile BFF routes
https://www.mentorbridge.in/api/...             ← Existing routes (reuse where possible)
```

### 8.3 Standard Headers

**Request:**

```http
Authorization: Bearer <clerk_jwt>
Content-Type: application/json
Accept: application/json
X-Client-Platform: android
X-App-Version: 1.0.0
```

**Response:**

```http
Content-Type: application/json
X-Request-Id: <uuid>
```

### 8.4 Error Response Format

All errors follow this shape (align with existing routes):

```json
{
  "error": "Human-readable message",
  "code": "FORBIDDEN",
  "details": {}
}
```

| HTTP Status | Code | When |
|-------------|------|------|
| 400 | `VALIDATION_ERROR` | Zod validation failure |
| 401 | `UNAUTHORIZED` | Missing/invalid Clerk JWT |
| 403 | `FORBIDDEN` | Not admin, or student profile required |
| 404 | `NOT_FOUND` | Resource missing |
| 409 | `CONFLICT` | Duplicate invitation, etc. |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Supabase/Clerk down |

### 8.5 Pagination Pattern

Query params: `page` (1-based), `limit` (default 20, max 100)

Response envelope:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 8.6 Sorting & Filtering

```
?sort=date&order=desc
?search=john
?cohort=<uuid>
?category=react_session
?from=2026-01-01&to=2026-12-31
```

### 8.7 Rate Limiting

| Tier | Limit | Scope |
|------|-------|-------|
| Authenticated admin | 300 req/min | Per user |
| Auth endpoints | 20 req/min | Per IP |
| File upload | 10 req/min | Per user |
| AI generate (covers) | 5 req/min | Per user |

Implement via Vercel Edge middleware or Upstash Redis rate limiter.

---

### 8.8 Auth Endpoints

#### GET `/api/mobile/v1/me`

**Status:** Needs backend implementation  
**Auth:** Bearer JWT  
**Purpose:** Return current user context for mobile bootstrap

**Response 200:**

```json
{
  "user": {
    "id": "user_xxx",
    "email": "admin@mentorbridge.in",
    "firstName": "Admin",
    "lastName": "User",
    "imageUrl": "https://...",
    "isAdmin": true,
    "role": "admin"
  },
  "linkedStudent": null
}
```

---

### 8.9 Existing Endpoints (Reuse for Mobile)

Mobile must send `Authorization: Bearer <token>` instead of cookies. Existing routes using `requireAuth()` from `@clerk/nextjs/server` need verification that Bearer tokens work (Clerk supports this via `authenticateRequest`).

#### Assignments

| Method | Path | Body / Response |
|--------|------|-----------------|
| GET | `/api/assignments` | `{ assignments: AssignmentListItem[], isAdmin: boolean }` |
| POST | `/api/assignments` | Body: `AssignmentFormValues` → `{ assignment: AssignmentListItem }` |
| GET | `/api/assignments/[id]` | `{ assignment, stats, submission? }` |
| PATCH | `/api/assignments/[id]` | Body: partial `AssignmentFormValues` |
| DELETE | `/api/assignments/[id]` | `{ success: true }` |
| GET | `/api/assignments/[id]/submissions/[submissionId]` | `{ submission: AssignmentSubmission }` |
| PATCH | `/api/assignments/[id]/submissions/[submissionId]/feedback` | Body: `{ rating, reviewedBy, feedbackComment? }` |

#### Session Videos

| Method | Path | Body / Response |
|--------|------|-----------------|
| GET | `/api/session-videos` | `{ videos: SessionVideo[], isAdmin: boolean }` |
| POST | `/api/session-videos` | Body: `{ title, youtubeUrl, category, isFeatured }` → `{ video }` |
| GET | `/api/session-videos/[id]` | `{ video }` |
| PATCH | `/api/session-videos/[id]` | Body: partial form → `{ video }` |
| DELETE | `/api/session-videos/[id]` | `{ success: true }` |
| POST | `/api/session-videos/[id]/view` | `{ viewCount }` |

#### Cohorts

| Method | Path | Response |
|--------|------|----------|
| GET | `/api/cohorts` | `{ cohorts: Cohort[] }` (auth required) |
| GET | `/api/public/cohorts` | `{ cohorts: Cohort[] }` (public) |

#### Students

| Method | Path | Response |
|--------|------|----------|
| GET | `/api/students/[id]/guardian-details` | `{ fatherGuardianDetails, motherDetails }` (admin only) |

#### Profile Upload

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/profile/upload` | Vercel Blob client upload handler; paths: `profiles/{studentId}.pdf\|jpg\|png` |

#### Invitations

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/invitations/create` | `{ emailAddress }` | `{ invitation }` — **add admin guard** |

#### Blogs

| Method | Path | Body / Notes |
|--------|------|--------------|
| POST | `/api/add-blog` | `{ username: string }` |
| GET | `/api/sync-blogs/[startingIndex]` | Batch sync |

#### Gallery

| Method | Path | Query |
|--------|------|-------|
| GET | `/api/cloudinary/images` | `folder`, `max_results`, `transformation` |

#### Meetings (Integrations)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/meetings/create-google-meet` | Create Calendar event + Meet link |
| POST | `/api/meetings/create-feedback-form` | Create Google Form |
| POST | `/api/meetings/[id]/send-feedback-email` | Email feedback form |
| POST | `/api/meetings/[id]/cover-image/upload` | Multipart cover upload |
| POST | `/api/meetings/[id]/cover-image/generate` | AI cover generation |
| POST | `/api/meetings/[id]/cover-image/confirm` | Confirm generated cover |
| POST | `/api/calendar/create-meeting` | Calendar create |
| POST | `/api/calendar/cancel-meeting` | Calendar cancel |
| POST | `/api/calendar/delete-by-meet-link` | Delete by Meet link |

#### GitHub (Assignment Previews)

| Method | Path | Query |
|--------|------|-------|
| GET | `/api/github/repo` | `owner`, `repo` |
| GET | `/api/github/readme` | `owner`, `repo` |
| GET | `/api/github/tree` | `owner`, `repo`, `branch?` |
| GET | `/api/github/file` | `owner`, `repo`, `path` |

#### Admin (Existing)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/admin/visitor-chat-queries` | **Add requireAdmin()** |

---

### 8.10 New Mobile BFF Endpoints (Needs Backend Implementation)

#### Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/mobile/v1/admin/dashboard` | Aggregated admin dashboard data |

**Response schema:**

```json
{
  "stats": {
    "totalStudents": 120,
    "meetingsToday": 2,
    "pendingSubmissions": 15,
    "openAssignments": 8
  },
  "todayMeetings": [ "Meeting" ],
  "recentAnnouncements": [ "Announcement" ],
  "assignmentsNeedingReview": [ "AssignmentListItem" ]
}
```

#### Students

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/mobile/v1/admin/students` | List with filters + pagination |
| GET | `/api/mobile/v1/admin/students/filter-options` | Cohorts, companies, roles |
| GET | `/api/mobile/v1/admin/students/[id]` | Full profile |
| POST | `/api/mobile/v1/admin/students` | Create student profile |
| PATCH | `/api/mobile/v1/admin/students/[id]` | Update profile |
| DELETE | `/api/mobile/v1/admin/students/[id]` | Delete student (if supported on web) |
| GET | `/api/mobile/v1/admin/students/[id]/awards` | Student awards |
| GET | `/api/mobile/v1/admin/students/[id]/roadmap-progress` | All roadmap completions |

**GET `/api/mobile/v1/admin/students` query params:**

```
?page=1&limit=20&search=&cohort=&company=&role=&sort=name&order=asc
```

**Response:**

```json
{
  "data": [ "ProfileData" ],
  "pagination": { "page": 1, "limit": 20, "totalCount": 120, "totalPages": 6, "hasNextPage": true, "hasPreviousPage": false }
}
```

#### Meetings

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/mobile/v1/admin/meetings` | Paginated list |
| GET | `/api/mobile/v1/admin/meetings/[id]` | Detail |
| POST | `/api/mobile/v1/admin/meetings` | Create |
| PATCH | `/api/mobile/v1/admin/meetings/[id]` | Update |
| DELETE | `/api/mobile/v1/admin/meetings/[id]` | Delete |
| PATCH | `/api/mobile/v1/admin/meetings/[id]/attendance` | Body: `{ attendance: number[] }` |
| GET | `/api/mobile/v1/admin/meetings/[id]/attendance/students` | Students for attendance picker |

#### Announcements

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/mobile/v1/admin/announcements` | List |
| POST | `/api/mobile/v1/admin/announcements` | Create (+ optional push broadcast) |
| PATCH | `/api/mobile/v1/admin/announcements/[id]` | Update |
| DELETE | `/api/mobile/v1/admin/announcements/[id]` | Delete |

**Announcement schema:**

```typescript
interface Announcement {
  id: string
  title: string
  description: string
  created_at: string
}
```

#### Reference Data (Admin CRUD)

| Resource | Base Path |
|----------|-----------|
| Google Groups | `/api/mobile/v1/admin/google-groups` |
| Partners | `/api/mobile/v1/admin/partners` |
| Presenters | `/api/mobile/v1/admin/presenters` |
| Hall of Fame | `/api/mobile/v1/admin/hall-of-fame` |
| Award Categories | `/api/mobile/v1/admin/award-categories` |
| Awards | `/api/mobile/v1/admin/awards` |

Each supports standard CRUD: `GET` (list), `GET /[id]`, `POST`, `PATCH /[id]`, `DELETE /[id]`.

#### Blogs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/mobile/v1/blogs` | Paginated list with `?page=&author=` |

#### Roadmaps

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/mobile/v1/roadmaps` | List available slugs + metadata |
| GET | `/api/mobile/v1/roadmaps/[slug]` | Full roadmap JSON |

#### Push (Mobile)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/mobile/v1/push/register` | Register FCM/APNs token |
| DELETE | `/api/mobile/v1/push/register` | Unregister token |

**Body:**

```json
{
  "token": "fcm_or_apns_token",
  "platform": "android",
  "deviceId": "unique_device_id"
}
```

---

## 9. Web App Backend Changes Required

### 9.1 Priority 0 — Blockers (Before Mobile Phase 1)

| Change | File/Area | Description |
|--------|-----------|-------------|
| **Bearer token auth** | `src/lib/auth/requireAuth.ts` | Update `getCurrentUser()` to accept `Authorization: Bearer` via `@clerk/backend` `authenticateRequest()` |
| **Mobile BFF router** | `src/app/api/mobile/v1/` | New route group with shared middleware |
| **CORS for mobile** | `next.config.ts` or middleware | Mobile apps don't need CORS for native fetch, but enable for Expo web preview |
| **Admin guard on invitations** | `src/app/api/invitations/create/route.ts` | Add `requireAdmin()` |
| **Admin guard on visitor queries** | `src/app/api/admin/visitor-chat-queries/route.ts` | Add `requireAdmin()` |

### 9.2 Priority 1 — Core Mobile APIs

Create service layer files mirroring existing hooks:

| New Service | Based On |
|-------------|----------|
| `src/lib/mobile/studentService.ts` | `useStudentsWithFilters`, `useUpdateStudent`, `mapSupabaseStudentRowToProfile` |
| `src/lib/mobile/meetingService.ts` | `useMeetings` |
| `src/lib/mobile/announcementService.ts` | `useAnnouncements` |
| `src/lib/mobile/dashboardService.ts` | `MemberDashboardPage` aggregation |
| `src/lib/mobile/adminCrudService.ts` | Partners, Presenters, Awards, etc. |

All services use `supabaseAdmin` (service role) — never expose service role to mobile.

### 9.3 JWT/Session Strategy for Mobile

```
Mobile App                    Next.js API                     Clerk
    │                              │                            │
    │── Sign In ──────────────────────────────────────────────►│
    │◄── Session JWT ──────────────────────────────────────────│
    │                              │                            │
    │── API Request + Bearer JWT ─►│                            │
    │                              │── verifyToken(jwt) ───────►│
    │                              │◄── userId, metadata ───────│
    │                              │── requireAdmin()           │
    │                              │── supabaseAdmin query      │
    │◄── JSON Response ────────────│                            │
```

**Do not** issue custom JWTs. Use Clerk session tokens directly.

### 9.4 Middleware Changes

Update `src/middleware.ts`:

```typescript
// Exclude /api/mobile from Clerk cookie-based redirects
// API routes handle their own Bearer auth
matcher: [
  "/((?!_next|api/webhooks|api/mobile|static|.*\\..*).*)",
]
```

Create shared API middleware helper:

```typescript
// src/lib/auth/authenticateMobileRequest.ts
export async function authenticateMobileRequest(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  // Verify with @clerk/backend
  // Return ClerkUser
}
```

### 9.5 File Upload Endpoints

Existing upload routes work for mobile with Bearer auth:

| Endpoint | Mobile Usage |
|----------|--------------|
| `POST /api/profile/upload` | Profile picture/resume — use `@vercel/blob` client SDK in RN or proxy multipart through BFF |
| `POST /api/meetings/[id]/cover-image/upload` | Multipart FormData from `expo-image-picker` |

**Recommended:** Add `POST /api/mobile/v1/upload/profile` that accepts multipart and uploads to Vercel Blob server-side (simpler than client-side Blob token in RN).

### 9.6 Database Changes

#### New table: `mobile_push_subscriptions`

```sql
create table public.mobile_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,          -- Clerk user ID
  device_id text not null,
  platform text not null check (platform in ('android', 'ios')),
  push_token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, device_id)
);
```

#### RLS

Mobile BFF uses `supabaseAdmin` (service role) — no new RLS policies needed for mobile routes. Do **not** expose Supabase anon key in mobile app.

### 9.7 Security Hardening (Web)

| Issue | Fix |
|-------|-----|
| `NEXT_PUBLIC_GITHUB_TOKEN` exposed to client | Move all GitHub calls server-side (already done for API routes; remove client env) |
| `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` fallback | Remove; server-only `SUPABASE_SERVICE_ROLE_KEY` |
| Direct Supabase admin writes from browser | Long-term: migrate web admin to same BFF APIs |

---

## 10. Data Models & TypeScript Interfaces

### 10.1 Shared Types Strategy

**Phase 1:** Copy types from web `src/types/` into mobile `src/types/`  
**Phase 2:** Extract to `packages/shared-types` in monorepo  
**Phase 3:** Generate OpenAPI types from BFF spec

### 10.2 Core Interfaces (from web codebase)

#### ProfileData (`src/types/student.types.ts`)

```typescript
interface Experience {
  company: string
  role: string
  summary: string
  website?: string
}

interface MentorBridgeExp {
  company: string
  role: string
  summary: string
  website?: string
}

interface ISocialLinks {
  linkedIn: string
  gitHub: string
  website?: string
}

interface ProfileData {
  id: string
  name: string
  picture: string
  role: string
  company?: string
  summary?: string
  email: string
  mediumUsername?: string
  experience?: Experience[]
  mentorBridgeExp?: MentorBridgeExp
  skillSets?: string[]
  inspirations?: string[]
  socialLinks?: ISocialLinks
  resumeLink?: string
  batch: string
  cohortId?: string
  fatherGuardianDetails?: string  // admin-only
  motherDetails?: string          // admin-only
  gender?: string
  selfIntro?: string
  serialNo?: number
}
```

#### SessionVideo (`src/types/sessionVideo.types.ts`)

```typescript
type SessionVideoCategory =
  | 'general_session' | 'chit_chat' | 'react_session'
  | 'java_session' | 'data_session' | 'story_lab'

interface SessionVideo {
  id: string
  title: string
  youtubeUrl: string
  youtubeVideoId: string
  category: SessionVideoCategory
  isFeatured: boolean
  viewCount: number
  createdBy: string
  createdAt: string
  updatedAt: string
}
```

#### Assignment (`src/types/assignment.types.ts`)

```typescript
type AssignmentCategory = 'Frontend' | 'Backend' | 'Data' | 'Misc'
type AssignmentDueStatus = 'upcoming' | 'due_soon' | 'past_due'
type StudentSubmissionStatus = 'not_submitted' | 'submitted'

interface Cohort {
  id: string
  name: string
}

interface Assignment {
  id: string
  title: string
  description: string
  cohortId: string
  cohortName?: string
  category: AssignmentCategory
  googleGroupId: string
  attachments: string | null
  dueDate: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  studentName?: string
  studentEmail?: string
  googleDocUrl: string
  githubRepoUrl: string
  submittedAt: string
  updatedAt: string
  rating: number | null
  feedbackComment: string | null
  reviewedBy: string | null
  reviewedAt: string | null
}

interface AssignmentStats {
  totalStudents: number
  submittedCount: number
  pendingCount: number
  submissionPercentage: number
}

interface AssignmentListItem extends Assignment {
  stats: AssignmentStats
  mySubmissionStatus?: StudentSubmissionStatus
  dueStatus: AssignmentDueStatus
}
```

#### Meeting (`src/app/modules/Meetings/Meeting.types.ts`)

```typescript
interface Meeting {
  id?: string
  title: string
  date: string
  googleGroupId: string
  description: string
  meetingLink: string
  coverImageUrl: string
  feedbackForm?: string
  feedbackEmailSentAt?: string | null
  attendance?: number[]
}
```

#### Blog (`src/types/blog.types.ts`)

```typescript
interface Blog {
  id: string | null
  title: string | null
  author_name: string | null
  published_date: string | null
  cover_image_url: string | null
  link: string
  username: string | null
}
```

#### Gallery (`src/types/gallery.types.ts`)

```typescript
interface CloudinaryImage {
  id: string
  src: string
  title: string
  alt: string
  public_id: string
  width: number
  height: number
  folder: string
}
```

#### Roadmap (`src/data/roadmaps/types.ts`)

```typescript
interface RoadmapData {
  title: string
  description: string
  nodes: RoadmapNodeMeta[]
}

interface RoadmapNodeMeta {
  id: string
  title: string
  description: string
  isCompleted?: boolean
  resources: {
    title: string
    url: string
    type?: 'video' | 'article' | 'book' | 'course' | 'code' | 'documentation' | 'other'
  }[]
}
```

#### Announcement (`src/app/modules/Announcements/Announcement.types.ts`)

```typescript
interface Announcement {
  id: string
  title: string
  description: string
  created_at: string
}
```

### 10.3 Supabase Column Mapping

| TS (camelCase) | DB (snake_case) |
|----------------|-----------------|
| `cohortId` | `cohort_id` |
| `skillSets` | `skill_sets` |
| `mentorBridgeExp` | `mentor_bridge_exp` |
| `socialLinks` | `social_links` |
| `resumeLink` | `resume_link` |
| `selfIntro` | `self_intro` |
| `serialNo` | `serial_no` |
| `mediumUsername` | `medium_username` |
| `fatherGuardianDetails` | `father_guardian_details` |
| `motherDetails` | `mother_details` |
| `googleGroupId` | `google_group_id` |
| `meetingLink` | `meeting_link` |
| `coverImageUrl` | `cover_image_url` |
| `feedbackForm` | `feedback_form` |
| `feedbackEmailSentAt` | `feedback_email_sent_at` |
| `viewCount` | `view_count` |
| `isFeatured` | `is_featured` |
| `youtubeUrl` | `youtube_url` |
| `youtubeVideoId` | `youtube_video_id` |
| `createdBy` | `created_by` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |
| `dueDate` | `due_date` |
| `googleGroupId` | `google_group_id` |
| `googleDocUrl` | `google_doc_url` |
| `githubRepoUrl` | `github_repo_url` |
| `submittedAt` | `submitted_at` |
| `feedbackComment` | `feedback_comment` |
| `reviewedBy` | `reviewed_by` |
| `reviewedAt` | `reviewed_at` |

Use `mapSupabaseStudentRowToProfile()` pattern for all mobile BFF responses.

---

## 11. Navigation Architecture

### 11.1 Structure (Expo Router)

```
app/
├── _layout.tsx                 # ClerkProvider, QueryClient, theme
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── access-denied.tsx
└── (admin)/
    ├── _layout.tsx             # Drawer + auth guard
    ├── dashboard.tsx           # Home tab
    ├── students/
    │   ├── index.tsx
    │   ├── invite.tsx
    │   └── [id]/
    │       ├── index.tsx
    │       ├── edit.tsx
    │       └── guardian.tsx
    ├── meetings/
    │   ├── index.tsx
    │   ├── form.tsx
    │   └── [id]/
    │       ├── index.tsx
    │       ├── attendance.tsx
    │       └── cover.tsx
    ├── videos/
    │   ├── index.tsx
    │   ├── form.tsx
    │   └── [id].tsx
    ├── assignments/
    │   ├── index.tsx
    │   ├── form.tsx
    │   └── [id]/
    │       ├── index.tsx
    │       └── submissions/[submissionId].tsx
    ├── administration/
    │   ├── index.tsx
    │   ├── announcements.tsx
    │   ├── google-groups.tsx
    │   ├── hall-of-fame.tsx
    │   ├── partners.tsx
    │   ├── presenters.tsx
    │   ├── award-categories.tsx
    │   ├── awards.tsx
    │   └── visitor-queries.tsx
    ├── roadmaps/
    │   ├── index.tsx
    │   └── [slug].tsx
    ├── blogs/
    │   ├── index.tsx
    │   └── sync.tsx
    ├── gallery/
    │   ├── index.tsx
    │   └── [id].tsx
    ├── profile.tsx
    └── account.tsx
```

### 11.2 Bottom Tab Bar (Primary)

| Tab | Icon | Screen |
|-----|------|--------|
| Home | Home | Dashboard |
| Students | Users | Students List |
| Meetings | Calendar | Meetings List |
| More | Menu | Drawer with remaining modules |

### 11.3 Drawer (Secondary)

- Videos
- Assignments
- Administration
- Roadmaps
- Blogs
- Gallery
- Profile
- Account
- Sign Out

### 11.4 Stack Navigation

Each tab owns a stack for detail → edit → sub-screens. Use `router.push()` with typed params.

---

## 12. State Management Architecture

### 12.1 Layer Diagram

```
┌─────────────────────────────────────────────┐
│  Screens (Expo Router)                       │
├─────────────────────────────────────────────┤
│  Custom Hooks (useStudents, useMeetings)     │
├─────────────────────────────────────────────┤
│  TanStack Query (cache, mutations, prefetch) │
├─────────────────────────────────────────────┤
│  API Client (Axios + Clerk token interceptor)│
├─────────────────────────────────────────────┤
│  Zustand (auth UI state, filter persistence) │
├─────────────────────────────────────────────┤
│  SecureStore (Clerk session)                 │
└─────────────────────────────────────────────┘
```

### 12.2 Query Key Conventions

```typescript
['dashboard']
['students', { page, filters }]
['students', studentId]
['meetings', { page }]
['meetings', meetingId]
['videos']
['videos', videoId]
['assignments']
['assignments', assignmentId]
['assignments', assignmentId, 'submissions', submissionId]
['announcements']
['blogs', { page, author }]
['gallery', folder]
['roadmaps', slug]
['cohorts']
```

### 12.3 Mutation Patterns

- Optimistic updates for attendance toggle, announcement create
- Invalidate related queries on success
- Toast on error with retry action

### 12.4 Filter Persistence

Store student list filters in Zustand + AsyncStorage so returning to the screen preserves state.

---

## 13. Push Notifications

### 13.1 Use Cases

| Event | Recipient | Trigger |
|-------|-----------|---------|
| New announcement | All admins | Admin creates announcement |
| Assignment submission | Admins | Student submits (future) |
| Meeting reminder | Admins | 1 hour before meeting |
| Feedback email sent | Admin who triggered | Confirmation |

### 13.2 Architecture

```
Mobile App → POST /api/mobile/v1/push/register → mobile_push_subscriptions (Supabase)
Admin creates announcement → BFF → FCM/APNs via Expo Push API or Firebase Admin SDK
```

### 13.3 Migration from Web Push

Web uses VAPID + `NEXT_PUBLIC_PUSH_BROADCAST_ENDPOINT` (external). Mobile uses native FCM/APNs — separate subscription table and delivery pipeline.

### 13.4 Implementation

- `expo-notifications` for token registration
- Server: `@expo/server-sdk` or Firebase Admin SDK
- Store tokens in `mobile_push_subscriptions`
- Admin-only push for v1

---

## 14. Deep Linking

### 14.1 URL Scheme

```
mentorbridge-admin://          # Custom scheme
https://www.mentorbridge.in/app/  # Universal Links (iOS) / App Links (Android)
```

### 14.2 Route Mapping

| Web URL | Mobile Route |
|---------|--------------|
| `https://www.mentorbridge.in/students/[id]` | `/(admin)/students/[id]` |
| `https://www.mentorbridge.in/events` | `/(admin)/meetings` |
| `https://www.mentorbridge.in/secured/assignments/[id]` | `/(admin)/assignments/[id]` |
| `https://www.mentorbridge.in/secured/videos/[id]` | `/(admin)/videos/[id]` |
| `https://www.mentorbridge.in/roadmaps/[slug]` | `/(admin)/roadmaps/[slug]` |
| `https://www.mentorbridge.in/blogs` | `/(admin)/blogs` |
| `https://www.mentorbridge.in/gallery` | `/(admin)/gallery` |

### 14.3 Expo Router Config

```json
{
  "expo": {
    "scheme": "mentorbridge-admin",
    "ios": {
      "associatedDomains": ["applinks:www.mentorbridge.in"]
    },
    "android": {
      "intentFilters": [{
        "action": "VIEW",
        "autoVerify": true,
        "data": [{ "scheme": "https", "host": "www.mentorbridge.in", "pathPrefix": "/app" }]
      }]
    }
  }
}
```

### 14.4 Web Fallback

Host `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json` on `www.mentorbridge.in` (Next.js public routes).

---

## 15. Project Structure

```
mentorbridge-mobile/
├── app/                          # Expo Router screens
├── src/
│   ├── api/
│   │   ├── client.ts             # Axios instance + interceptors
│   │   ├── endpoints/            # Per-module API functions
│   │   └── types/                # API response types
│   ├── components/
│   │   ├── ui/                   # Buttons, inputs, cards
│   │   ├── students/
│   │   ├── meetings/
│   │   ├── videos/
│   │   └── assignments/
│   ├── hooks/                    # TanStack Query hooks
│   ├── stores/                   # Zustand stores
│   ├── utils/                    # Date formatting, validation
│   ├── constants/                # API URLs, categories
│   └── theme/                    # Colors, typography
├── assets/
│   ├── images/
│   └── fonts/
├── maestro/                      # E2E test flows
├── .env.development
├── .env.production
├── app.json
├── android/                      # Generated by `expo prebuild` (commit or regenerate in CI)
├── ios/                          # Generated by `expo prebuild` (iOS Phase 2)
├── package.json
└── tsconfig.json
```

---

## 16. Environment Configuration

### 16.1 Mobile Environment Variables

| Variable | Dev | Prod | Notes |
|----------|-----|------|-------|
| `EXPO_PUBLIC_API_BASE_URL` | `http://localhost:3000` | `https://www.mentorbridge.in` | API base |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` | `pk_live_...` | Clerk |
| `EXPO_PUBLIC_POSTHOG_KEY` | test key | prod key | Analytics |
| `EXPO_PUBLIC_POSTHOG_HOST` | `https://eu.posthog.com` | same | Analytics |
| `EXPO_PUBLIC_SENTRY_DSN` | dev DSN | prod DSN | Crash reporting |
| `EXPO_PUBLIC_APP_ENV` | `development` | `production` | Feature flags |

### 16.2 Web Environment (Existing — relevant to mobile)

| Variable | Usage |
|----------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://mentorbridge.in` — redirect URLs |
| `NEXT_PUBLIC_SITE_URL` | `https://www.mentorbridge.in` — canonical |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only BFF queries |
| Clerk secret keys | Server-only JWT verification |

### 16.3 Local Release Build Commands

No `eas.json` required. Generate native projects once, then build locally or in GitHub Actions:

```bash
# One-time (or after native dependency changes)
npx expo prebuild --platform android   # creates ./android
npx expo prebuild --platform ios         # Phase 2 — creates ./ios

# Android release AAB (upload to Play Console manually)
cd android && ./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab

# Or run release on connected device/emulator
npx expo run:android --variant release

# iOS — solo personal device (Phase 2)
npx expo run:ios --device
```

Version codes and `versionName` are managed in `app.json` (`expo.version`, `expo.android.versionCode`, `expo.ios.buildNumber`).

---

## 17. Testing Strategy

### 17.1 Unit Tests (Vitest)

| Area | Coverage Target |
|------|-----------------|
| API client interceptors | 100% |
| Zod schema validation (shared) | 100% |
| Utility functions (date, mapping) | 90% |
| Custom hooks (with MSW mock) | 80% |

### 17.2 Component Tests (Testing Library)

- Form components: assignment form, student edit, meeting form
- List components: empty state, loading, error state
- Navigation guards: admin vs access denied

### 17.3 Integration Tests

- API client against mock server (MSW)
- TanStack Query hook integration with mocked responses

### 17.4 E2E Tests (Maestro — Android First)

```yaml
# maestro/flows/login.yaml
appId: in.mentorbridge.admin
---
- launchApp
- assertVisible: "Sign In"
- tapOn: "Email"
- inputText: "admin@test.mentorbridge.in"
- tapOn: "Password"
- inputText: "${ADMIN_PASSWORD}"
- tapOn: "Continue"
- assertVisible: "Dashboard"
```

**Critical flows:**

1. Login → Dashboard
2. Students list → Profile view
3. Create meeting
4. Create assignment → Review submission
5. Add session video
6. Create announcement
7. Sign out

### 17.5 Manual QA Checklist

- Physical Android devices (Pixel, Samsung)
- Offline mode (airplane mode → cached lists)
- Push notification delivery
- Deep link from email/web
- Large student list performance (100+ items)

---

## 18. CI/CD Pipeline

**Primary path: local builds (zero EAS cost).** Optional GitHub Actions on the free tier for automated Android AAB artifacts. Manual Play Console upload for all Android releases.

### 18.1 Local Build Workflow (Primary)

| Platform | Command | Output |
|----------|---------|--------|
| Android AAB | `npx expo prebuild --platform android && cd android && ./gradlew bundleRelease` | `app-release.aab` → upload in Play Console |
| Android APK (internal sideload) | `npx expo run:android --variant release` | Install on test devices |
| iOS (solo user) | `npx expo prebuild --platform ios && npx expo run:ios --device` | Install on personal iPhone via Xcode |
| iOS TestFlight (optional) | Archive in Xcode → Upload to App Store Connect | Requires Apple Developer ($99/yr); no public listing needed |

### 18.2 GitHub Actions Workflow (Optional — Free Tier)

```yaml
# .github/workflows/mobile.yml
on:
  push:
    branches: [main, develop]
    paths: ['apps/mobile/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci && npm run test --workspace=apps/mobile

  build-android-aab:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - uses: actions/setup-java@v4
        with: { distribution: 'temurin', java-version: '17' }
      - run: npm ci
      - run: npx expo prebuild --platform android --non-interactive
        working-directory: apps/mobile
      - run: ./gradlew bundleRelease
        working-directory: apps/mobile/android
      - uses: actions/upload-artifact@v4
        with:
          name: app-release-aab
          path: apps/mobile/android/app/build/outputs/bundle/release/app-release.aab
```

iOS CI builds are **not required** (solo personal device). Build iOS locally with Xcode when needed.

### 18.3 Release Process

| Stage | Action |
|-------|--------|
| PR | Unit tests + lint |
| Merge to `develop` | Optional: GitHub Actions AAB artifact → Play Internal Testing upload |
| Merge to `main` | Build AAB (local or CI) → manual Play Console upload → promote through tracks |
| iOS (Phase 2) | `expo run:ios --device` for weekly sideload, or TestFlight for solo admin |
| Production | **Play Store only** (Android). No public App Store release. |

### 18.4 App Updates

- Ship fixes via new **Play Store release** (upload updated AAB)
- No EAS Update (paid tier avoided); JS-only changes still require a new store build unless a self-hosted update server is added later
- Native dependency changes always require `expo prebuild` + full rebuild

### 18.5 Fastlane (Optional)

Use Fastlane locally for Play metadata, screenshots, or iOS TestFlight upload automation — not required for v1.

---

## 19. Performance & Accessibility

### 19.1 Performance Targets

| Metric | Target |
|--------|--------|
| App cold start | < 3s on mid-range Android |
| Dashboard load | < 2s on 4G |
| List scroll | 60fps with 100 items |
| Image load | Progressive with blur placeholder |
| APK size | < 40MB (AAB optimized) |

### 19.2 Optimization Strategies

- FlashList for long lists (students, meetings)
- TanStack Query staleTime tuning per module
- Image caching via `expo-image`
- Lazy load admin sub-modules
- Prefetch student detail on list item press (onPressIn)

### 19.3 Accessibility

- Minimum touch target: 44×44 dp
- Screen reader labels on all interactive elements
- Color contrast WCAG AA
- Support system font scaling
- Reduce motion preference respected

---

## 20. Security Checklist

### 20.1 Pre-Launch Checklist

- [ ] Clerk production keys (`pk_live_`, `sk_live_`) in prod builds only
- [ ] No Supabase service role key in mobile bundle
- [ ] No `NEXT_PUBLIC_GITHUB_TOKEN` equivalent in mobile
- [ ] All admin routes verify `requireAdmin()` server-side
- [ ] Bearer token validation on every API request
- [ ] Certificate pinning considered for v2 (optional)
- [ ] SecureStore for all tokens
- [ ] ProGuard/R8 enabled for Android release builds
- [ ] iOS Keychain for SecureStore backend
- [ ] Rate limiting on auth and upload endpoints
- [ ] Input validation via Zod on all write endpoints
- [ ] Admin invitation endpoint protected
- [ ] Guardian details never returned to non-admin
- [ ] Sentry configured to scrub PII from breadcrumbs
- [ ] Penetration test before Play Store public release

### 20.2 OWASP Mobile Top 10 Mitigations

| Risk | Mitigation |
|------|------------|
| Improper credential usage | SecureStore + Clerk SDK |
| Insecure communication | HTTPS only, TLS 1.2+ |
| Insecure authentication | Clerk + server-side admin check |
| Insufficient cryptography | Expo SecureStore (platform keychain) |
| Insecure authorization | BFF with requireAdmin on every write |
| Client code quality | TypeScript strict, ESLint, tests |
| Code tampering | Play App Signing, iOS App Attest (v2) |
| Reverse engineering | ProGuard; no secrets in bundle |
| Extraneous functionality | Remove dev menus in production |
| Improper session handling | Clerk session expiry + refresh |

---

## 21. Implementation Phases / Roadmap

### Phase 0: Backend Foundation (2–3 weeks)

**Web team deliverables:**

- [ ] Bearer token auth support in `requireAuth()`
- [ ] `/api/mobile/v1/me` endpoint
- [ ] `/api/mobile/v1/admin/students` CRUD
- [ ] `/api/mobile/v1/admin/meetings` CRUD + attendance
- [ ] `/api/mobile/v1/admin/announcements` CRUD
- [ ] `/api/mobile/v1/admin/dashboard` aggregation
- [ ] Admin guards on invitations + visitor queries
- [ ] `mobile_push_subscriptions` migration
- [ ] `.well-known` files for deep linking

**Mobile team deliverables:**

- [ ] Expo project scaffold
- [ ] Clerk auth flow
- [ ] API client with Bearer interceptor
- [ ] Login + Access Denied screens

### Phase 1: MVP — Android Internal Beta (4–5 weeks)

**Features:**

- [x] Auth (login, admin gate, sign out)
- [x] Dashboard (basic KPIs)
- [x] Students List + Profile View + Edit
- [x] Meetings List + CRUD + Attendance
- [x] Assignments List + Detail + Submission Review
- [x] Videos List + CRUD
- [x] Announcements CRUD

**Exit criteria:** Internal Play Store build; 3 admins daily-dogfood for 1 week

### Phase 2: Feature Parity — Android Open Beta (3–4 weeks)

**Features:**

- [ ] Administration hub (Google Groups, Partners, Presenters, Awards, Hall of Fame)
- [ ] Blogs list + sync
- [ ] Gallery browse
- [ ] Roadmaps browse
- [ ] Profile + Account management
- [ ] Push notifications
- [ ] Deep linking
- [ ] Biometric unlock

**Exit criteria:** Open beta on Play Store; crash-free rate > 99%

### Phase 3: iOS + Production (3–4 weeks)

**Features:**

- [ ] iOS TestFlight build
- [ ] iOS-specific UI polish (safe areas, haptics)
- [ ] App Store + Play Store production release
- [ ] PostHog + Sentry production dashboards
- [ ] Tablet layout (optional)

**Exit criteria:** Both stores live; admin documentation published

### Phase 4: Enhancements (Ongoing)

- Offline write queue for meetings/announcements
- Admin analytics dashboard
- Bulk student operations
- Meeting cover AI generate from mobile
- Shared types monorepo package

---

## 22. Appendix

### 22.1 Screen Inventory

| # | Screen | Module | Phase |
|---|--------|--------|-------|
| 1 | Login | Auth | 0 |
| 2 | Access Denied | Auth | 0 |
| 3 | Dashboard | Dashboard | 1 |
| 4 | Students List | Students | 1 |
| 5 | Invite Student | Students | 1 |
| 6 | Student Profile | Students | 1 |
| 7 | Student Edit | Students | 1 |
| 8 | Guardian Details | Students | 1 |
| 9 | Meetings List | Meetings | 1 |
| 10 | Meeting Detail | Meetings | 1 |
| 11 | Meeting Form | Meetings | 1 |
| 12 | Meeting Attendance | Meetings | 1 |
| 13 | Meeting Cover Image | Meetings | 2 |
| 14 | Videos List | Videos | 1 |
| 15 | Video Detail | Videos | 1 |
| 16 | Video Form | Videos | 1 |
| 17 | Assignments List | Assignments | 1 |
| 18 | Assignment Detail | Assignments | 1 |
| 19 | Assignment Form | Assignments | 1 |
| 20 | Submission Review | Assignments | 1 |
| 21 | Admin Hub | Administration | 2 |
| 22 | Announcements | Administration | 1 |
| 23 | Google Groups | Administration | 2 |
| 24 | Hall of Fame | Administration | 2 |
| 25 | Partners | Administration | 2 |
| 26 | Presenters | Administration | 2 |
| 27 | Award Categories | Administration | 2 |
| 28 | Awards | Administration | 2 |
| 29 | Visitor Queries | Administration | 2 |
| 30 | Roadmaps List | Roadmaps | 2 |
| 31 | Roadmap Detail | Roadmaps | 2 |
| 32 | Blogs List | Blogs | 2 |
| 33 | Blog Sync | Blogs | 2 |
| 34 | Gallery | Gallery | 2 |
| 35 | Image Viewer | Gallery | 2 |
| 36 | My Profile | Profile | 2 |
| 37 | Account Settings | Account | 2 |

**Total: 37 screens**

### 22.2 Endpoint Inventory

| # | Method | Path | Status | Module |
|---|--------|------|--------|--------|
| 1 | GET | `/api/mobile/v1/me` | **NEW** | Auth |
| 2 | GET | `/api/mobile/v1/admin/dashboard` | **NEW** | Dashboard |
| 3 | GET | `/api/mobile/v1/admin/students` | **NEW** | Students |
| 4 | GET | `/api/mobile/v1/admin/students/filter-options` | **NEW** | Students |
| 5 | GET | `/api/mobile/v1/admin/students/[id]` | **NEW** | Students |
| 6 | POST | `/api/mobile/v1/admin/students` | **NEW** | Students |
| 7 | PATCH | `/api/mobile/v1/admin/students/[id]` | **NEW** | Students |
| 8 | GET | `/api/students/[id]/guardian-details` | EXISTS | Students |
| 9 | POST | `/api/invitations/create` | EXISTS (needs guard) | Students |
| 10 | POST | `/api/profile/upload` | EXISTS | Students |
| 11 | GET | `/api/mobile/v1/admin/meetings` | **NEW** | Meetings |
| 12 | POST | `/api/mobile/v1/admin/meetings` | **NEW** | Meetings |
| 13 | PATCH | `/api/mobile/v1/admin/meetings/[id]` | **NEW** | Meetings |
| 14 | DELETE | `/api/mobile/v1/admin/meetings/[id]` | **NEW** | Meetings |
| 15 | PATCH | `/api/mobile/v1/admin/meetings/[id]/attendance` | **NEW** | Meetings |
| 16 | POST | `/api/meetings/create-google-meet` | EXISTS | Meetings |
| 17 | POST | `/api/meetings/create-feedback-form` | EXISTS | Meetings |
| 18 | POST | `/api/meetings/[id]/send-feedback-email` | EXISTS | Meetings |
| 19 | POST | `/api/meetings/[id]/cover-image/upload` | EXISTS | Meetings |
| 20 | POST | `/api/meetings/[id]/cover-image/generate` | EXISTS | Meetings |
| 21 | POST | `/api/meetings/[id]/cover-image/confirm` | EXISTS | Meetings |
| 22 | GET | `/api/session-videos` | EXISTS | Videos |
| 23 | POST | `/api/session-videos` | EXISTS | Videos |
| 24 | GET | `/api/session-videos/[id]` | EXISTS | Videos |
| 25 | PATCH | `/api/session-videos/[id]` | EXISTS | Videos |
| 26 | DELETE | `/api/session-videos/[id]` | EXISTS | Videos |
| 27 | GET | `/api/assignments` | EXISTS | Assignments |
| 28 | POST | `/api/assignments` | EXISTS | Assignments |
| 29 | GET | `/api/assignments/[id]` | EXISTS | Assignments |
| 30 | PATCH | `/api/assignments/[id]` | EXISTS | Assignments |
| 31 | DELETE | `/api/assignments/[id]` | EXISTS | Assignments |
| 32 | GET | `/api/assignments/[id]/submissions/[submissionId]` | EXISTS | Assignments |
| 33 | PATCH | `/api/assignments/[id]/submissions/[submissionId]/feedback` | EXISTS | Assignments |
| 34 | GET | `/api/github/repo` | EXISTS | Assignments |
| 35 | GET | `/api/github/readme` | EXISTS | Assignments |
| 36 | GET | `/api/github/tree` | EXISTS | Assignments |
| 37 | GET | `/api/github/file` | EXISTS | Assignments |
| 38 | GET | `/api/mobile/v1/admin/announcements` | **NEW** | Admin |
| 39 | POST | `/api/mobile/v1/admin/announcements` | **NEW** | Admin |
| 40 | PATCH | `/api/mobile/v1/admin/announcements/[id]` | **NEW** | Admin |
| 41 | DELETE | `/api/mobile/v1/admin/announcements/[id]` | **NEW** | Admin |
| 42 | GET/POST/PATCH/DELETE | `/api/mobile/v1/admin/google-groups` | **NEW** | Admin |
| 43 | GET/POST/PATCH/DELETE | `/api/mobile/v1/admin/partners` | **NEW** | Admin |
| 44 | GET/POST/PATCH/DELETE | `/api/mobile/v1/admin/presenters` | **NEW** | Admin |
| 45 | GET/POST/PATCH/DELETE | `/api/mobile/v1/admin/hall-of-fame` | **NEW** | Admin |
| 46 | GET/POST/PATCH/DELETE | `/api/mobile/v1/admin/award-categories` | **NEW** | Admin |
| 47 | GET/POST/PATCH/DELETE | `/api/mobile/v1/admin/awards` | **NEW** | Admin |
| 48 | GET | `/api/admin/visitor-chat-queries` | EXISTS (needs guard) | Admin |
| 49 | GET | `/api/mobile/v1/blogs` | **NEW** | Blogs |
| 50 | POST | `/api/add-blog` | EXISTS | Blogs |
| 51 | GET | `/api/sync-blogs/[startingIndex]` | EXISTS | Blogs |
| 52 | GET | `/api/cloudinary/images` | EXISTS | Gallery |
| 53 | GET | `/api/mobile/v1/roadmaps` | **NEW** | Roadmaps |
| 54 | GET | `/api/mobile/v1/roadmaps/[slug]` | **NEW** | Roadmaps |
| 55 | GET | `/api/cohorts` | EXISTS | Shared |
| 56 | POST | `/api/mobile/v1/push/register` | **NEW** | Push |
| 57 | DELETE | `/api/mobile/v1/push/register` | **NEW** | Push |

**Summary:** 57 endpoint groups — 22 exist (reuse), 35 need implementation

### 22.3 Current Web Architecture Reference

```
Browser → Clerk (auth) → React hooks → Supabase client (anon key) → Postgres
Browser → Clerk (auth) → fetch(/api/*) → requireAuth → supabaseAdmin → Postgres
```

### 22.4 Target Mobile Architecture

```
Mobile App → Clerk Expo (auth) → Bearer JWT → /api/mobile/v1/* → requireAdmin → supabaseAdmin → Postgres
Mobile App → Clerk Expo (auth) → Bearer JWT → /api/* (existing) → requireAuth → supabaseAdmin → Postgres
```

### 22.5 Key Files Reference (Web Codebase)

| Purpose | Path |
|---------|------|
| Auth helpers | `src/lib/auth/requireAuth.ts`, `src/lib/auth/clerkUser.ts` |
| Post-login routing | `src/app/post-login/route.ts` |
| Admin settings nav | `src/app/modules/Settings/GeneralSettings/GeneralSettings.tsx` |
| Student types | `src/types/student.types.ts` |
| Assignment types/schemas | `src/types/assignment.types.ts`, `src/lib/assignments/assignmentSchemas.ts` |
| Video types/schemas | `src/types/sessionVideo.types.ts`, `src/lib/sessionVideos/sessionVideoSchemas.ts` |
| Profile edit schema | `src/app/profile/[id]/edit/profileEditFormSchema.ts` |
| Student row mapper | `src/lib/mapSupabaseStudentRowToProfile.ts` |
| Meetings hook | `src/hooks/useMeetings.ts` |
| Students hook | `src/hooks/useStudentsWithFilters.ts` |
| Announcements hook | `src/hooks/useAnnouncements.ts` |
| DB migrations | `supabase/migrations/` |

---

*Document generated from MentorBridge Web App codebase analysis — July 19, 2026.*
