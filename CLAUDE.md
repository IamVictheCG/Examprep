# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (Next.js)
npm run build    # Production build
npm run lint     # Run ESLint
```

There is no test suite.

## Environment variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Stack

- **Next.js 16.2.6 / React 19** — see AGENTS.md; APIs differ from prior versions
- **Supabase** — auth + PostgreSQL database
- **Paystack** — payment processing (Nigerian market)
- **Anthropic Claude API** — called directly via `fetch`, not the SDK
- **framer-motion**, **recharts**, **lucide-react**

## Architecture

### Route structure

```
src/app/
  (auth)/          # login, register, forgot-password, verify-email
  (dashboard)/     # all authenticated pages
    dashboard/
    account/
    exam/[examId]/
      page.tsx           # exam overview
      flashcards/
      mock-test/
        [sessionId]/review/
      question-bank/
      analytics/
      ai-tutor/
  api/
    ai/tutor/            # edge runtime, streams Anthropic responses
    payments/initialize/ # Paystack transaction init
    payments/verify/     # Paystack callback (GET)
    webhooks/paystack/   # Paystack webhook (POST, HMAC-verified)
  auth/callback/         # Supabase OAuth/magic-link callback
```

Both `(auth)` and `(dashboard)` route groups require their own `layout.tsx` — these must not be deleted or Next.js will throw a type error at build time.

### examId convention

`examId` in routes and throughout the frontend is always the **slug** (e.g. `"ican"`, `"bar-finals"`), not a UUID. All `src/lib/api/*` server actions resolve the slug to a UUID via a local `resolveExamSlug()` helper defined at the top of each API module — it is not a shared utility. The authoritative list of slugs/names is `src/lib/constants.ts` (`EXAMS` array).

### Data access pattern

All database reads/writes go through `"use server"` functions in `src/lib/api/`. Never import Supabase directly in client components — use the API modules or API routes.

- **Server context** (Server Actions, Route Handlers): `src/lib/supabase/server.ts` → `createClient()`
- **Client context** (browser): `src/lib/supabase/client.ts` → `createClient()`
- **Middleware**: `src/lib/supabase/middleware.ts` → `updateSession()`

### `src/lib/` module map

| Module | Contents |
|--------|----------|
| `api/questions.ts` | `getQuestionsByExam`, `getTopicsByExam`, `getQuestionById`, `getRandomQuestions`, `searchQuestions`, `updateQuestionExplanation` |
| `api/mock-tests.ts` | `createSession`, `saveAnswer`, `completeSession`, session retrieval |
| `api/flashcards.ts` | Flashcard session management |
| `api/bookmarks.ts` | `bookmarked_questions` CRUD |
| `api/analytics.ts` | `topic_performance` reads |
| `api/profile.ts` | Profile reads/writes |
| `auth/actions.ts` | `signUp`, `signIn`, `signOut`, `resetPassword`, `updatePassword` — all Server Actions |
| `subscriptions/index.ts` | `getUserSubscriptions`, `hasActiveSubscription`, `getSubscribedExams` |
| `ai/tutor.ts` | SSE streaming to Anthropic, rate limiting, exam-scoped system prompt |
| `ai/explanations.ts` | Non-streaming wrong-answer explanations (called from `"use server"` context) |
| `paystack/client.ts` | `initializeTransaction`, `verifyTransaction` |
| `constants.ts` | `EXAMS` array — authoritative slug/name list |

TypeScript types for the Supabase schema are generated in `src/types/database.types.ts`.

### Auth & middleware

`src/middleware.ts` enforces route protection. It is a **no-op** when `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are absent (dev without Supabase). Protected prefixes: `/dashboard`, `/exam/`, `/account`. Auth-only prefixes (redirect to dashboard if logged in): `/login`, `/register`.

> **Next.js 16 deprecation**: The `middleware.ts` file convention is deprecated in this version — the build warns to use `proxy` instead. Do not rename it until the project is ready to migrate.

`useUser()` (`src/hooks/useUser.ts`) — the client-side hook for current user + profile. Returns `{ user, profile, loading }`. Silently fails when Supabase is not configured.

### Supabase schema

Tables: `profiles`, `exams`, `topics`, `questions`, `subscriptions`, `mock_test_sessions`, `flashcard_sessions`, `topic_performance`, `bookmarked_questions`, `ai_tutor_sessions`. Migration: `supabase/migrations/001_initial_schema.sql`. All tables have RLS enabled — users can only read/write their own rows. `exams`, `topics`, and `questions` are read-only for all authenticated users.

A Postgres trigger auto-creates a `profiles` row on `auth.users` insert.

### AI features

- **Tutor** (`src/lib/ai/tutor.ts`): streams Anthropic SSE, exam-scoped system prompt, rate-limited to 20 messages/hour per user, runs on `edge` runtime.
- **Explanations** (`src/lib/ai/explanations.ts`): non-streaming, generates wrong-answer explanations for mock test review, called from a `"use server"` context.

Model: `claude-sonnet-4-20250514`. API key: `process.env.ANTHROPIC_API_KEY`.

### Payments

`src/lib/paystack/client.ts` handles `initializeTransaction` and `verifyTransaction` against the Paystack REST API. The payment flow:

1. Client calls `POST /api/payments/initialize` → gets `authorization_url`
2. User completes payment on Paystack
3. Paystack redirects to `GET /api/payments/verify?reference=...` → inserts subscription row
4. Paystack also fires `POST /api/webhooks/paystack` (HMAC-SHA512 verified) for async confirmation

Subscription period: 30 days from payment date.

### Styling

**All layout and component styles use inline CSS objects** — no Tailwind utility classes in JSX (Tailwind is only used for the `antialiased` body class and `font-heading` / `font-body` CSS variable classes). Design tokens are CSS variables defined in `src/app/globals.css` (`--bg-primary`, `--bg-surface`, `--bg-surface-2`, `--text-primary`, `--text-muted`, `--border-cyan`, etc.).

Recharts and SVG cannot consume CSS variables, so colour constants (e.g. `CYAN = "#00e5ff"`, `BORDER = "rgba(0,229,255,0.12)"`) are defined at the top of each file that renders charts.

Fonts: **Syne** (weights 700/800, class `font-heading`) and **Space Grotesk** (weights 400/500/600, default body).

### Pages with mock data

Several pages still use hardcoded `MOCK_*` constants pending backend integration (labelled "MOCK DATA — replace with API call in Backend Phase 4"):
- `dashboard/page.tsx` — stats (study time, tests, avg score), recent activity
- `exam/[examId]/page.tsx` — performance stats and recent sessions
- `exam/[examId]/flashcards/page.tsx` — flashcard content
- `exam/[examId]/mock-test/[sessionId]/review/page.tsx` — review data
- `account/page.tsx` — user profile, subscriptions, billing history
