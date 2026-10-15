---
title: 'Story 1.3: Next.js 15 Monolith Scaffolding, Layering Conventions & Design Tokens'
type: 'feature'
created: '2026-10-15'
status: 'done'
baseline_commit: 'fc0d7c6b7df2b791dfac1debd63e4d2bdc554d36'
route: 'dispatch'
review_loop_iteration: 0
context:
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/implementation-artifacts/epic-1-context.md
  - _bmad-output/planning-artifacts/architecture/architecture-fixnear-2026-10-14/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-fixnear-2026-10-13/DESIGN.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FixNear requires a single unified Next.js 15 App Router monolith with strict architectural layering and tokenized styling, but the repository currently lacks frontend dependencies, route group scaffolding, directory boundaries, and design tokens.

**Approach:** Scaffold Next.js 15, React 19, Tailwind CSS v3, and TanStack Query; establish the 5 architectural layering directories (`types/`, `services/`, `actions/`, `hooks/`, `components/`) and route groups `(public)`, `(provider)`, and `(admin)` with non-colliding subpaths; wire an end-to-end canary slice demonstrating `server-only` and `'use server'` boundaries; add the `cn` utility; and configure `tailwind.config.ts` with all design tokens, typography scale, and 44px touch-target utility from `DESIGN.md`.

## Boundaries & Constraints

**Always:**
- Keep existing root npm scripts (`verify:supabase`, `test:unit`, `test:spike`, `typecheck`) operational.
- Enforce the 5 layering directories under `src/`: `src/types/`, `src/services/`, `src/actions/`, `src/hooks/`, and `src/components/`.
- Enforce `import 'server-only'` at the top of any service file executing privileged operations.
- Enforce `'use server'` at the top of any Next.js Server Action in `src/actions/`.
- Prevent route collisions: `src/app/(public)/page.tsx` resolves to `/`; `(provider)` and `(admin)` use subpaths (e.g. `dashboard/page.tsx`).
- Pin Tailwind CSS to v3 (`tailwindcss@^3.4.17`, `postcss`, `autoprefixer`) for `tailwind.config.ts` compatibility.
- Configure `tailwind.config.ts` with all tokens from `DESIGN.md`: surface, ink, brand, border, and status colors, typography ramp with Sinhala/Tamil fallbacks, border-radii, and 44px touch-target utility.
- Establish path alias `@/*` resolving to `./src/*` in `tsconfig.json`.
- Mount `QueryProvider` at the root layout with client/server boundary separation.
- Keep `src/app/layout.tsx` an unadorned root shell; defer geometric `Wordmark` and navigation chrome to Story 1.4.

**Never:**
- Never commit real secrets or remove `.gitignore` exclusions for `.env*`.
- Never import server-only services or admin clients into client components.
- Never write database DDL, RLS policies, or seed data in this story (Stories 1.5–1.7).
- Never implement complete portal UI pages or navigation flows in this story (Story 1.4 and Epics 2–5).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| 1. Next.js Build & Typecheck | Run `npm run build` and `npm run typecheck` | Next.js compilation succeeds with 0 errors; route groups compile without `/` path collision | Non-zero exit code on build or type failure |
| 2. Design Token & Typography Export | Inspect `tailwind.config.ts` theme | Theme defines all `DESIGN.md` tokens: colors (surfaces, inks, brand, borders, status), typography ramp, and `touch-target: 44px` | Missing or mismatched token values fail unit test assertions |
| 3. Server-Only Static Guardrail | Privileged service in `src/services/` | First non-comment line contains `import 'server-only'` | Test suite statically asserts presence of guardrail on privileged services |
| 4. React Query Provider Tree | Render client component wrapped with `QueryProvider` | Context provides active `QueryClient` instance supporting hooks | Missing provider throws descriptive React Context error |
| 5. End-to-End Canary Slice | Call `useCanary()` hook | Hook calls `canaryAction` (`'use server'`), which delegates to `canaryService` (`server-only`) and returns formatted result | Propagates error response if service or action fails |

</frozen-after-approval>

## Code Map

- `package.json` -- Add dependencies (`next@^15.2.0`, `react@^19.0.0`, `react-dom@^19.0.0`, `@tanstack/react-query@^5.66.0`, `server-only@^0.0.1`, `clsx@^2.1.1`, `tailwind-merge@^3.0.1`, `lucide-react@^1.16.0`) and devDependencies (`tailwindcss@^3.4.17`, `postcss@^8.5.3`, `autoprefixer@^10.4.20`, `@types/react@^19.0.0`, `@types/react-dom@^19.0.0`); add scripts (`dev`, `build`, `start`, `lint`).
- `tsconfig.json` -- Configure Next.js compiler options (`jsx: "preserve"`, `paths: { "@/*": ["./src/*"] }`, Next.js TS plugin, `lib: ["dom", "dom.iterable", "esnext"]`) while retaining existing `scripts/` and `tests/` coverage.
- `next.config.ts` -- Next.js 15 configuration.
- `postcss.config.mjs` -- PostCSS configuration for Tailwind CSS and Autoprefixer.
- `tailwind.config.ts` -- Configure full `DESIGN.md` design tokens (surface, ink, brand, border, status colors, font families with Sinhala/Tamil fallbacks, font ramp, border radius scale, and `min-h-[44px] min-w-[44px]` touch target utility).
- `src/lib/utils.ts` -- Implement standard `cn(...inputs)` class name helper merging `clsx` and `tailwind-merge`.
- `src/app/globals.css` -- Tailwind directives with root body typography defaults (16px base font).
- `src/app/layout.tsx` -- Root layout with responsive mobile viewport, global styles, and `QueryProvider`.
- `src/app/(public)/layout.tsx` -- Public directory route group layout shell.
- `src/app/(public)/page.tsx` -- Public entry placeholder at `/`.
- `src/app/(provider)/layout.tsx` -- Provider portal route group layout shell.
- `src/app/(provider)/dashboard/page.tsx` -- Provider portal entry placeholder at `/dashboard`.
- `src/app/(admin)/layout.tsx` -- Admin moderation portal route group layout shell.
- `src/app/(admin)/dashboard/page.tsx` -- Admin portal entry placeholder at `/dashboard`.
- `src/components/providers/QueryProvider.tsx` -- Client component establishing `QueryClient` singleton in React state and mounting `QueryClientProvider`.
- `src/types/index.ts` -- Architectural export barrel for domain types.
- `src/services/canary.service.ts` -- Canary service demonstrating `import 'server-only'` guardrail and business logic execution.
- `src/actions/canary.action.ts` -- Canary Server Action demonstrating `'use server'` boundary and delegating to `canaryService`.
- `src/hooks/use-canary.ts` -- Canary TanStack Query hook invoking `canaryAction`.
- `src/components/ui/index.ts` -- Architectural export barrel for UI primitives.
- `tests/unit/scaffolding.test.ts` -- Unit tests validating design token configurations, `cn` helper, layering exports, and `import 'server-only'` static guardrails.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- Install pinned Next.js 15, React 19, Tailwind CSS v3, TanStack Query v5, server-only, and UI helpers; define standard Next.js lifecycle scripts -- Scaffolds modern App Router framework while preserving existing test scripts.
- [x] `tsconfig.json` -- Update compiler options for Next.js App Router, `@/*` path mapping, and DOM/ESNext lib support -- Enables type-safe Next.js compilation across `src/`, `scripts/`, and `tests/`.
- [x] `next.config.ts` & `postcss.config.mjs` -- Author Next.js and PostCSS configurations -- Enables Tailwind CSS v3 processing and Next.js App Router compilation.
- [x] `tailwind.config.ts` -- Implement complete `DESIGN.md` design tokens (surface, ink, brand, border, status colors, font ramp, border radius scale, touch-target utility) -- Provides consistent styling primitives across all route groups.
- [x] `src/lib/utils.ts` -- Create standard `cn` class merger using `clsx` and `tailwind-merge` -- Equips UI layer with ergonomic conditional class composition.
- [x] `src/components/providers/QueryProvider.tsx` -- Implement client-side `QueryProvider` with `QueryClient` initialization in React state -- Equips client components for caching and mutations without request cache leakage.
- [x] `src/app/globals.css` & `src/app/layout.tsx` -- Create global stylesheet and unadorned root layout mounting `QueryProvider` and mobile viewport constraints -- Establishes foundational application shell without encroaching on Story 1.4 header chrome.
- [x] `src/app/(public)/layout.tsx`, `src/app/(provider)/layout.tsx`, `src/app/(admin)/layout.tsx` -- Establish route group layouts and subpath index pages -- Implements AD-1 portal isolation without `/` route collisions.
- [x] `src/types/`, `src/services/`, `src/actions/`, `src/hooks/`, `src/components/` -- Establish 5 layering directories with interconnected canary slice (`useCanary` -> `canaryAction` -> `canaryService`) enforcing `server-only` and `'use server'` -- Codifies architectural conventions.
- [x] `tests/unit/scaffolding.test.ts` -- Author and execute unit tests asserting design tokens, `cn` utility, query provider setup, and layering boundary contracts -- Verifies scaffold integrity without regression.

**Acceptance Criteria:**
- Given the project workspace, when `npm run build` and `npm run typecheck` execute, then the Next.js 15 App Router project compiles with 0 errors across root, `(public)`, `(provider)`, and `(admin)` route groups without route collisions.
- Given the architectural layering standards, when inspecting `src/`, then the 5 directories `types/`, `services/`, `actions/`, `hooks/`, and `components/` are present with an interconnected canary vertical slice demonstrating `import 'server-only'` and `'use server'` conventions.
- Given `tailwind.config.ts`, when theme configuration is inspected, then all tokens from `DESIGN.md` are present:
  - Surface colors: `surface-base` (`#F8F9FA`), `surface-raised` (`#FFFFFF`), `surface-sunken` (`#EDF0F2`).
  - Ink colors: `ink-primary` (`#0F172A`), `ink-secondary` (`#475569`), `ink-muted` (`#94A3B8`), `ink-inverse` (`#FFFFFF`).
  - Brand colors: `primary` (`#0F2942`), `primary-hover` (`#1B3A5B`), `primary-subtle` (`#EBF2F7`), `accent-amber` (`#D97706`), `accent-amber-subtle` (`#FEF3C7`), `whatsapp` (`#25D366`), `whatsapp-hover` (`#1EBE5D`), `whatsapp-text` (`#075E54`).
  - Borders: `border-subtle` (`#E2E8F0`), `border-strong` (`#CBD5E1`).
  - Status tones: `status-success` (`#15803D`), `status-warning` (`#B45309`), `status-error` (`#B91C1C`) and their subtle counterparts.
  - Typography scale: `display` (28px), `heading-1` (22px), `heading-2` (18px), `heading-3` (16px), `body` (16px), `meta` (14px), `badge` (12px).
  - Touch target utility: `min-h-[44px] min-w-[44px]`.
- Given the root layout (`src/app/layout.tsx`), when rendered, then it wraps children with `QueryProvider` and configures responsive mobile viewport defaults.
- Given existing test commands (`npm run verify:supabase`, `npm run test:unit`, `npm run test:spike`), when executed, then all existing tests continue to pass without regression.

## Implementation Notes

- Pinned and installed dependencies: `next@15.5.28`, `react@19.3.0`, `react-dom@19.3.0`, `@tanstack/react-query@^5.66.0`, `server-only@^0.0.1`, `clsx@^2.1.1`, `tailwind-merge@^3.0.1`, `lucide-react@^1.16.0`, `tailwindcss@^3.4.17`, `postcss@^8.5.3`, `autoprefixer@^10.4.20`, and React 19 type definitions.
- Added lifecycle scripts to `package.json`: `dev`, `build`, `start`, `lint` while preserving all existing verification test scripts.
- Configured `tsconfig.json` with Next.js plugin, `@/*` path mapping, `lib: ["dom", "dom.iterable", "esnext"]`, and preserved `scripts/` and `tests/` coverage.
- Configured `tailwind.config.ts` mapping all `DESIGN.md` surface, ink, brand, border, and status color tokens, typography scales, border radii, and 44px touch target utility.
- Implemented `src/lib/utils.ts` exporting standard `cn` helper combining `clsx` and `tailwind-merge`.
- Implemented `src/components/providers/QueryProvider.tsx` initializing `QueryClient` within React state to isolate cache between requests.
- Implemented `src/app/globals.css` with Tailwind directives and 16px body typography default, and `src/app/layout.tsx` mounting `QueryProvider` with responsive mobile viewport.
- Scaffolded route groups:
  - `(public)`: `layout.tsx` and placeholder `page.tsx` resolving to `/`.
  - `(provider)`: `layout.tsx` and placeholder `dashboard/page.tsx` resolving to `/dashboard`.
  - `(admin)`: `layout.tsx` and placeholder `admin/dashboard/page.tsx` resolving to `/admin/dashboard` (preventing `/` and `/dashboard` route collisions).
- Created 5 layering directories (`types/`, `services/`, `actions/`, `hooks/`, `components/`) and established an interconnected canary vertical slice:
  - `src/types/index.ts` declaring `CanaryServiceResponse` and `CanaryActionResult`.
  - `src/services/canary.service.ts` guarded with `import 'server-only'`.
  - `src/actions/canary.action.ts` declared with `'use server'` and delegating to `canaryService`.
  - `src/hooks/use-canary.ts` client hook wrapping `canaryAction` via TanStack `useQuery`.
  - `src/components/ui/index.ts` export barrel.
- Added `tests/unit/scaffolding.test.ts` verifying design tokens, `cn` helper, `server-only` runtime rejection, canary slice contracts, and directory existence. All 15 unit tests passed.
- Fixed `NODE_ENV: 'test'` type requirement in `tests/unit/verify-supabase.test.ts` introduced by Next.js global types.
- Added `*.tsbuildinfo` to `.gitignore`.
- Verified `npm run build`, `npm run typecheck`, `npm run test:unit`, `npm run verify:supabase`, and `npm run test:spike` all execute and exit with code 0.

## Spec Change Log

## Review Triage Log

- finding: `src/lib/utils.ts` tailwind-merge dropping custom typography font sizes (e.g. `text-heading-1`) when merged with text colors (e.g. `text-ink-primary`).
  verdict: medium
  route: patch
  evidence: By default twMerge considers all `text-*` tokens as part of the same classGroup ('font-size'). Configured `extendTailwindMerge` with explicit `font-size` and `color` theme groups to prevent collision.
- finding: `next.config.ts` wildcard remotePatterns (`hostname: '*'`) posing potential SSRF risk.
  verdict: medium
  route: patch
  evidence: Restricting image proxy origins to `'*.supabase.co'` eliminates wildcard SSRF vulnerabilities while supporting Supabase Storage assets.
- finding: Missing ESLint tooling causing `next lint` to block on interactive prompt.
  verdict: medium
  route: patch
  evidence: Installed `eslint` and `eslint-config-next`, added `.eslintrc.json` with `next/core-web-vitals`. `npm run lint` now executes non-interactively with 0 errors.
- finding: `src/app/globals.css` used hardcoded hex colors and lacked 16px form input font floor from DESIGN.md.
  verdict: low
  route: patch
  evidence: Updated body to `@apply bg-surface-base text-ink-primary;` and added `input, textarea, select { font-size: 16px; }` to eliminate iOS Safari viewport auto-zoom.
- finding: `src/types/index.ts` `CanaryActionResult` was not a discriminated union, allowing indeterminate states.
  verdict: low
  route: patch
  evidence: Refactored into generic `ActionResult<T>` discriminated union with mutual exclusion on `data` and `error`.
- finding: `src/components/providers/QueryProvider.tsx` lacked `refetchOnWindowFocus: false` default option for mobile networks.
  verdict: low
  route: patch
  evidence: Added `refetchOnWindowFocus: false` to default query client options to conserve battery and mobile data.
- finding: `tsconfig.json` missing `forceConsistentCasingInFileNames: true`.
  verdict: low
  route: patch
  evidence: Re-added `"forceConsistentCasingInFileNames": true` to compiler options to enforce cross-platform filename casing hygiene.
- finding: `tests/unit/scaffolding.test.ts` lacked font fallback verification and direct RSC canary execution.
  verdict: low
  route: patch
  evidence: Updated unit test suite with 16 comprehensive tests including Sinhala/Tamil font fallbacks, server-only subprocess rejection, QueryProvider SSR, and direct `canaryAction` execution.
- finding: Missing `zod` dependency specified in ADRs.
  verdict: low
  route: patch
  evidence: Installed `zod@^3.24.2` in `dependencies`.
- finding: `tests/unit/verify-supabase.test.ts` type conflict with Next.js ambient `NODE_ENV`.
  verdict: low
  route: patch
  evidence: Cast test override assignment to `process.env.NODE_ENV = 'test' as any` ensuring clean TypeScript compilation.


## Design Notes

Per `ARCHITECTURE-SPINE.md` and `DESIGN.md`:
1. **Route Group URLs:**
   - Next.js route groups `(group)` are organizational and do not add URL segments.
   - `src/app/(public)/page.tsx` maps to `/`.
   - `src/app/(provider)/dashboard/page.tsx` maps to `/dashboard`.
   - `src/app/(admin)/dashboard/page.tsx` maps to `/dashboard`.
2. **Layering Invariants:**
   - Client components must never import `src/services/` or `src/lib/supabase/admin.ts`.
   - Privileged services must include `import 'server-only'` to guarantee tree-shaking and client bundle protection.
   - Server Actions reside in `src/actions/` with `'use server'` directive.
   - Client queries and mutations wrap Server Actions using TanStack Query hooks in `src/hooks/`.
3. **TanStack Query Singleton Pattern:**
   `QueryClient` is instantiated in React state inside `QueryProvider.tsx` to prevent leaking query cache between different server requests.

## Verification

**Commands:**
- `npm run typecheck` -- expected: TypeScript compiles with 0 errors across all directories.
- `npm run build` -- expected: Next.js 15 builds all routes successfully without route collision errors.
- `npm run test:unit` -- expected: Scaffolding unit tests and existing verification unit tests pass.
- `npm run verify:supabase` -- expected: Supabase connectivity check continues to exit 0.
- `npm run test:spike` -- expected: Spike suite continues to exit 0.
