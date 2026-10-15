# Epic 1 Context: Foundation and Platform Setup

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Establish the full-stack Next.js 15 repository scaffolding, Supabase backend infrastructure in `ap-south-1`, core DDL migrations for all 14 tables, security triggers (`fn_enforce_provider_column_protection`), RLS policies, `public_providers` projection view, pilot seed substrate with matching Auth users, CI secret scanning, and staging deployment so that parallel development across public, provider, and admin portals can proceed safely without architectural divergence.

## Stories

- Story 1.1: Provision Supabase Project in ap-south-1 & Secrets Verification
- Story 1.2: Pre-Implementation Phone Authentication Integration Spike Gate
- Story 1.3: Next.js 15 Monolith Scaffolding, Layering Conventions & Design Tokens
- Story 1.4: Shared Root Layout Shell & Wordmark Component
- Story 1.5: Supabase Core DDL Migration, Security Triggers & Generated Types
- Story 1.6: Public Projection View & Database Client Singletons
- Story 1.7: Pilot Seed Data Substrate with Matching Auth Users & Photo Placeholders
- Story 1.8: Staging Deployment, Health Check Endpoint & CI Secret Scanning

## Requirements & Constraints

- Monolithic Next.js 15 App Router architecture with strict vertical layering (`types/`, `services/`, `actions/`, `hooks/`, `components/`) and route groups `(public)`, `(provider)`, and `(admin)`.
- Supabase hosted in region `ap-south-1` (Mumbai) for sub-35ms latency to Sri Lanka.
- Secrets hygiene: `SUPABASE_SERVICE_ROLE_KEY` restricted strictly to server context (`lib/supabase/admin.ts`) with `import 'server-only'`. Agents must never inspect or commit live `.env.local` files; automated CI secret scanning must block credential commits.
- Phone authentication spike must validate `supabaseAdmin.auth.admin.createUser({ phone, password, phone_confirm: true })` vs synthetic email fallback (`<digits>@fixnear.invalid` with RFC 2606 `.invalid` domain and email sending disabled) prior to UI auth work.
- Database security: trigger `fn_enforce_provider_column_protection` blocks direct non-admin updates to protected provider fields (`status`, `is_verified`, `provider_type`, `slug`, etc.) with code `P0001`. Status transitions must route strictly through PostgreSQL `SECURITY DEFINER` state machine functions.
- Standing `search_path` security invariant: every `SECURITY DEFINER` function and trigger must explicitly specify `SET search_path = public`.
- Client separation: anonymous reads query the pre-aggregated `public_providers` view (filtering `status = 'approved' AND is_verified = true AND requires_manual_repair = false`); anonymous callers have zero direct `SELECT` access to raw `providers`.
- Rate limiting substrate uses PostgreSQL table `rate_limit_buckets` (no external Redis in Phase 1).

## Technical Decisions

- Stack: Next.js 15 (App Router, React Server Components for public SSR), TypeScript, Tailwind CSS, TanStack Query for client state.
- Supabase services: PostgreSQL 15+, Supabase Auth (GoTrue), Supabase Storage (`provider-photos` bucket, max 10MB, allowed MIME types JPEG/PNG/WebP, write restricted to provider's folder `auth.uid()`).
- Supabase clients:
  - `src/lib/supabase/client.ts`: Browser anon client (`createBrowserClient`).
  - `src/lib/supabase/server.ts`: Server client using `@supabase/ssr` (`createServerClient`).
  - `src/lib/supabase/admin.ts`: Privileged service-role client with `import 'server-only'`.
- Schema: 14 relational tables (`providers`, `areas`, `provider_areas`, `categories`, `sub_services`, `provider_services`, `work_photos`, `listing_status_history`, `rejection_reasons`, `contact_events`, `zero_result_searches`, `admin_users`, `rate_limit_buckets`, `phone_blocklist`).
- TypeScript database types generated into `src/lib/db/types.ts` via Supabase CLI.
- Keep-alive endpoint `GET /api/health` queries the database to prevent Supabase 7-day inactivity pause.

## UX & Interaction Patterns

- Design tokens in `tailwind.config.ts`: Canvas Base (`#F8F9FA`), Surface Raised (`#FFFFFF`), Surface Sunken (`#EDF0F2`), Primary Navy (`#0F2942`), Amber Accent (`#D97706`), WhatsApp Green (`#25D366`), with status colors.
- Accessible geometric wordmark: `Fix` in navy (`#0F2942`), `Near` in slate-black (`#0F172A`), followed by an amber location dot (`#D97706`), linking to `/` with `aria-label="FixNear Home"`.
- Mobile constraints: Touch target floor of 44px × 44px (`min-h-[44px] min-w-[44px]`), body typography default ≥ 16px to prevent iOS Safari auto-zoom, zero hover dependency.

## Cross-Story Dependencies

- Story 1.1 provides the Supabase connection parameters and environment verification needed by all subsequent stories.
- Story 1.2 spike outcome gates provider authentication implementations in Epic 2.
- Stories 1.3 and 1.4 establish frontend scaffolding and design tokens required by public/provider/admin UI.
- Stories 1.5 and 1.6 establish database tables, RLS, triggers, views, and client singletons required by the seed script (Story 1.7) and all downstream epics.
- Story 1.7 seed data unblocks parallel development for Epic 4 (public search) and Epic 3 (admin review).
- Story 1.8 verifies staging deployment and CI guardrails for the foundational platform.
