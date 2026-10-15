---
status: final
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-fixnear-2026-10-13/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-fixnear-2026-10-14/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/architecture/architecture-fixnear-2026-10-14/DATA-MODEL.md
  - _bmad-output/planning-artifacts/ux-designs/ux-fixnear-2026-10-13/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-fixnear-2026-10-13/EXPERIENCE.md
  - _bmad-output/planning-artifacts/briefs/brief-fixnear-2026-10-13/brief.md
---

# FixNear (Phase 1 — Negombo Pilot) - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for FixNear (Phase 1 — Negombo Pilot), decomposing the requirements from the PRD, UX Design (DESIGN.md & EXPERIENCE.md), and Architecture Spine (ARCHITECTURE-SPINE.md & DATA-MODEL.md) into implementable stories.

## Requirements Inventory

### Functional Requirements

- **FR-101**: Public Directory Access — The entire directory, category pages, and provider profiles must be accessible to unauthenticated visitors without presenting any login or registration prompt.
- **FR-102**: Area Selector & Persistence — The system must treat the URL path (`/{area}`) as the single source of truth for location. The user's last selected area is persisted in a server-readable cookie (`fixnear_area`) so subsequent visits to the root `/` immediately redirect or render without hydration mismatch or UI flicker. An accessible header pill allows switching between launch areas (`Negombo`, `Kochchikade`, `Katunayake`, `Seeduwa`).
- **FR-103**: Category & Sub-Service Navigation — The homepage must render visual entry points for the 4 primary categories, expanding to show admin-managed sub-service tags upon tap.
- **FR-104**: Multi-Facet Filter Bar — Search results must support filtering by sub-service tags (single/multi-select), area (defaults to active area), and service mode (`Visits your location`, `Has physical workshop / Visit shop`).
- **FR-105**: Provider Summary Cards — Each search result card must display: provider or business name, verified trust badge, base area (with visiting tag if matched cross-area), primary category & sub-service specialties, visiting fee & pricing model, service mode icon/label, thumbnail preview of up to 3 work photos, and direct "Contact on WhatsApp" CTA.
- **FR-106**: Cross-Area Matching Logic — If a provider's Base Area does not match the customer's selected area, but the provider's `service_mode` includes `comes_to_customer` and the customer's area is in `areas_served`: show below exact in-area matches labeled *"Based in [Base Area], visits [Selected Area]"*. Providers configured strictly as `customer_comes_to_shop` never appear in cross-area results.
- **FR-107**: Zero-Results State — When no in-area or visiting providers match a query, display an informative zero-state with actionable suggestions: adjacent launch areas, broader category exploration, and feedback/concierge link.
- **FR-201**: Comprehensive Provider Profile — Dedicated profile page displaying header (name, business name, verified badge, base area, workshop address), full service narrative bio, sub-services grouped by category, service mode & areas served, pricing block & visiting fee, responsive lightbox photo gallery, and sticky/prominent "Contact on WhatsApp" CTA.
- **FR-202**: WhatsApp Hand-off Bottom Sheet — Tapping "Contact on WhatsApp" triggers a lightweight mobile bottom sheet with optional customer name input, primary button "Continue to WhatsApp", and secondary button "Skip and open WhatsApp".
- **FR-203**: Dynamic WhatsApp Pre-filled Deep Link — System constructs `wa.me` URL targeting provider's verified E.164 phone number with pre-filled greeting including sub-service, area, and optional customer name.
- **FR-204**: Customer Privacy & Anonymous Metric Logging — The system must NOT store customer names or mobile numbers in the database during hand-off. The hand-off event atomically increments an anonymous conversion counter associated with `provider_id` (`contact_events` with salted hash deduplication).
- **FR-301**: Free Provider Registration — Technicians can register free of charge as either an "Individual Technician" or a "Repair Business".
- **FR-302**: Credential Authentication — Authentication must be based on Mobile Number (E.164) + Password. No email address required for provider accounts.
- **FR-303**: Onboarding Profile Form — Form captures personal name, business name (required if business), WhatsApp mobile number, base area, workshop address, bio, categories & sub-services, service mode, areas served, pricing model, and optional visiting fee in LKR.
- **FR-304**: Work Photo Upload Gallery — Providers can upload up to 10 photos of past repair work or workshop facilities during onboarding or profile editing.
- **FR-305**: Initial Pending State — Newly submitted listings assigned `status = 'pending_approval'` and `is_verified = false`. Unapproved listings remain inaccessible on public search and direct URLs.
- **FR-306**: Password Reset Flow — Admin-assisted password reset protocol generating a secure temporary password with 24-hour expiration (`temp_password_expires_at`) and mandatory password change on first login (`must_change_password`).
- **FR-401**: Provider Dashboard / Edit Mode — Authenticated providers can log in to edit bio, photos, sub-services, visiting fees, and service areas.
- **FR-402**: Edit Security & Re-verification Guardrail (Option A) — If an approved provider modifies their WhatsApp mobile number or business name, the listing transitions to `pending_reverification`, `is_verified = false`, is immediately hidden from public directory/search, and alerts Admin.
- **FR-501**: Admin Authentication — Secure Email + Password authentication with rate limiting for Admin (Dhanushka).
- **FR-502**: Listing Review Queue — Admin panel listing all `pending_approval` and `pending_reverification` listings sorted by submission timestamp.
- **FR-503**: 1-Tap Verification Tooling — Review card includes a 1-tap "Ping on WhatsApp" action opening a pre-formatted verification inquiry to the applicant's WhatsApp number.
- **FR-504**: Approval & Rejection Actions — Admin can Approve (`status = 'approved'`, `is_verified = true`), Reject (mandatory structured reason from `rejection_reasons`), or Suspend listings.
- **FR-505**: Instant Submission Alerts — Dispatch instant notification (Telegram Bot API) to Admin whenever a new provider submits an application.
- **FR-506**: Managed Taxonomy Editor — Admin CRUD interface to add, edit, reorder, or deprecate Primary Categories, Sub-services, and active Launch Areas.
- **FR-601**: Clean Crawlable URL Hierarchy — Category/service landing pages: `/{area}/{category-or-subservice-slug}`; provider profiles: `/providers/{area}/{slug}`.
- **FR-602**: Server-Side Rendering (SSR) / Metadata — Public directory and profile pages rendered server-side with dynamic, unique `<title>`, `<meta name="description">`, and OpenGraph tags for rich WhatsApp previews.
- **FR-603**: Dynamic XML Sitemap — Platform automatically generates and updates `sitemap.xml` containing all active areas, services, and approved provider URLs.

### NonFunctional Requirements

- **NFR-101**: Touch Target Compliance — All clickable and tappable elements (buttons, chips, cards, inputs) must maintain a strict minimum bounding box of 44px × 44px (`min-h-[44px] min-w-[44px]`).
- **NFR-102**: Zero Hover Reliance — All UI interactions must function without hover states, ensuring complete touchscreen usability.
- **NFR-103**: Typography & Readability — Primary body text ≥ 16px to prevent iOS Safari auto-zoom; WCAG 2.1 AA contrast (≥ 4.5:1 for normal text, > 12:1 for headings).
- **NFR-104**: Standard Terminology — Plain language adhering strictly to the single noun "Provider" / "Technician" across all interfaces.
- **NFR-201**: Mobile Network Optimization — Largest Contentful Paint (LCP) < 2.5s over standard Sri Lankan 3G/4G connections.
- **NFR-202**: Image Optimization Pipeline — Validated image inputs (JPEG, PNG, WebP up to 10MB), client-side WebP compression (<1200px), responsive thumbnail generation, and CDN delivery.
- **NFR-301**: Phone Number Standards — All stored phone numbers validated and stored in international E.164 format (`+94XXXXXXXXX`).
- **NFR-302**: Customer Privacy by Design — Zero customer PII stored; contact click deduplication uses salted hash: `SHA256(ip + user_agent + date + provider_id + CONTACT_HASH_SALT)`.
- **NFR-303**: Rate Limiting & Anti-Spam — Primary rate limiting implemented via PostgreSQL table (`rate_limit_buckets`) on registration (3/hour/IP) with Cloudflare Turnstile, and WhatsApp contact logging (10/min/IP). No Upstash Redis in Phase 1.
- **NFR-401**: Language & Currency — Phase 1 UI in conversational English; currency display in Sri Lankan Rupees (`LKR`); string resources isolated for Phase 2 Sinhala and Tamil localization.

### Additional Requirements

- **ARCH-1**: Next.js 15 App Router Full-Stack Monolith — Server-driven vertical slices partitioned into `(public)`, `(provider)`, and `(admin)` route groups; React Server Components for public directory zero-JS LCP.
- **ARCH-2**: Supabase Managed Backend Substrate — PostgreSQL 15+, Supabase Auth, and Supabase Storage in region `ap-south-1` (Mumbai, India).
- **ARCH-3**: Phone Auth Integration Spike & Fallback — Spike validating `admin.createUser({ phone, password, phone_confirm: true })`; fallback synthetic email `phone_digits + "@fixnear.invalid"` (reserved RFC 2606 `.invalid` domain; email sending disabled in Supabase Auth) if SMS gateway is strictly required by Supabase Cloud.
- **ARCH-4**: Admin-Assisted Temporary Password Expiration — Server Action login-time check: if `must_change_password = true` and `NOW() > temp_password_expires_at`, session is rejected and invalidated via `signOut()`.
- **ARCH-5**: PostgreSQL Rate Limiting Substrate — Primary rate limiting implemented via PostgreSQL table `rate_limit_buckets` with atomic timestamp/counter sliding-window functions for provider registration (3/hour/IP) and WhatsApp contact logging (10/min/IP). No Upstash Redis dependency in Phase 1.
- **ARCH-6**: Server-Only Secrets Boundary — `SUPABASE_SERVICE_ROLE_KEY` strictly inside `lib/supabase/admin.ts` with `import 'server-only'`; automated CI secret scanning.
- **ARCH-7**: Database Security & Column Protection — PostgreSQL trigger `fn_enforce_provider_column_protection` blocking non-admin mutation of `status`, `is_verified`, `provider_type`, and `slug`.
- **ARCH-8**: Public Read Projection View `public_providers` — Pre-aggregates JSONB relations (`areas_served`, `sub_services`, `photos`) with zero runtime SQL joins.
- **ARCH-9**: Direct-to-Storage Photo Upload Architecture — Browser uploads compressed WebP directly to Supabase Storage `provider-photos` bucket; Server Action `recordWorkPhotoAction` verifies object existence, MIME type, and size before inserting database record.
- **ARCH-10**: Operational Lifecycle & Keep-Alive — Automated keep-alive cron pinging `GET /api/health` every 3 days; scheduled weekly GitHub Action storage backup; Supabase Pro upgrade prior to public launch.
- **ARCH-11**: Telegram Bot Circuit Breaker — Non-blocking registration alert dispatch wrapped in a 2000ms timeout.

### UX Design Requirements

- **UX-DR1**: Design Tokens & Color Discipline — Implement Tailwind design tokens for canvas base (`#F8F9FA`), surface raised (`#FFFFFF`), surface sunken (`#EDF0F2`), primary navy (`#0F2942`), ink slate hierarchy, craftsman amber (`#D97706`), and strictly reserved WhatsApp green (`#25D366`).
- **UX-DR2**: Wordmark Component — Geometric sans-serif wordmark: `Fix` in primary navy (`#0F2942`), `Near` in slate-black (`#0F172A`), followed by an amber location pin/dot (`#D97706`).
- **UX-DR3**: Area Selector Pill Component — Persistent sticky header pill (`📍 Area: [Town] ▾`) with server-readable cookie (`fixnear_area`) synchronization and query preservation on town switch.
- **UX-DR4**: 4-Step Provider Registration Wizard — Multi-step mobile form with `sessionStorage` state preservation, inline validation, phone prefixing, and WebP compression progress indicators.
- **UX-DR5**: Provider Summary Card Component — Card displaying badges, verified trust indicators, 3-thumbnail strip, and isolated WhatsApp CTA (`stopPropagation`).
- **UX-DR6**: WhatsApp Contact Bottom Sheet Component — Modal sheet sliding up 40% viewport, touch drag-to-dismiss, desktop auto-focus vs mobile tap-to-focus, and client-side PII scrubbing.
- **UX-DR7**: Zero-Results Empty State Component — Empathetic empty state with adjacent town links, query logging, and "Message FixNear on WhatsApp" concierge CTA.
- **UX-DR8**: Touch Target & Accessibility Floor — Enforce minimum 44px × 44px bounding box (`min-h-[44px] min-w-[44px]`), 16px input font size (zero iOS Safari zoom), WCAG 2.1 AA contrast (>4.5:1), and visible 2px keyboard focus rings.
- **UX-DR9**: Status Banner & Alert Primitives — Visual banners for `pending_approval` (amber), `pending_reverification` (Option A lockdown notice), and `rejected` (crimson with admin feedback).
- **UX-DR10**: Admin Review Card & 1-Tap Modals — Mobile-first queue card with 1-tap WhatsApp verification ping, 1-tap Approve, and Reject modal with pre-defined reason radio choices.

### Multi-Dimensional Requirements Coverage Maps

#### Functional Requirements Coverage Map (28/28)

| Requirement ID | Description | Primary Epic | Secondary Epic / Enabler |
| :--- | :--- | :--- | :--- |
| **FR-101** | Public Directory Access (zero-login browsing) | **Epic 4** | Epic 1 (Public View & Anonymous Access) |
| **FR-102** | Area Selector & Persistence (URL single source + cookie) | **Epic 4** | Epic 1 (Launch Areas Seed) |
| **FR-103** | Category & Sub-Service Navigation (4 primary categories) | **Epic 4** | Epic 1 (Taxonomy Seed) |
| **FR-104** | Multi-Facet Filter Bar (sub-service, area, service mode) | **Epic 4** | — |
| **FR-105** | Provider Summary Cards (badges, pricing, 3-strip, CTA) | **Epic 4** | Epic 1 (Design Tokens) |
| **FR-106** | Cross-Area Matching Logic (2-tier ranking engine) | **Epic 4** | Epic 1 (`public_providers` view) |
| **FR-107** | Zero-Results State (adjacent links, demand logging) | **Epic 4** | Epic 1 (`zero_result_searches` table) |
| **FR-201** | Comprehensive Provider Profile (`/providers/{area}/{slug}`) | **Epic 5** | Epic 1 (Schema & Seed) |
| **FR-202** | WhatsApp Hand-off Bottom Sheet (modal, optional name) | **Epic 5** | Epic 1 (Design Tokens) |
| **FR-203** | Dynamic WhatsApp Pre-filled Deep Link (`wa.me`) | **Epic 5** | — |
| **FR-204** | Customer Privacy & Anonymous Metric Logging (`contact_events`) | **Epic 5** | Epic 1 (`rate_limit_buckets` & `contact_events`) |
| **FR-301** | Free Provider Registration (individual vs business) | **Epic 2** | Epic 1 (`providers` table) |
| **FR-302** | Credential Authentication (mobile + password) | **Epic 2** | Epic 1 (Phone Auth Spike Gate) |
| **FR-303** | Onboarding Profile Form (4-step mobile wizard) | **Epic 2** | Epic 1 (Design Tokens) |
| **FR-304** | Work Photo Upload Gallery (up to 10 WebP photos) | **Epic 2** | Epic 1 (Storage Bucket & RLS) |
| **FR-305** | Initial Pending State (`pending_approval`, hidden) | **Epic 2** | Epic 1 (Security Triggers) |
| **FR-306** | Password Reset Flow (admin temp password + 24h expiry) | **Epic 3** (Admin) | **Epic 6** (Provider Reset Screen) |
| **FR-401** | Provider Dashboard / Edit Mode (bio, photos, fees) | **Epic 6** | Epic 2 (Auth Session) |
| **FR-402** | Edit Security Guardrail (Option A lockdown on phone/business) | **Epic 6** | Epic 1 (Trigger), Epic 3 (Review Queue) |
| **FR-501** | Admin Authentication (email + password, rate-limited) | **Epic 3** | Epic 1 (`admin_users` table) |
| **FR-502** | Listing Review Queue (chronological triage) | **Epic 3** | Epic 2 (Submitted Applications) |
| **FR-503** | 1-Tap Verification Tooling (WhatsApp ping link) | **Epic 3** | — |
| **FR-504** | Approval & Rejection Actions (approve, reject, suspend) | **Epic 3** | Epic 1 (`listing_status_history` trigger) |
| **FR-505** | Instant Submission Alerts (Telegram Bot notification) | **Epic 3** | Epic 2 (Registration Final Submission) |
| **FR-506** | Managed Taxonomy Editor (categories, areas CRUD) | **Epic 3** | Epic 1 (Taxonomy Tables) |
| **FR-601** | Clean Crawlable URL Hierarchy (`/{area}/{service}`, `/providers/`)| **Epic 4** | Epic 5 (Profile URLs) |
| **FR-602** | Server-Side Rendering (SSR) & Dynamic Metadata / OpenGraph | **Epic 4** | Epic 5 (Profile Metadata) |
| **FR-603** | Dynamic XML Sitemap (`sitemap.xml`) | **Epic 4** | Epic 3 (Cache Revalidation) |

#### Architecture Requirements Coverage Map (11/11)

| Requirement ID | Description | Covered In Epic(s) |
| :--- | :--- | :--- |
| **ARCH-1** | Next.js 15 Monolith & Route Groups `(public)`, `(provider)`, `(admin)` | **Epic 1**, Epic 2, Epic 3, Epic 4, Epic 5, Epic 6 |
| **ARCH-2** | Supabase Backend in `ap-south-1` (Mumbai) | **Epic 1** |
| **ARCH-3** | Phone Auth Integration Spike Gate & Validation | **Epic 1**, Epic 2 |
| **ARCH-4** | Admin-Assisted Temp Password 24h Expiry Enforcement | Epic 2 (Login check), Epic 3 (Generation), **Epic 6** (Reset UI) |
| **ARCH-5** | PostgreSQL `rate_limit_buckets` Substrate (No Upstash in Phase 1) | **Epic 1** (DDL), Epic 2 (Registration), Epic 5 (Contact Clicks) |
| **ARCH-6** | Server-Only Secrets Boundary (`import 'server-only'`) & CI Scanning | **Epic 1** |
| **ARCH-7** | Column Protection Trigger (`fn_enforce_provider_column_protection`) | **Epic 1**, Epic 6 |
| **ARCH-8** | Public Read Projection View `public_providers` | **Epic 1**, Epic 4, Epic 5 |
| **ARCH-9** | Direct-to-Storage WebP Photo Upload Pipeline | **Epic 1** (Storage), Epic 2, Epic 6 |
| **ARCH-10** | Operational Lifecycle (Keep-Alive Cron, Backups, Pro Upgrade) | **Epic 7** |
| **ARCH-11** | Telegram Bot Non-Blocking Circuit Breaker (<2000ms timeout) | **Epic 3** |

#### Non-Functional Requirements Coverage Map (10/10)

| Requirement ID | Description | Covered In Epic(s) |
| :--- | :--- | :--- |
| **NFR-101** | Minimum 44px × 44px Touch Target Compliance | **Epic 1** (Tokens), Epic 2, Epic 3, Epic 4, Epic 5, Epic 7 (Audit) |
| **NFR-102** | Zero Hover Reliance (Complete Touchscreen Usability) | Epic 1, Epic 4, Epic 5 |
| **NFR-103** | Typography ≥ 16px & WCAG 2.1 AA Contrast (>4.5:1) | **Epic 1**, Epic 4, Epic 7 (Audit) |
| **NFR-104** | Standard Terminology ("Provider" / "Technician") | Epic 2, Epic 3, Epic 4, Epic 5, Epic 6 |
| **NFR-201** | Mobile Network Optimization (LCP < 2.5s on 3G/4G) | **Epic 4**, Epic 5, **Epic 7** (Network audit) |
| **NFR-202** | Client-Side WebP Compression (<1200px, <500KB) | **Epic 2**, Epic 5, Epic 6 |
| **NFR-301** | E.164 Phone Format Validation (`+94XXXXXXXXX`) | **Epic 1**, Epic 2, Epic 3, Epic 5 |
| **NFR-302** | Customer Privacy by Design (Salted SHA256 Deduplication, Zero PII) | **Epic 5** |
| **NFR-303** | PostgreSQL Rate Limiting & Turnstile Anti-Spam | Epic 2, Epic 3, Epic 5, **Epic 7** (Load testing) |
| **NFR-401** | Conversational English, LKR Currency, String Resource Isolation | Epic 1, Epic 2, Epic 4, Epic 5 |

#### UX Design Requirements Coverage Map (10/10)

| Requirement ID | Description | Covered In Epic(s) |
| :--- | :--- | :--- |
| **UX-DR1** | Design Tokens & Color Discipline (Base, Navy, Amber, Green) | **Epic 1** |
| **UX-DR2** | Wordmark Component (`Fix` Navy, `Near` Slate, Amber Dot) | **Epic 1** |
| **UX-DR3** | Area Selector Pill Component (`📍 Area: [Town] ▾` with cookie sync) | **Epic 4** |
| **UX-DR4** | 4-Step Provider Registration Wizard (Mobile-first, sessionStorage) | **Epic 2** |
| **UX-DR5** | Provider Summary Card Component (Badges, 3-photo strip, isolated CTA)| **Epic 4** |
| **UX-DR6** | WhatsApp Contact Bottom Sheet Modal (Swipe-dismiss, PII scrubbing) | **Epic 5** |
| **UX-DR7** | Zero-Results Empty State Component (Adjacent links, concierge CTA) | **Epic 4** |
| **UX-DR8** | Touch Target Floor (44px) & iOS Zoom Prevention (16px inputs) | **Epic 1**, **Epic 7** (Audit) |
| **UX-DR9** | Status Banner & Alert Primitives (`pending_approval`, Option A lockdown)| **Epic 2**, **Epic 6** |
| **UX-DR10** | Admin Review Card & 1-Tap Verification Modals | **Epic 3** |

---

## Approved Epic List & Gating

### Epic 1: Foundation and Platform Setup
Establish full-stack Next.js 15 monolith scaffolding, Supabase backend in `ap-south-1`, core DDL migrations for all 14 tables, security triggers (`fn_enforce_provider_column_protection`), RLS policies, `public_providers` view, pilot seed substrate with matching Auth users, CI secret scanning, and staging deployment.
- **Owner:** Shared / Dev Lead
- **Gating:** Foundation milestone. Must be 100% completed before any subsequent epic can begin.

### Epic 2: Provider Onboarding
Enable independent technicians and repair workshop owners to register free of charge with E.164 mobile number + password, complete a 4-step mobile wizard with `sessionStorage` draft safety, upload up to 10 work photos directly to Supabase Storage, and receive clear confirmation of their pending verification status.
- **Owner:** Developer B (`(provider)` route group)
- **Gating:** Requires **Epic 1**. Must be completed before Epic 3 active queue review.

### Epic 3: Admin Verification & Taxonomy Operations
Enable platform administrator (Dhanushka) to securely log in, receive instant Telegram bot alerts on provider submissions, triage pending and re-verification applications with 1-tap WhatsApp verification, review field diffs, approve/reject/suspend listings with cache revalidation, generate 24h temporary passwords, and manage launch taxonomy.
- **Owner:** Developer B (`(admin)` route group)
- **Gating:** Requires **Epic 2** (needs submitted applications in queue).

### Epic 4: Public Directory Discovery & Search
Enable local customers dealing with equipment breakdowns to immediately browse, search, and filter verified technicians across Negombo corridor with zero login barriers, URL-driven location with cookie persistence, 2-tier ranking engine, multi-facet filtering, sub-2.5s mobile LCP, and full SEO crawlability.
- **Owner:** Developer A (`(public)` route group)
- **Gating:** Requires **Epic 1** (operates on seed data). Can run in parallel with Epics 2 and 3.

### Epic 5: Provider Profiles & WhatsApp Contact Handoff
Enable customers to evaluate detailed technician credentials, repair specialties, upfront inspection fees, and responsive work photo galleries on dedicated profile pages, and smoothly initiate direct WhatsApp conversations via dynamic pre-filled deep links while preserving customer privacy and recording anonymous conversion metrics.
- **Owner:** Developer A (`(public)` route group)
- **Gating:** Requires **Epic 1** and **Epic 4**. Can run in parallel with Epics 2 and 3.

### Epic 6: Provider Self-Management & Security
Enable authenticated providers to log in, manage profile narrative, specialties, visiting coverage, and photos, submit rejected listings for re-review, handle mandatory temporary password resets, and enforce Option A re-verification lockdown when critical identity fields (phone, business name) are modified.
- **Owner:** Developer B (`(provider)` route group)
- **Gating:** Requires **Epic 2** (provider auth) and **Epic 3** (admin temporary password generation & rejection reasons).

### Epic 7: Launch Readiness & Operational Hardening
Execute comprehensive operational hardening prior to public marketing: Cloudflare Turnstile bot verification, PostgreSQL sliding-window rate limit load testing, simple admin metrics dashboard (contact clicks per provider/area, zero-result demand searches, active providers count), host image optimization usage check against free-tier limits, automated 3-day health keep-alive ping, scheduled weekly database and photo storage backups, Supabase Pro plan upgrade gate ($25/mo), WCAG 2.1 AA accessibility audit, mobile 3G/4G network audit, field verification with 15–25 real Negombo technicians, privacy policy & terms of use, provider-initiated account deletion & pause lifecycle, and operations runbook (backup admin, stale review queue SLA, platform upgrade roadmap).
- **Owner:** Shared / Dhanushka
- **Gating:** Requires Epics 1 through 6. Final gate before production traffic.

---


## Epic 1: Foundation and Platform Setup

Establish the full-stack repository scaffolding, database infrastructure, security primitives, and design system substrate so that parallel development across public, provider, and admin portals can proceed safely without divergence.
- **Owner:** Shared / Dev Lead (Foundation for Developer A & Developer B)
- **Dependencies:** None. Must be completed before Epics 2 through 7 can start.

### Story 1.1: Provision Supabase Project in ap-south-1 & Secrets Verification

As a system architect and developer,
I want a provisioned Supabase project in the ap-south-1 Mumbai region with validated environment configuration,
So that the application has a low-latency database and auth platform with strict credential isolation.

**Acceptance Criteria:**

**Given** a newly created Supabase project hosted in region `ap-south-1` (Mumbai),
**When** the project environment variables are defined per `.env.local.example` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`),
**Then** the application verifies active connectivity to Supabase using only the standard variable names without requiring AI agents or tools to inspect or log real `.env.local` files.
**And** `.gitignore` confirms `.env*` files (except `.env.local.example`) are uncommitted and excluded from version control.

### Story 1.2: Pre-Implementation Phone Authentication Integration Spike Gate

As a developer building provider authentication,
I want an isolated integration spike executed against the live Supabase project to determine the exact phone authentication pipeline,
So that the provider registration architecture and schema dependencies are definitively validated before building UI screens.

**Acceptance Criteria:**

**Given** the live Supabase project configured in Story 1.1,
**When** the automated spike test `tests/spikes/phone-auth.test.ts` executes,
**Then** it asserts whether `supabaseAdmin.auth.admin.createUser({ phone: e164_number, password: plain_password, phone_confirm: true })` and `supabase.auth.signInWithPassword({ phone: e164_number, password: plain_password })` succeed without configuring a commercial SMS gateway.
**And** if Supabase Cloud requires an SMS gateway toggle, the spike validates the synthetic internal email pattern `phone_digits + "@fixnear.invalid"` (reserved RFC 2606 `.invalid` domain; email sending disabled in Supabase Auth).
**And** the confirmed outcome (Direct Phone Auth vs Synthetic Email Fallback) is formally recorded as an architectural gate that Story 2.1 and subsequent auth stories must reference.

### Story 1.3: Next.js 15 Monolith Scaffolding, Layering Conventions & Design Tokens

As a frontend and backend developer,
I want a Next.js 15 App Router monolith with strict layering directories, TanStack Query, and Tailwind design tokens,
So that development adheres to predictable architecture boundaries across public, provider, and admin portals.

**Acceptance Criteria:**

**Given** the project workspace,
**When** the Next.js 15 App Router project is initialized with TypeScript and Tailwind CSS,
**Then** the five architectural layering directories are established: `src/types/`, `src/services/`, `src/actions/`, `src/hooks/`, and `src/components/`.
**And** any service executing privileged administrative operations is guarded with `import 'server-only'` at the top of the file.
**And** the route groups `(public)`, `(provider)`, and `(admin)` are created with separate layout files.
**And** `tailwind.config.ts` configures all design tokens from `DESIGN.md`: Canvas Base (`#F8F9FA`), Surface Raised (`#FFFFFF`), Surface Sunken (`#EDF0F2`), Primary Navy (`#0F2942`), Amber Accent (`#D97706`), WhatsApp Green (`#25D366`), and the `44px` minimum touch target utility (`min-h-[44px] min-w-[44px]`).
**And** TanStack Query client and React Query Provider are configured at the root to support client-side caching and mutations.

### Story 1.4: Shared Root Layout Shell & Wordmark Component

As a mobile visitor,
I want a clean, responsive application shell with an accessible geometric wordmark,
So that I experience immediate visual trust and rapid page rendering on mobile screens.

**Acceptance Criteria:**

**Given** the Next.js root layout (`src/app/layout.tsx`),
**When** a user accesses any portal,
**Then** the viewport meta tag enforces responsive mobile scaling (`width=device-width, initial-scale=1, maximum-scale=5`) and body typography defaults to 16px to prevent automatic iOS Safari input zoom.
**And** the geometric wordmark component (`src/components/ui/Wordmark.tsx`) renders `Fix` in primary navy (`#0F2942`), `Near` in slate-black (`#0F172A`), followed by an amber location dot (`#D97706`) adhering to `UX-DR2`.
**And** the wordmark functions as an accessible link navigating to the homepage (`/`) with `aria-label="FixNear Home"`.

### Story 1.5: Supabase Core DDL Migration, Security Triggers & Generated Types

As a platform engineer,
I want the relational schema, security triggers, RLS policies, and TypeScript types established in PostgreSQL,
So that data integrity, column protection, and audit histories are strictly enforced at the database layer.

**Acceptance Criteria:**

**Given** the Supabase PostgreSQL database from Story 1.1,
**When** migration `20261014000000_init_fixnear_schema.sql` runs,
**Then** all 14 core tables from `DATA-MODEL.md` are created: `providers` (including `requires_manual_repair BOOLEAN NOT NULL DEFAULT false` and `idx_providers_manual_repair`), `areas`, `provider_areas`, `categories`, `sub_services`, `provider_services`, `work_photos`, `listing_status_history`, `rejection_reasons`, `contact_events`, `zero_result_searches`, `admin_users`, `rate_limit_buckets`, and `phone_blocklist`.
**And** database trigger `fn_enforce_provider_column_protection` is installed, strictly blocking non-admin attempts to directly mutate protected columns: `status`, `is_verified`, `provider_type`, `slug`, `must_change_password`, `temp_password_expires_at`, `rejection_reason`, `submitted_at`, and `requires_manual_repair` with error code `P0001`.
**And** all provider-side and admin listing status transitions are strictly routed through PostgreSQL `SECURITY DEFINER` state machine functions (`fn_request_identity_reverification`, `fn_submit_provider_application`, `fn_resubmit_provider_application`, `fn_toggle_provider_listing_pause`) enforcing an explicit allowlist of permitted state transitions:
  - `draft` → `pending_approval` (initial submission via `fn_submit_provider_application`)
  - `pending_approval` → `approved` / `rejected` (admin only)
  - `approved` → `pending_reverification` (critical identity edit via `fn_request_identity_reverification`)
  - `approved` → `suspended` (admin only)
  - `approved` → `paused` (provider-initiated pause via `fn_toggle_provider_listing_pause(p_paused := TRUE)`; strictly allowed ONLY from `approved`)
  - `paused` → `approved` (provider-initiated resume via `fn_toggle_provider_listing_pause(p_paused := FALSE)`; strictly allowed ONLY from `paused`, refused if `suspended`)
  - `paused` → `suspended` (admin only)
  - `paused` CANNOT transition to `pending_reverification`: phone and business-name edits while `status = 'paused'` are strictly disabled in the UI with helper text *"Resume your listing first to edit critical contact details"*, and any direct invocation of `fn_request_identity_reverification` while `status = 'paused'` raises error `P0004` (must transition `paused → approved` before requesting re-verification).
  - `pending_reverification` → `approved` / `rejected` / `suspended` (admin only)
  - `rejected` → `pending_approval` (resubmission via `fn_resubmit_provider_application`, blocked if `is_permanently_rejected`)
  - `suspended` → `approved` (admin reinstatement only; providers can never unpause a suspended listing)
**And** for every `SECURITY DEFINER` RPC that accepts a provider ID (including `fn_anonymise_and_delete_provider_data`, `fn_toggle_provider_listing_pause`, `fn_request_identity_reverification`, `fn_resubmit_provider_application`, `fn_submit_provider_application`, and photo management RPCs):
  - Provider-authenticated RPCs (`fn_toggle_provider_listing_pause`, `fn_request_identity_reverification`, `fn_resubmit_provider_application`, `fn_submit_provider_application`, photo RPCs): invoked strictly using the **user-scoped client** (`src/lib/supabase/server.ts` via `@supabase/ssr`), validating `auth.uid() IS NOT NULL AND auth.uid() = p_provider_id` inside the function body (raising PostgreSQL exception `P0001` / `Unauthorized` if mismatched), with `p_provider_id` passed strictly from the verified session (`session.user.id`).
  - Administrative and deletion RPCs (`fn_approve_identity_reverification`, `fn_anonymise_and_delete_provider_data`): invoked strictly using the **service-role client** (`src/lib/supabase/admin.ts`), with permissions locked down via `REVOKE EXECUTE ON FUNCTION ... FROM PUBLIC, anon, authenticated; GRANT EXECUTE ON FUNCTION ... TO service_role;` and `p_provider_id` supplied from the authenticated admin action or verified deletion session.
**And** **Standing `search_path` Security Invariant:** Every `SECURITY DEFINER` function and trigger in PostgreSQL migrations must explicitly pin its search path (`SET search_path = public`) in the function definition header (`CREATE OR REPLACE FUNCTION ... SECURITY DEFINER SET search_path = public AS $$ ... $$`), mitigating schema search-path hijacking attacks.
**And** database trigger `fn_log_listing_status_history` is installed, recording all listing status transitions in `listing_status_history`.
**And** Row-Level Security (RLS) is enabled across all 14 tables per the RLS Policy Matrix in `DATA-MODEL.md` (with `phone_blocklist` and `rate_limit_buckets` strictly locked down with no policies for anon or authenticated, accessible only to service-role).
**And** TypeScript database definitions are generated into `src/lib/db/types.ts` via the Supabase CLI.
**And** automated integration test `tests/integration/column-protection.test.ts` passes, asserting that unprivileged users cannot modify protected provider columns while service-role callers succeed.

### Story 1.6: Public Projection View & Database Client Singletons

As a developer building public and authenticated routes,
I want the `public_providers` view and typed Supabase client singletons with an anonymous projection security test,
So that public directory reads are pre-aggregated and internal provider PII is never exposed to the public.

**Acceptance Criteria:**

**Given** the database schema from Story 1.5,
**When** migration `20261014000001_create_public_view.sql` runs,
**Then** the `public_providers` view is created, pre-aggregating `areas_served`, `sub_services` (with category metadata), and `photos` into JSONB arrays with `photo_count`, filtering strictly for `status = 'approved' AND is_verified = true AND requires_manual_repair = false` ('paused' listings, 'suspended' listings, and listings flagged for manual repair are strictly omitted from the view).
**And** Supabase client helpers are instantiated: `src/lib/supabase/client.ts` (browser anon client), `src/lib/supabase/server.ts` (SSR server client using `@supabase/ssr`), and `src/lib/supabase/admin.ts` (service-role client with `import 'server-only'`).
**And** Row-Level Security (RLS) policies enforce that anonymous visitors can read only `status = 'approved' AND is_verified = true` records; authenticated providers can read and update their own profile when `status = 'paused'`, but all provider writes are blocked when `status = 'suspended'`.
**And** automated integration test `tests/integration/public-projection.test.ts` asserts that an anonymous client querying `public_providers` cannot read unapproved, paused, suspended, or manual-repair-flagged providers, rejection reasons, or internal administrative metadata, and is denied direct `SELECT` access to the raw `providers` table.

### Story 1.7: Pilot Seed Data Substrate with Matching Auth Users & Photo Placeholders

As Developer A and Developer B,
I want seed data representing the Negombo pilot cluster loaded with corresponding Auth identities and storage placeholders,
So that public search and admin review features can be developed immediately against realistic test data.

**Acceptance Criteria:**

**Given** the database schema and public view from Stories 1.5 and 1.6,
**When** the seed script runs using the Supabase Service Role key (bypassing the column protection trigger),
**Then** it seeds the 4 pilot towns: `Negombo`, `Kochchikade`, `Katunayake`, and `Seeduwa`.
**And** it seeds the 4 primary categories (`Home Appliances`, `Vehicles`, `Industrial Machinery`, `Electronics`) and associated sub-services.
**And** it creates matching `auth.users` records and inserts ~20 fake approved, verified provider listings across diverse trades with realistic descriptions, base areas, visiting modes, fees, and valid placeholder images in the `provider-photos` storage bucket.
**And** it seeds standard rejection reasons in `rejection_reasons`.
**And** the platform admin user record in `admin_users` and matching `auth.users` credentials are created and managed privately by Dhanushka in Supabase; credentials are NEVER hardcoded in seed scripts, committed to git, or read by AI agents.

### Story 1.8: Staging Deployment, Health Check Endpoint & CI Secret Scanning

As the platform owner,
I want a working deployment on a staging URL with an active health check endpoint and automated CI secret scanning,
So that we have a verified continuous deployment pipeline and zero risk of committed secrets.

**Acceptance Criteria:**

**Given** the Next.js application codebase,
**When** `src/app/api/health/route.ts` is invoked via `GET`,
**Then** it executes an active PostgreSQL query (`SELECT 1`) and returns HTTP 200 `{ status: "ok", timestamp: string }`.
**And** the application builds cleanly with `npm run build` and deploys to a staging hosting environment on Vercel Hobby (explicitly designated for staging and non-commercial pilot only).
**And** the staging environment connects to a dedicated staging Supabase project (or distinct dev/staging project keys) completely isolated from production.
**And** a continuous integration workflow (`.github/workflows/ci.yml`) runs linting, type-checking, integration tests, and automated secret scanning on every pull request.

---

## Epic 2: Provider Onboarding

Enable independent technicians and repair workshop owners to easily register free of charge with mobile number and password, complete a mobile-optimized 4-step onboarding wizard, directly upload past work photos, and receive clear confirmation of their pending verification status.
- **Owner:** Developer B (`(provider)` route group)
- **Dependencies:** Requires **Epic 1** (Supabase schema, auth spike outcome, and storage bucket setup).

### Story 2.1: Provider Authentication Pipeline, Rate Limiting & Account Creation Timing

As a repair technician,
I want to register an account using my mobile number and a secure password protected against spam,
So that I can claim and manage my business profile without requiring an email address.

**Acceptance Criteria:**

**Given** the architectural outcome recorded by the Story 1.2 Phone Auth Spike Gate,
**When** a provider submits their mobile number (E.164 format e.g. `+94771234567`) and password (minimum 8 characters) on Step 1 of registration,
**Then** Server Action `registerProviderAction` verifies the Cloudflare Turnstile bot token and asserts rate limiting in PostgreSQL `rate_limit_buckets` (max 3 registrations per hour per IP).
**And** prior to creating any Supabase Auth or database record, the action normalizes the phone number to E.164 (`normalized_phone_number`), computes `phone_hash = crypto.createHmac('sha256', process.env.PHONE_BLOCKLIST_SECRET).update(normalized_phone_number).digest('hex')` using a server-only environment variable secret (never stored in the database), and queries `phone_blocklist`; if a match is found, registration is immediately aborted and returns a clear, non-leaking error: *"This phone number cannot be registered on FixNear. Please contact FixNear Admin on WhatsApp."*
**And** the action creates an authenticated user in Supabase Auth using the validated strategy (direct phone auth or synthetic email `[digits]@fixnear.invalid` [reserved RFC 2606 `.invalid` domain; email sending disabled in Supabase Auth]) with `phone_confirm: true`.
**And** the action atomically creates a matching record in `providers` with `status = 'pending_approval'` and `is_verified = false`, establishing the authenticated session (`auth.uid()`) required for subsequent Step 4 photo uploads.
**And** if registration is abandoned before wizard completion, the record remains with `is_verified = false`, ensuring it is strictly excluded from `public_providers` and public search, while being flagged as an incomplete draft in the admin queue.
**And** if the submitted phone number is already registered, the action returns a generic, privacy-preserving notification tailored to the existing listing status without exposing other users' data:
  - `approved`: *"An account with this phone number already exists. Please log in."*
  - `pending_approval`: *"An application for this phone number is currently under review by FixNear Admin. Please check back shortly or reach out on WhatsApp."*
  - `pending_reverification`: *"This account is currently undergoing re-verification by Admin. Please log in to check your status."*
  - `suspended`: *"This account is currently suspended. Please contact FixNear Admin on WhatsApp for assistance."*
  - `rejected`: *"A previous application for this number was not approved. Please log in to view feedback and resubmit your details."*

### Story 2.2: 4-Step Registration Wizard: Credentials & Profile Identity

As a repair technician or workshop owner,
I want to enter my trade credentials, personal name, workshop name, and base location in a mobile wizard with auto-saved progress,
So that I can easily complete registration on my phone without losing entered data if interrupted.

**Acceptance Criteria:**

**Given** a visitor accessing `/register`,
**When** they begin the onboarding wizard,
**Then** Step 1 captures Mobile Number (`+94` prefix formatted) and Password with inline validation, and Step 2 captures Provider Type (`individual` vs `business`), Personal Name (required), Business Name (required if business, optional if individual), Base Town dropdown (`Negombo`, `Kochchikade`, `Katunayake`, `Seeduwa`), Workshop Address (optional), and Short Bio Description (required).
**And** the wizard displays an explicit notice next to the WhatsApp Mobile Number input: *"Note: Your WhatsApp mobile number will be visible to public customers on your profile so they can contact you directly for repairs."*
**And** the wizard displays a prominent notice next to Provider Type: *"Note: Provider Type (Individual Technician vs Repair Business) cannot be changed after registration."*
**And** form inputs (excluding passwords) automatically synchronize to browser `sessionStorage` so that accidental tab reloads restore form progress seamlessly; passwords are kept in component memory for authentication submission and are NEVER serialized or stored in `sessionStorage`.
**And** interactive form inputs maintain a minimum 44px × 44px touch target with 16px font sizes to eliminate iOS viewport zoom.

### Story 2.3: 4-Step Registration Wizard: Services, Visiting Modes & Fees

As a repair provider,
I want to select my equipment specialties, service delivery mode, travel coverage towns, and visiting fees,
So that customers know exactly what machines I repair and whether I visit their neighborhood.

**Acceptance Criteria:**

**Given** the provider is on Step 3 of the onboarding wizard (`/register`),
**When** they configure their service profile,
**Then** they can select their primary category and check multiple sub-service tags via accessible multi-select chips.
**And** they can designate Service Mode as `comes_to_customer` (Visits you), `customer_comes_to_shop` (Visit workshop), or `both`.
**And** if `comes_to_customer` or `both` is selected, they must select at least one launch town in "Areas Served" via multi-select chips.
**And** they designate their Pricing Model (`fixed`, `starting_from`, `varies_by_job`) and optionally declare an upfront Visiting / Inspection Fee in Sri Lankan Rupees (`LKR`).

### Story 2.4: Direct-to-Storage Work Photo Uploader & Server Verification Pipeline

As an authenticated provider in the registration wizard,
I want to upload up to 10 photos of my past repair jobs directly from my mobile browser to Supabase Storage,
So that customers see visual proof of my workmanship without overloading the application server.

**Acceptance Criteria:**

**Given** the provider has an active authenticated session established from Step 1,
**When** they select up to 10 images from their camera or mobile photo gallery on Step 4,
**Then** client uploader (`src/components/provider/PhotoUploader.tsx`) validates MIME types (`image/jpeg`, `image/png`, `image/webp`), enforces a 10MB maximum input size, and compresses images to responsive WebP (<1200px, <500KB) with visual upload progress indicators.
**And** the browser uploads the image directly to Supabase Storage bucket `provider-photos` under `${auth.uid()}/${photoId}.webp` (satisfying Storage RLS: folder name matches caller UID).
**And** Server Action `recordWorkPhotoAction` verifies caller authentication, validates path regex `^[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}\.webp$`, verifies object existence via storage admin API, and inserts the record into `work_photos`.
**And** the action executes an atomic count check (`SELECT COUNT(*) FROM work_photos WHERE provider_id = :id`) and strictly rejects repeated direct calls if 10 photos already exist.

### Story 2.5: Review Summary, Submission & Pending Verification Screen

As a newly registered provider,
I want to review my complete listing summary and submit it for admin verification,
So that I know my application has been received and understand what happens next.

**Acceptance Criteria:**

**Given** all 4 steps of the onboarding wizard are completed,
**When** the provider views the review summary screen and taps "Submit Listing for Verification",
**Then** Server Action `submitProviderApplicationAction` invokes PostgreSQL `SECURITY DEFINER` RPC `fn_submit_provider_application(p_provider_id UUID)` using the **user-scoped client** (`src/lib/supabase/server.ts`), passing the provider ID originating strictly from the verified session (`session.user.id`).
**And** inside `fn_submit_provider_application`, the function strictly validates `auth.uid() IS NOT NULL AND auth.uid() = p_provider_id` (raising PostgreSQL error `P0001` / `Unauthorized` if mismatched), then transitions `status` from `'draft'` to `'pending_approval'`, sets `is_verified = false`, and records `submitted_at = NOW()`.
**And** the action triggers an asynchronous notification to the configured admin Telegram channel (`Story 3.5`); if the Telegram dispatch fails or times out, the registration transaction still succeeds, and the application is confirmed in the database.
**And** the browser redirects to `/register/pending`, displaying the amber status banner: *"Listing Submitted — Pending Verification. FixNear Admin will reach out via WhatsApp shortly (target review time: within 12 hours)."*
**And** unapproved listings are confirmed to be strictly inaccessible on public search and direct profile URLs.

### Story 2.6: Provider Authentication Login, Forgot Password Support & Reset Redirect Hook

As an existing repair provider,
I want to log in with my registered mobile number and password, or get WhatsApp support if I forgot my credentials,
So that I can access my listing dashboard and be guided through mandatory password resets if using temporary credentials.

**Acceptance Criteria:**

**Given** a provider navigating to `/provider/login`,
**When** they submit their registered E.164 phone number and password,
**Then** `loginProviderAction` validates credentials via `supabase.auth.signInWithPassword` and enforces rate limiting in PostgreSQL `rate_limit_buckets` (max 5 failed attempts per 15 minutes per IP).
**And** upon credential validation, the action inspects `providers.must_change_password`:
  - If `must_change_password = true` and `NOW() > temp_password_expires_at`, the action calls `supabase.auth.signOut()` and rejects the login with an explicit error: *"Your temporary password has expired. Please contact FixNear on WhatsApp for a new one."*
  - If `must_change_password = true` and `NOW() <= temp_password_expires_at`, the session is established and the user is redirected to `/provider/reset-password` with protected route middleware restricting access to any other page until a new password is saved.
  - If `must_change_password = false`, the user is redirected to `/provider/dashboard`.
**And** if a rejected provider logs in, their dashboard displays the admin rejection reason stored in `rejection_reason` alongside an edit & resubmit CTA (resubmission workflow implemented in Story 6.5).
**And** the login screen renders a prominent link: *"Forgot Password?"*, which opens WhatsApp to FixNear support (`NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER`) with pre-filled message: `"Hello FixNear, I need help resetting my password for my provider account [Phone Number]."`.

---

## Epic 3: Admin Verification & Taxonomy Operations

Enable the platform administrator (Dhanushka) to securely authenticate, receive real-time Telegram alerts for new applications, triage submissions via a mobile-first review queue with 1-tap WhatsApp verification, approve/reject/suspend listings with structured feedback, and manage service categories and launch areas.
- **Owner:** Developer B (`(admin)` route group)
- **Dependencies:** Requires **Epic 2** (needs submitted provider applications in the queue).

### Story 3.1: Admin Authentication, Route Guard & Brute-Force Rate Limiting

As the platform administrator (Dhanushka),
I want to log into the admin portal using my email and password with brute-force protection,
So that operational administrative functions are strictly protected from unauthorized access.

**Acceptance Criteria:**

**Given** the admin login screen at `/admin/login`,
**When** admin credentials (email and password) are submitted,
**Then** the Server Action validates the session against Supabase Auth and asserts that caller ID exists in the `admin_users` table.
**And** login attempts are rate-limited via PostgreSQL `rate_limit_buckets` (max 5 failed attempts per 15 minutes per IP).
**And** Next.js middleware and layout guards enforce that all routes under `/admin/dashboard/*` strictly require an authenticated session present in `admin_users`, redirecting unauthenticated or non-admin visitors to `/admin/login`.
**And** every admin Server Action executes an explicit server-side authorization check asserting `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())`, with an automated integration test verifying that a non-admin authenticated caller directly invoking any admin Server Action is rejected.

### Story 3.2: Mobile Review Queue & Incomplete Listing Detection

As the platform administrator,
I want a mobile-optimized review queue displaying all pending provider applications sorted chronologically,
So that I can quickly inspect technician credentials, workshop photos, and service details on my phone.

**Acceptance Criteria:**

**Given** an authenticated admin accessing `/admin/dashboard`,
**When** the review queue loads,
**Then** it queries all real applications where `status IN ('pending_approval', 'pending_reverification') AND submitted_at IS NOT NULL` sorted chronologically (`submitted_at ASC`).
**And** each card displays: submission timestamp, Provider Type, Personal Name, Business Name, WhatsApp Number, Base Town, Service Mode, Visiting Fee, Sub-services list, and an expandable thumbnail grid of uploaded work photos.
**And** listings where `submitted_at IS NULL` (abandoned wizard drafts) are completely excluded from the active decision queue and viewable only under an isolated "Incomplete Drafts" management tab.
**And** the admin dashboard includes a "Recently Edited" filter tab displaying all approved providers who updated their bio, photos, or service details within the last 7 days (sorted by `providers.last_edited_at DESC`) for ongoing administrative review.
**And** the review queue operates against a 12-hour turnaround target per the PRD; if any submission in `pending_approval` or `pending_reverification` has `submitted_at < NOW() - INTERVAL '48 hours'`, it is highlighted with an urgent amber/crimson badge, and the scheduled queue monitor triggers a stale-queue alert to both administrators (`Story 3.5`, `Story 7.12`).
**And** the admin listings view provides distinct status filter tabs for 'Approved', 'Paused' (provider self-managed), 'Suspended' (admin-imposed), and 'Rejected', ensuring clear operational separation between technician holiday pauses and administrative disciplinary suspensions.
**And** the admin listings view provides a dedicated "Needs manual repair" filter tab displaying all provider records where `requires_manual_repair = true` (sorted by `updated_at DESC`), with an administrative action `clearManualRepairAction(providerId)` allowing an admin to clear the flag (`requires_manual_repair = false`) after resolving out-of-sync credentials or schema state.

### Story 3.3: 1-Tap WhatsApp Verification Tooling

As the platform administrator,
I want a 1-tap action on each review card to launch a pre-formatted WhatsApp verification conversation with the applicant,
So that I can verify technician responsiveness and workshop legitimacy in seconds.

**Acceptance Criteria:**

**Given** a pending provider card in the review queue,
**When** the admin taps the green "Verify on WhatsApp" button,
**Then** the browser launches WhatsApp (via `wa.me/<E164_PHONE>?text=...`) targeting the applicant's registered phone number.
**And** the URL includes a pre-filled greeting: `"Hello [Provider Name], this is Dhanushka from FixNear reviewing your listing application for [Business Name]. Are you available for repairs in [Base Area]?"`.
**And** the link correctly URL-encodes spaces and special characters and opens in WhatsApp without navigating the admin away from the dashboard tab.

### Story 3.4: Listing Approval, Re-verification Diff Review, Reinstatement & Cache Revalidation

As the platform administrator,
I want to approve, reject with structured feedback, suspend, or reinstate listings while reviewing exact field diffs on re-verifications,
So that the public marketplace maintains high trust, zero spam, complete audit logging, and instantaneous cache synchronization.

**Acceptance Criteria:**

**Given** an application card in the admin review queue,
**When** the listing has `status = 'pending_reverification'`,
**Then** the card renders a prominent visual diff highlighting the modified identity fields by comparing the live verified values (`providers.phone_number`, `providers.business_name`) against the unverified staged values (`providers.pending_phone_number`, `providers.pending_business_name`).
**And** when admin taps "Approve" on an initial application, the Server Action sets `status = 'approved'`, `is_verified = true`, and `rejection_reason = NULL`, publishing the listing immediately to `public_providers`.
**And** when admin taps "Approve" on an identity re-verification request (`status = 'pending_reverification'`):
  - **Order of Operations & Supabase Auth First:** The Server Action executes updates in strict sequential order: Supabase Auth credentials first, then PostgreSQL database promotion:
    1. **Step 1 — Update Supabase Auth First:** The Server Action calls the Supabase Auth Admin API using `supabaseAdmin.auth.admin.updateUserById(provider_id, authAttributes)`.
       - If the provider changed their phone number, `authAttributes.phone = pending_phone_number`.
       - **Synthetic Email Note:** If the auth spike in `Story 1.2` selected the synthetic email pattern (`<phone>@fixnear.invalid` [reserved RFC 2606 `.invalid` domain; email sending disabled in Supabase Auth]), `authAttributes.email = `${normalized_pending_phone}@fixnear.invalid`` must be updated simultaneously in Supabase Auth to keep authentication identifiers in lockstep.
       - **Auth Failure Handling:** If updating Supabase Auth fails (e.g., the new phone number or synthetic email already exists in `auth.users`, API rate limit, or network failure), the Server Action immediately halts without executing any database mutations. The listing remains in `status = 'pending_reverification'` with `pending_phone_number` preserved, and an actionable error is returned to the Admin: *"Supabase Auth credential update failed: [error message]. Database promotion aborted; listing remains under review."*
    2. **Step 2 — Database Promotion via SECURITY DEFINER RPC:** Only upon confirmed success from Supabase Auth, the Server Action invokes PostgreSQL `SECURITY DEFINER` RPC `fn_approve_identity_reverification(p_provider_id UUID)` using the **service-role client** (`src/lib/supabase/admin.ts`):
       - **RPC Permissions:** Permissions are strictly locked down: `REVOKE EXECUTE ON FUNCTION fn_approve_identity_reverification FROM PUBLIC, anon, authenticated; GRANT EXECUTE ON FUNCTION fn_approve_identity_reverification TO service_role;`. The `p_provider_id` argument is supplied directly by the verified administrator session in the Server Action.
       - Inside an atomic database transaction:
         - Promotes staged values to live columns: sets `phone_number = COALESCE(pending_phone_number, phone_number)` and `business_name = COALESCE(pending_business_name, business_name)`.
         - Resets staging columns: `pending_phone_number = NULL` and `pending_business_name = NULL`.
         - Sets `status = 'approved'`, `is_verified = true`, and `rejection_reason = NULL`.
    3. **Step 3 — Database Failure Handling & Auth Compensatory Rollback:** If the database transaction fails (e.g., PostgreSQL error code `23505` from unique constraint `uq_providers_phone_number` or connection error):
       - The Server Action catches the exception and immediately triggers compensatory rollback in Supabase Auth via `supabaseAdmin.auth.admin.updateUserById(provider_id, { phone: old_phone_number, ...(prior synthetic email) })` to reinstate the prior credentials.
       - Transitions the listing to `status = 'suspended'` and notifies the Admin: *"Approval collision / database promotion failure: phone number is already registered to another active provider in the database. Supabase Auth credentials rolled back and listing moved to suspended for manual resolution."*
       - **Auth Rollback Failure Handling:** If the compensatory Auth rollback itself fails (e.g., Supabase Auth API failure or timeout), the Server Action logs the critical error with complete diagnostic context (`provider_id`, previous credentials, failed new credentials, database error, rollback error), dispatches an urgent critical alert to **both administrators** (primary admin Dhanushka and backup administrator via Telegram/monitoring), sets `requires_manual_repair = true` on the `providers` record, and halts automated operations on the listing until manual reconciliation.
**And** when admin taps "Reject" on an initial application, a modal displays the standard reasons matching seed data (`unreachable_whatsapp`, `suspicious_photos`, `outside_launch_area`, `incomplete_details`) plus an optional custom note; submitting updates `status = 'rejected'` and records `rejection_reason`.
**And** when rejecting an identity re-verification request (`status = 'pending_reverification'`), admin can choose to either keep the listing hidden under `status = 'rejected'` or `'suspended'`, OR revert to the prior verified identity:
  - If admin chooses to reject/suspend: the action clears `pending_phone_number = NULL` and `pending_business_name = NULL`, sets `status = 'rejected'` or `'suspended'`, and records `rejection_reason`.
  - If admin chooses to revert to prior verified identity: because live `phone_number` and `business_name` were preserved intact in their primary columns during re-verification staging, the action simply resets `pending_phone_number = NULL` and `pending_business_name = NULL`, reinstating the listing to `status = 'approved'` and `is_verified = true`. If in any edge case a revert restores an old phone number from `listing_status_history`, the action relies on PostgreSQL unique constraint `uq_providers_phone_number`, catches error `23505` if a collision occurs, sets `status = 'suspended'`, and alerts the admin.
**And** when viewing an active approved provider, admin can tap "Suspend", immediately setting `status = 'suspended'` and `is_verified = false`, removing it from the public directory.
**And** when viewing a suspended listing, admin can tap "Reinstate Listing", transitioning `status` back to `'approved'` and setting `is_verified = true`.
**And** all status transitions are automatically recorded into `listing_status_history` via database trigger `fn_log_listing_status_history`.
**And** every moderation change (approve, reject, suspend, reinstate, or transition to pending_reverification) executes Next.js cache revalidation via `revalidatePath('/[area]', 'page')`, `revalidatePath('/[area]/[service]', 'page')`, `revalidatePath('/providers/[area]/[slug]', 'page')`, `revalidatePath('/sitemap.xml')`, and `revalidateTag('public_providers')`, guaranteeing that suspended or unverified listings are evicted immediately from Edge and CDN caches and never remain visible to public visitors.
**And** an automated integration test `tests/integration/cache-invalidation.test.ts` asserts that suspending an approved provider immediately purges the cached public response and returns HTTP 404 on direct profile requests.

### Story 3.5: Instant Telegram Application Alerts with Circuit Breaker

As the platform administrator,
I want an instant notification sent to my Telegram when a real provider application is submitted,
So that I can quickly review new applications without constantly polling the dashboard.

**Acceptance Criteria:**

**Given** a provider completes registration submission with `submitted_at = NOW()` (`Story 2.5`),
**When** the submission action triggers the Telegram notification,
**Then** the application asynchronously dispatches a formatted alert to the configured admin Telegram channel.
**And** the alert text includes: technician name, trade specialty, base town, phone number, and a direct link to `/admin/dashboard`.
**And** the Telegram dispatcher in `src/lib/utils/telegram.ts` is wrapped in a non-blocking `try/catch` with a 2000ms abort controller timeout, guaranteeing that Telegram API latency or outages never fail or roll back the provider's registration transaction.
**And** the Telegram alert pipeline also handles stale-queue escalation: if the automated queue monitor detects any application pending review past 48 hours, it dispatches an urgent reminder with direct review links to the notification channels of both administrators (primary and secondary/backup).

### Story 3.6: Managed Taxonomy & Launch Areas Safe Deactivation Editor

As the platform administrator,
I want an administrative interface to manage categories, sub-services, and active pilot launch towns with soft deactivation,
So that I can expand service offerings and add new towns without breaking existing provider listings.

**Acceptance Criteria:**

**Given** an authenticated admin navigating to `/admin/dashboard/taxonomy`,
**When** the taxonomy editor renders,
**Then** the admin can view, create, edit, reorder (`sort_order`), and toggle active status (`is_active = false`) for Primary Categories, Sub-services, and Launch Areas.
**And** soft deactivation (`is_active = false`) is strictly preferred over hard deletion; deactivating a category, sub-service, or area immediately removes it from public search filters and new registration forms, but NEVER breaks, deletes, or invalidates existing provider listings linked to it.
**And** existing approved providers linked to a deactivated sub-service continue to display their specialty badges on their profiles without data loss.
**And** the admin interface provides a Blocklist Management view where administrators can view all blocked phone hashes, timestamps, and reasons from `phone_blocklist`, with an action invoking Server Action `removeBlocklistEntryAction(p_blocklist_id UUID)` to safely unblock a phone number entry upon approved administrative review.

### Story 3.7: Admin-Assisted Temporary Password Generation & Credential Hygiene

As the platform administrator,
I want to generate a secure temporary password for a provider who forgot their credentials and ping them on WhatsApp,
So that verified technicians can regain access to their accounts without automated SMS gateway overhead.

**Acceptance Criteria:**

**Given** an admin viewing a provider profile in `/admin/dashboard`,
**When** the admin taps "Generate Temporary Password",
**Then** Server Action `generateTempPasswordAction` verifies admin authorization, generates a cryptographically secure random temporary password, updates the user in Supabase Auth via `admin.updateUserById`, and sets `must_change_password = true` and `temp_password_expires_at = NOW() + INTERVAL '24 hours'` on the `providers` record.
**And** the temporary password is displayed in the admin UI for 1-tap copying/messaging, but is NEVER written to server logs, application telemetry, or `listing_status_history.reason` (which records strictly `"Temporary password generated by admin [admin_id]"` without credentials).
**And** the dashboard opens a 1-tap WhatsApp link pre-filled with the temporary credentials and expiration notice directed to the provider's registered phone number.
**And** the provider-side mandatory password change screen and permanent credential update are owned and handled by Epic 6 (Story 6.6).

---

## Epic 4: Public Directory Discovery & Search

Enable local customers dealing with equipment breakdowns to immediately browse, search, and filter verified repair technicians and workshops across the Negombo corridor with zero login barriers, URL-driven location with cookie persistence, 2-tier ranking engine, multi-facet filtering, sub-2.5s mobile LCP, and full SEO crawlability.
- **Owner:** Developer A (`(public)` route group)
- **Dependencies:** Requires **Epic 1** (runs immediately on Epic 1 seed data with ~20 approved providers). Can run in parallel with Epics 2 and 3.

### Story 4.1: Public Homepage & Persistent Area Routing with Server Cookie

As a local customer with a broken appliance,
I want to visit FixNear and have my neighborhood pre-selected via clean URL routing and server-readable cookies without logging in,
So that all directory listings are instantly tailored to my town without hydration mismatch or visual flicker.

**Acceptance Criteria:**

**Given** an unauthenticated visitor accessing the root `/` or `/{area}`,
**When** the page renders server-side,
**Then** the entire homepage loads without displaying any login or registration prompt (`FR-101`).
**And** the URL path `/{area}` is the single source of truth for location.
**And** root route `/` inspects the server-readable cookie `fixnear_area`:
  - If cookie is set with a valid active area, redirects immediately via HTTP 307 / server-side redirect to `/{cookie_area}`.
  - If cookie is missing or invalid, defaults to redirecting to `/negombo` and sets `fixnear_area=negombo` (`Path=/; SameSite=Lax; Max-Age=2592000`).
**And** root redirect executes server-side before HTML hydration, guaranteeing zero client-side layout shift, content flashing, or hydration mismatch.
**And** a centralized reserved-slug array is enforced: `RESERVED_SLUGS = ['providers', 'admin', 'register', 'provider', 'login', 'api', 'sitemap.xml', 'robots.txt']`.
**And** if a visitor navigates to an unrecognized or inactive area slug (not matching any active town in `areas` where `is_active = true` and not in `RESERVED_SLUGS`), the server invokes Next.js `notFound()`, returning a real HTTP 404 response.
**And** the sticky header renders the persistent Area Selector Pill (`📍 Area: [Town] ▾`) (`UX-DR3`), opening an accessible dropdown of active launch towns (`Negombo`, `Kochchikade`, `Katunayake`, `Seeduwa`); selecting a new town sets the `fixnear_area` cookie and navigates to `/{new-town}` while preserving active sub-service filters.

### Story 4.2: Category Grid & Sub-Service Tag Navigation

As a customer looking for machinery repairs,
I want to view the primary repair categories and expand them into specific machine tags,
So that I can quickly narrow down to the exact equipment that broke down.

**Acceptance Criteria:**

**Given** the homepage or area directory view (`/{area}`),
**When** the category section renders,
**Then** it displays visual cards for the 4 primary categories (`Home Appliances`, `Vehicles`, `Industrial Machinery`, `Electronics`) using Lucide icons (`UX-DR1`, `UX-DR2`).
**And** tapping any primary category card expands to display its active sub-service chips (e.g. *Refrigerator / Freezer Repair*, *Washing Machine Repair*, *Motorcycle & Scooter Repair*).
**And** tapping any sub-service tag navigates the customer to the multi-facet results page `/{area}/{sub-service-slug}`.

### Story 4.3: Multi-Facet Filter Bar & Canonical Indexability Rules

As a customer searching for repair services,
I want to filter results by sub-service specialties and visiting service modes with canonical URL structure,
So that I find technicians who either come to my home or have a workshop I can visit without search engines indexing redundant permutations.

**Acceptance Criteria:**

**Given** a results directory page at `/{area}/{service-slug}`,
**When** the filter bar renders above search results,
**Then** it displays the active town pill, sub-service multi-select check chips, and Service Mode toggle chips: `All`, `Visits your location` (`comes_to_customer`), and `Has physical workshop` (`customer_comes_to_shop`).
**And** all active filter selections synchronize to URL search parameters (e.g. `?mode=comes_to_customer&sub=refrigerator-repair`), supporting direct sharing and back/forward navigation.
**And** indexability rules are strictly enforced:
  - Clean service paths (`/{area}/{service-slug}`) are fully indexable by search engines with a self-referencing canonical tag (`<link rel="canonical" href="https://fixnear.lk/{area}/{service-slug}">`).
  - Filtered query-string pages (e.g. `?mode=...` or `?sub=...`) specify a canonical link pointing to the clean base page `https://fixnear.lk/{area}/{service-slug}` to consolidate ranking authority.
  - Parameter combinations resulting in multi-filter permutations render `<meta name="robots" content="noindex, follow">` to prevent crawl budget waste and duplicate content indexation.
**And** filter chips enforce minimum 44px × 44px touch targets with instant visual state feedback without hover dependency (`NFR-101`, `NFR-102`).

### Story 4.4: 2-Tier Ranking Engine, Result Limits & Provider Summary Cards

As a customer evaluating local technicians,
I want search results to rank nearby providers first with verified badges, visiting charges, and photo thumbnails,
So that I can quickly compare trustworthy repairers and contact them directly.

**Acceptance Criteria:**

**Given** a customer search for an area and sub-service,
**When** the React Server Component executes the ranking query against `public_providers` (filtering strictly for `status = 'approved' AND is_verified = true AND requires_manual_repair = false`),
**Then** results are partitioned into the 2-tier hierarchy:
  - **Tier 1 (In-Area Base Workshop):** Providers whose physical base workshop is in the selected area (`is_base_area = true`).
  - **Tier 2 (Visiting Coverage):** Providers whose base workshop is outside the selected area, but whose `service_mode` includes `comes_to_customer` and whose `areas_served` includes the selected area, displaying the badge: *"Based in [Base Area], visits [Selected Area]"*.
  - Providers configured strictly as `customer_comes_to_shop` NEVER appear in Tier 2 cross-area results.
**And** when the "Has physical workshop" (`customer_comes_to_shop`) filter is active, Tier 2 visiting providers are completely hidden from results, displaying strictly Tier 1 listings with physical workshop premises in the selected area.
**And** within both Tier 1 and Tier 2, listings with work photos (`photo_count > 0`) rank strictly above text-only listings (`photo_count = 0`), with newest approved listing as tie-breaker (`created_at DESC`).
**And** the query enforces a result pagination limit of 20 providers per page (`limit: 20`, `offset: page * 20`) with accessible pagination controls.
**And** each Provider Summary Card (`UX-DR5`) displays: Business/Personal Name, Verified Trust Badge (`#D97706`), Base Area, Visiting Tag (if Tier 2), Price Type & Visiting Fee in LKR, Service Mode icon, thumbnail strip of up to 3 work photos, and a prominent green WhatsApp CTA button.
**And** clicking the card navigates to `/providers/{area}/{slug}`; tapping the WhatsApp CTA triggers `event.stopPropagation()` and, as an interim baseline before Epic 5 is completed, launches a direct WhatsApp link `wa.me/<E164>?text=Hello...` in a new tab (seamlessly transitioning to the Epic 5 bottom sheet once Epic 5 is deployed).
**And** automated integration test `tests/integration/ranking-engine.test.ts` executes against the Epic 1 seed data (~20 providers) to assert that:
  1. Tier 1 providers precede Tier 2 providers in all default queries.
  2. Listings with photos sort ahead of photo-less listings within each tier.
  3. Newest approved listing breaks ties.
  4. "Has physical workshop" filter strictly excludes Tier 2 visiting listings.
  5. Workshop-only providers never appear in cross-area results.
  6. 'paused', 'suspended', and manual-repair-flagged (`requires_manual_repair = true`) listings produce zero rows in `public_providers` and are completely excluded from search results.

### Story 4.5: Empathetic Zero-Results State, Rate-Limited Logging & Support Concierge

As a customer searching in an area without matching technicians,
I want helpful guidance, nearby town links, and a direct concierge contact option,
So that I am not left stranded with a broken machine while FixNear learns what demand is unserved.

**Acceptance Criteria:**

**Given** a customer search that yields zero matching in-area or visiting providers,
**When** the zero-state view renders (`UX-DR7`),
**Then** the page automatically serves `<meta name="robots" content="noindex, follow">` preventing empty query pages from being indexed by search engines.
**And** it displays an empathetic message: *"No technicians found for [Service] in [Area] yet"*.
**And** it renders quick-links suggesting adjacent launch towns (e.g. *"Check nearby Kochchikade or Katunayake"*).
**And** it displays a prominent green WhatsApp CTA button: *"Message FixNear on WhatsApp"*, dynamically reading the support WhatsApp phone number from environment variable `NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER` and launching a pre-formatted concierge request.
**And** the application calls Server Action `logZeroResultSearchAction`, which enforces rate limiting (max 5 log events per minute per IP via PostgreSQL `rate_limit_buckets`) and deduplication (skips DB insert if identical area/sub-service/query was logged from the same IP hash within the last 10 minutes), inserting anonymous demand records into `zero_result_searches` with zero customer PII.

### Story 4.6: Dynamic SEO Routing, Robots.txt, OpenGraph & Staging Mobile LCP Audit

As an organic Google searcher or social media user in Negombo,
I want fast crawlable directory URLs, standard robots directives, and rich link previews when shared on WhatsApp,
So that I can easily discover and share FixNear repair services.

**Acceptance Criteria:**

**Given** any public directory route (`/{area}`, `/{area}/{service-slug}`, `/providers/{area}/{slug}`),
**When** crawled by search bots or shared across messaging platforms,
**Then** dynamic `generateMetadata` produces canonical URLs, unique crawlable `<title>` tags (e.g. *"Kamal Refrigeration — Verified Fridge Repair in Negombo | FixNear"*), localized meta descriptions with pricing, and OpenGraph tags with thumbnail images.
**And** `src/app/robots.ts` serves dynamic `robots.txt` allowing indexing of all clean public directories while disallowing `/admin/*`, `/provider/*`, and `/api/*`, and referencing `https://fixnear.lk/sitemap.xml`.
**And** dynamic sitemap generator at `src/app/sitemap.ts` automatically serves `sitemap.xml` containing all active launch towns, active sub-services, and approved verified provider URLs (strictly excluding `'paused'` and `'suspended'` listings) with `daily` change frequency.
**And** CI/Staging verification includes an automated mobile-throttled Lighthouse test (simulating Sri Lankan 3G/4G network profiles: RTT 150ms, 1.6Mbps throughput) asserting that public directory pages achieve Largest Contentful Paint (LCP) < 2.5s and CLS < 0.1 (`NFR-201`).

---

## Epic 5: Provider Profiles & WhatsApp Contact Handoff

Enable customers to evaluate detailed technician credentials, repair specialties, upfront inspection fees, and responsive work photo galleries on dedicated profile pages, and smoothly initiate direct WhatsApp conversations via dynamic pre-filled deep links while preserving customer privacy and recording anonymous conversion metrics.
- **Owner:** Developer A (`(public)` route group)
- **Dependencies:** Requires **Epic 1** (schema, seed data, public view) and **Epic 4** (clean routing & directory cards). Can run in parallel with Epics 2 and 3.

### Story 5.1: Comprehensive Provider Profile Page, Base Area Canonical URLs & Simple JSON-LD

As a customer needing equipment repairs,
I want to view a dedicated, server-rendered profile page for a verified technician with their workshop address, bio, full service list, pricing, and visiting areas,
So that I can assess their legitimacy, specialties, and inspection fees before initiating direct contact.

**Acceptance Criteria:**

**Given** an unauthenticated visitor accessing `/providers/{area}/{slug}`,
**When** the React Server Component queries `public_providers`,
**Then** if the slug does not exist, or the provider has `status != 'approved'` or `is_verified != true`, the server returns HTTP 404 via Next.js `notFound()`.
**And** canonical profile URL structure strictly uses the provider's physical base area (`/providers/{base_area}/{slug}`):
  - If `{area}` matches the provider's `base_area`, the profile page renders directly with a self-referencing canonical tag `<link rel="canonical" href="https://fixnear.lk/providers/{base_area}/{slug}">`.
  - If `{area}` is NOT the provider's base area, but is listed in the provider's `areas_served`, the server returns an HTTP 301 Permanent Redirect to `/providers/{base_area}/{slug}`.
  - If `{area}` is neither the provider's base area nor in `areas_served`, the server returns HTTP 404 via Next.js `notFound()`.
**And** the profile page displays: Provider/Business Name, Verified Trust Badge (`#D97706`), Base Area, Workshop Address (if provided, marked *"Physical Workshop"*), Bio narrative, Primary Category & Sub-services grouped as distinct specialty tags, Service Mode & Areas Served chips, Pricing model block with upfront Visiting / Inspection fee in Sri Lankan Rupees (`LKR`).
**And** a sticky bottom contact bar on mobile viewports renders the prominent green WhatsApp CTA button: *"Contact on WhatsApp"* (`#25D366`, `min-h-[44px]`).
**And** the page generates clean, valid Schema.org JSON-LD structured data with a single valid business type (`LocalBusiness`), containing strictly authentic properties: `name`, `telephone` (E.164), `areaServed`, and `priceRange`; the `address` property is included strictly only when the provider chose to display a physical workshop address (`workshop_address IS NOT NULL`) and omitted otherwise; invented star ratings, review counts, or fake aggregate ratings (`aggregateRating`) are STRICTLY omitted.
**And** dynamic metadata generates a crawlable `<title>` (e.g. *"Kamal Refrigeration — Verified Refrigerator Repair in Negombo | FixNear"*), local description, and OpenGraph image tags pointing to the provider's primary work photo.

### Story 5.2: Responsive Work Photo Lightbox Gallery & Dialog Accessibility

As a customer evaluating a repair technician,
I want to browse high-resolution photos of past repair work and workshop facilities in an accessible fullscreen mobile lightbox,
So that I have visual evidence of their technical competence and physical premises.

**Acceptance Criteria:**

**Given** an approved provider profile page with up to 10 photos in `work_photos`,
**When** the media gallery renders,
**Then** mobile viewports display a swipeable thumbnail carousel with a current index indicator (e.g. *"Photo 1 of 6"*) and desktop displays a responsive 3-column photo grid.
**And** tapping any photo opens a fullscreen modal lightbox overlay (`src/components/public/PhotoLightbox.tsx`).
**And** the lightbox enforces full WAI-ARIA modal dialog accessibility:
  - Container markup sets `role="dialog"`, `aria-modal="true"`, and `aria-label="Work photo preview"`.
  - An active focus trap cycles keyboard Tab / Shift+Tab navigation strictly within the lightbox controls while open.
  - When the lightbox closes (via close button, Escape key, or backdrop tap), keyboard focus cleanly restores to the triggering thumbnail element.
  - UI respects the user's `prefers-reduced-motion` media query by disabling slide/zoom transitions and snapping instantaneously.
**And** the lightbox supports touch swipe left/right navigation, next/prev arrow buttons with minimum 44px × 44px touch targets, a visible close button (top-right, `min-h-[44px] min-w-[44px]`), and keyboard Escape key closure.
**And** images are delivered via Next.js `<Image>` with responsive `sizes` attribute, fetching compressed WebP assets from Supabase Storage CDN (`NFR-202`).
**And** if a provider has zero uploaded photos, the profile renders an elegant craftsman placeholder card (`UX-DR1`) indicating *"Verified Technician — Contact directly for project estimates"*.

### Story 5.3: WhatsApp Hand-off Bottom Sheet Modal, Directory Card Integration & Dialog Accessibility

As a mobile customer deciding to reach out to a technician,
I want a lightweight, accessible bottom sheet that lets me optionally provide my name before connecting on WhatsApp,
So that the technician knows who is reaching out while all contact attempts across FixNear are consistently logged without storing my identity.

**Acceptance Criteria:**

**Given** a customer tapping "Contact on WhatsApp" on either a Provider Summary Card (in directory search results) or the Provider Profile page,
**When** the CTA is tapped,
**Then** component `src/components/public/WhatsAppBottomSheet.tsx` slides up occupying ~40% of the mobile viewport (`UX-DR6`), explicitly replacing the interim direct `wa.me` button from Story 4.4 so that every WhatsApp contact across the platform routes through this modal and triggers logging.
**And** the bottom sheet enforces full WAI-ARIA modal dialog accessibility:
  - Container sets `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="whatsapp-sheet-title"`.
  - An active focus trap cycles keyboard Tab navigation strictly within the bottom sheet elements while open.
  - When the bottom sheet is dismissed (via drag handle swipe-down, backdrop tap, or Escape key), focus immediately restores to the triggering "Contact on WhatsApp" button.
  - Respects `prefers-reduced-motion` by omitting slide-up CSS transitions and appearing instantly.
**And** when the customer taps "Continue to WhatsApp" or "Skip and open WhatsApp", the browser opens WhatsApp via `window.open(whatsappUrl, '_blank')` **synchronously** inside the direct user tap event handler (concurrent with or immediately following the non-blocking keepalive fetch) to guarantee popup blockers on mobile Safari and Chrome do not suppress the new tab.
**And** on mobile devices, the name input does NOT auto-focus (preventing unwanted virtual keyboard layout shifts), while on desktop devices the input auto-focuses.
**And** the modal presents an optional single text input: *"Your Name (Optional)"* with placeholder *"e.g. Nimal or leave blank"*.
**And** it displays two distinct action buttons enforcing minimum 44px × 44px bounding boxes:
  - Primary Button (`#25D366` green): *"Continue to WhatsApp"*
  - Secondary Button (slate text/outline): *"Skip and open WhatsApp"*
**And** **Client-Side PII Scrubbing Principle (`FR-204`, `NFR-302`):** Any name entered by the customer is held strictly in React component memory to build the client-side `wa.me` deep link and is NEVER transmitted over the wire or stored in database tables or server logs.

### Story 5.4: Dynamic WhatsApp Pre-filled Deep Link Engine & Input Sanitization

As a customer connecting with a technician on WhatsApp,
I want the chat to open with a polite, pre-composed message detailing the exact equipment breakdown and location,
So that I don't have to type out an awkward introduction on my mobile keypad.

**Acceptance Criteria:**

**Given** the customer taps "Continue to WhatsApp" (with or without a name) or "Skip and open WhatsApp" in the bottom sheet,
**When** the deep link builder (`src/lib/utils/whatsapp.ts`) constructs the URL,
**Then** customer name input is strictly sanitized: capped at a maximum of 40 characters, with all ASCII control characters, newlines, and non-printable characters stripped (`name.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, 40)`).
**And** all dynamic variables (`provider_name`, `customer_name`, `sub_service_name`, `area_name`) are strictly URL-encoded via `encodeURIComponent()`.
**And** user and provider strings are NEVER rendered as unescaped HTML (rendered strictly as text nodes in React components, with zero `dangerouslySetInnerHTML`).
**And** it generates an international `https://wa.me/<E164_PHONE>?text=<URL_ENCODED_MESSAGE>` link targeting the provider's verified phone number (`FR-203`, `NFR-301`):
  - If customer entered a name:
    `"Hello [Provider Name], my name is [Customer Name]. I found your profile on FixNear for [Sub-service] in [Area]. Are you available for repairs?"`
  - If customer skipped the name:
    `"Hello [Provider Name], I found your profile on FixNear for [Sub-service] in [Area]. Are you available for repairs?"`
**And** `[Sub-service]` is dynamically populated from the active search filter tag (if navigated from directory) or defaults to the provider's primary specialty.
**And** `[Area]` is populated from the customer's active selected area.
**And** the browser launches the deep link in the native WhatsApp application on mobile devices, or WhatsApp Web on desktop browsers in a new tab, preserving the customer's directory session without navigation loss.

### Story 5.5: Privacy-Preserving Conversion Metric Logging with Keepalive & Conflict-Ignoring Inserts

As a platform administrator and provider,
I want anonymous WhatsApp hand-off events reliably logged via keepalive requests and rate-limited without storing customer PII,
So that we have approximate daily contact metrics per provider without losing events when users transition to WhatsApp.

**Acceptance Criteria:**

**Given** a customer taps "Continue to WhatsApp" or "Skip and open WhatsApp",
**When** the click event fires,
**Then** the client immediately executes an HTTP POST to route handler `/api/contact-event` using `fetch` with `keepalive: true` (or `navigator.sendBeacon`), fired immediately BEFORE the browser opens the `wa.me` deep link, guaranteeing that the log request completes reliably even as the page unloads or loses focus.
**And** the request payload includes `provider_id`, optional `area_id`, optional `sub_service_id`, and `source_page` (`'directory_card' | 'profile_page'`).
**And** the route handler enforces rate limiting via PostgreSQL `rate_limit_buckets` with a generous ceiling (30 contact requests per minute per IP) to prevent false-positive blocks caused by shared mobile carrier IPs (CGNAT).
**And** the route handler computes `session_hash = SHA256(ip + user_agent + date_iso + provider_id + CONTACT_HASH_SALT)` where `date_iso` is the current UTC calendar date (`YYYY-MM-DD`), and executes an atomic insert into `contact_events` with `ON CONFLICT (provider_id, session_hash) DO NOTHING` leveraging table constraint `uq_contact_events_provider_hash`.
**And** under NO circumstances is the customer's IP address, user agent string, entered name, or telephone number stored in `contact_events` or any database column (`FR-204`, `NFR-302`).
**And** the logged metric is formally documented in architecture and operational guides as **approximate unique daily contacts per provider**, noting that Sri Lankan mobile operators (Dialog, Mobitel, etc.) employ Carrier-Grade NAT (CGNAT) where hundreds of subscribers share mobile IP addresses; the composite hash distinguishes different user agents on the same IP, but metrics remain inherently approximate.
**And** an end-to-end verification test is performed manually on physical iOS and Android mobile phones over a live Sri Lankan cellular 3G/4G connection, confirming that tapping CTA opens WhatsApp and inserts a row into `contact_events`.
**And** automated integration test `tests/integration/contact-events.test.ts` asserts that rapid repeated clicks from the same client IP increment `rate_limit_buckets`, deduplicate same-day hashes via `ON CONFLICT DO NOTHING`, and write zero customer PII to database tables.

---

## Epic 6: Provider Self-Management & Security

Enable authenticated repair technicians and workshop owners to securely log in, update their business bio, visiting fees, service areas, and work photo portfolio, handle mandatory password resets from admin-assisted recovery, resubmit rejected applications with corrections, manage listing visibility (pause listing), and enforce the security guardrail (automatic transition to `pending_reverification` and public de-listing whenever critical identity fields like WhatsApp phone or business name are modified).
- **Owner:** Developer B (`(provider)` route group)
- **Dependencies:** Requires **Epic 2** (provider authentication pipeline) and **Epic 3** (admin temporary password generation & rejection reasons).
- **FRs Covered:** `FR-306`, `FR-401`, `FR-402`
- **ARCH Requirements Covered:** `ARCH-4`, `ARCH-7`, `ARCH-9`
- **UX-DRs Covered:** `UX-DR8`, `UX-DR9`

### Story 6.1: Authenticated Provider Dashboard, Status Banners & Draft Handling

As an authenticated repair provider,
I want a centralized mobile dashboard displaying my listing status, profile link, and operational alerts in plain language,
So that I understand whether my listing is live, under review, incomplete, or requires corrective action.

**Acceptance Criteria:**

**Given** an authenticated provider logging in at `/provider/login` or navigating to `/provider/dashboard`,
**When** the dashboard renders,
**Then** route middleware and server component verify caller authentication, redirecting unauthenticated visitors to `/provider/login`.
**And** the dashboard renders a prominent status banner primitive conforming to `UX-DR9`:
  - If `submitted_at IS NULL` (incomplete registration): Amber/blue banner displaying *"Your registration is not finished. Continue your application where you left off."* with a button: *"Continue Application"*, linking directly to `/register` with their preserved form step.
  - If `status = 'approved'` and `is_verified = true`: Green banner displaying *"Your listing is active and verified on FixNear"*, with an accessible link to view their public profile `/providers/{base_area}/{slug}`, a 1-tap "Share Profile Link" button, and a "Pause listing" toggle.
  - If `status = 'pending_approval'`: Amber banner displaying *"Your application is under review by FixNear Admin (target review time: within 12 hours). We will reach out on WhatsApp shortly."*
  - If `status = 'pending_reverification'`: Amber alert displaying *"Your listing is temporarily hidden while FixNear Admin verifies your updated contact details (target review time: within 12 hours). We will reach out on WhatsApp shortly."*
  - If `status = 'rejected'` and `is_permanently_rejected = false`: Crimson alert displaying *"Application Not Approved"* alongside the structured rejection reason code, explanatory text, and admin feedback note from `rejection_reasons`, with a prominent button: *"Edit & Resubmit Application"*.
  - If `status = 'rejected'` and `is_permanently_rejected = true`: Crimson alert displaying *"This application has been permanently rejected. Resubmission is not permitted. If you believe this is an error, please reach out to FixNear Admin on WhatsApp."*
  - If `status = 'paused'`: Distinct amber/slate banner displaying *"Your listing is currently paused by you. Tap 'Resume Listing' to make it live again for customers."* with an accessible button: *"Resume Listing"*.
  - If `status = 'suspended'`: Crimson banner displaying *"This listing has been suspended by FixNear Admin. You cannot resume it yourself. Please reach out to FixNear Admin on WhatsApp for assistance."* (Resume button strictly hidden).
**And** the dashboard displays key summary counts: active work photos count (out of 10 maximum) and approximate lead contact clicks received.

### Story 6.2: Provider Profile Details, Bio Sanitization, Pause Listing & Account Deletion

As an approved repair provider,
I want to update my workshop address, bio description, repair specialties, visiting fees, or pause/delete my listing,
So that my public profile reflects my current business capabilities without needing administrative re-verification.

**Acceptance Criteria:**

**Given** an authenticated provider on `/provider/dashboard/profile`,
**When** they edit non-critical profile fields: Personal Name, Workshop Address (optional), Short Bio, Category, Sub-service tags, Service Mode (`comes_to_customer`, `customer_comes_to_shop`, `both`), Areas Served launch towns, Pricing Model, or upfront Visiting / Inspection Fee in LKR,
**Then** client and server validate bio description with a lightweight regex check scanning for website URLs (`https?:\/\/`, `www\.`, `\.(com|org|net|lk|io)`) and phone number digit patterns (`/\+?\d[\d\s-]{7,}\d/`); if detected, the form displays a friendly warning: *"Please do not include website links or phone numbers in your bio. Customers can contact you directly via the verified WhatsApp button."* and blocks saving until removed.
**And** when they tap "Save Changes", Server Action invokes PostgreSQL `SECURITY DEFINER` RPC `fn_update_provider_profile_details(p_provider_id UUID, ...)` using the **user-scoped client** (`src/lib/supabase/server.ts`) inside an atomic database transaction block, passing `p_provider_id` originating strictly from the verified session (`session.user.id`). Inside the function, it validates `auth.uid() IS NOT NULL AND auth.uid() = p_provider_id` (raising `P0001` / `Unauthorized` if mismatched), updating `providers`, `provider_services`, and `provider_areas`, and setting `last_edited_at = NOW()`.
**And** saving these non-critical fields DOES NOT alter `status` or `is_verified`, ensuring active approved listings remain live without interruption.
**And** the Server Action triggers Next.js cache revalidation via `revalidatePath('/providers/[area]/[slug]', 'page')`, `revalidatePath('/[area]/[service]', 'page')`, and `revalidateTag('public_providers')` so updates appear immediately on public pages.
**And** database trigger `fn_enforce_provider_column_protection` confirms that this operation cannot alter protected columns (`provider_type`, `slug`, `status`).
**And** the dashboard provides a "Pause my listing" toggle invoking PostgreSQL `SECURITY DEFINER` RPC `fn_toggle_provider_listing_pause(p_provider_id UUID, p_paused BOOLEAN)` using the **user-scoped client** (`src/lib/supabase/server.ts`) conforming to the transition allowlist:
  - The `p_provider_id` argument is supplied strictly from the verified session (`session.user.id`).
  - Called with the user's authenticated client, the function strictly validates `auth.uid() IS NOT NULL AND auth.uid() = p_provider_id` inside the function body (raising `P0001` / `Unauthorized` if mismatched), guaranteeing a provider can never toggle pause/resume on another provider's listing.
  - Setting paused transitions `status` from `'approved'` to `'paused'` while preserving `is_verified = true`, immediately hiding the listing from public search and profiles. Pausing is strictly permitted ONLY from `status = 'approved'`.
  - While `status = 'paused'`, edits to WhatsApp Phone Number and Business Name are strictly disabled with helper message *"Resume your listing first to edit critical contact details."* Direct transition `paused → pending_reverification` is prohibited.
  - Setting unpaused asserts that current status is `'paused'`; if the listing was suspended by an administrator (`status = 'suspended'`), the RPC strictly refuses execution with error code `P0003` ("Listing is suspended by administration and cannot be resumed by the provider. Contact FixNear admin on WhatsApp."). When valid, transitions `status` back to `'approved'`, restoring public visibility and revalidating public cache paths.
**And** under `/provider/dashboard/settings`, an "Account Deletion" section allows the provider to request account deletion with a confirmation modal, delegating execution to the service-role Server Action defined in `Story 7.11`.

### Story 6.3: Work Photo Portfolio Management (EXIF Stripping, Direct Upload & Atomic Resequencing)

As an authenticated repair provider,
I want to add new repair photos without privacy leaks, delete outdated photos, and set my primary cover thumbnail,
So that my portfolio continuously showcases my best repair work cleanly and securely.

**Acceptance Criteria:**

**Given** an authenticated provider accessing `/provider/dashboard/photos`,
**When** they manage their portfolio,
**Then** the UI displays their current uploaded photos with a badge indicating the primary cover photo (`sort_order = 0`).
**And** tapping "Add Photo" opens client uploader `src/components/provider/PhotoUploader.tsx`, enforcing MIME checks (`image/jpeg`, `image/png`, `image/webp`), client-side WebP compression (<1200px, <500KB) that automatically strips all EXIF metadata (GPS coordinates, camera device info, timestamps) via HTML5 Canvas export, and uploads directly to Supabase Storage `provider-photos/${auth.uid()}/${photoId}.webp` (`ARCH-9`, `NFR-202`).
**And** Server Action `recordWorkPhotoAction` verifies object existence, validates storage path regex, checks the 10-photo atomic cap, and inserts the record into `work_photos`.
**And** when the provider taps "Delete Photo" on any image, Server Action `deleteWorkPhotoAction` first deletes the storage object from Supabase Storage bucket via storage admin API, and upon confirmed deletion invokes PostgreSQL `SECURITY DEFINER` RPC `fn_delete_and_resequence_photos(p_provider_id UUID, p_photo_id UUID)` using the **user-scoped client** (`src/lib/supabase/server.ts`), passing `p_provider_id` originating strictly from the verified session (`session.user.id`). Inside the function, it validates `auth.uid() IS NOT NULL AND auth.uid() = p_provider_id` (raising `P0001` / `Unauthorized` if mismatched), removes the database row, and re-sequences `sort_order` for remaining photos inside an atomic transaction, preventing orphan storage files.
**And** when the provider taps "Set as Cover", Server Action calls PostgreSQL `SECURITY DEFINER` RPC `fn_set_cover_photo(p_provider_id UUID, p_photo_id UUID)` using the **user-scoped client** (`src/lib/supabase/server.ts`), passing `p_provider_id` originating strictly from the verified session (`session.user.id`). Inside the function, it validates `auth.uid() IS NOT NULL AND auth.uid() = p_provider_id` (raising `P0001` / `Unauthorized` if mismatched), updating `sort_order = 0` for the selected photo and shifting other photos sequentially in a single atomic database operation.
**And** all photo mutations trigger Next.js cache revalidation (`revalidatePath`, `revalidateTag`) so public profiles and directory summary cards reflect updated thumbnails immediately.

### Story 6.4: Critical Identity Edit Re-verification Guardrail & Auth Lifecycle

As a platform owner and provider,
I want modifications to a provider's WhatsApp phone number or business name to require administrator re-verification,
So that marketplace integrity and trust are protected against unauthorized profile hijacking or unverified transfers.

**Acceptance Criteria:**

**Given** an approved, active provider viewing their profile settings at `/provider/dashboard/profile`,
**When** the provider's listing has `status = 'paused'`,
**Then** the form fields for WhatsApp Phone Number and Business Name are strictly disabled with a helper message: *"Resume your listing first to edit critical contact details."*
**And** any direct invocation of Server Action or RPC `fn_request_identity_reverification` while `status = 'paused'` is rejected with PostgreSQL error `P0004` (*"Cannot request identity re-verification while listing is paused. Resume your listing first."*), conforming to the transition allowlist (must transition `paused → approved` before requesting re-verification).
**When** an approved provider (`status = 'approved'`) edits their registered WhatsApp Mobile Number or Business Name,
**Then** the form displays a plain-language warning: *"Changing your WhatsApp number or Business Name requires verification by FixNear Admin. Your profile will be temporarily hidden from the public directory until verified."*
**And** tapping "Save Changes" opens a confirmation modal requiring explicit confirmation: *"Confirm Updating Contact Details"*.
**And** upon form submission with a new phone number, Server Action `requestIdentityReverificationAction` executes pre-flight security checks:
  - Computes `phone_hash = crypto.createHmac('sha256', process.env.PHONE_BLOCKLIST_SECRET).update(normalized_new_phone).digest('hex')`.
  - Asserts that `phone_hash` does not exist in `phone_blocklist`; if present, rejects with *"This phone number cannot be used on FixNear."*
  - Asserts uniqueness against both live numbers (`providers.phone_number`) and pending numbers (`providers.pending_phone_number`) across all other providers (`WHERE id != auth.uid()`), backed by unique constraint `uq_providers_phone_number` and partial unique index `uq_providers_pending_phone`; if taken, rejects with *"This WhatsApp number is already associated with another provider account."*
**And** upon passing pre-flight checks, the action invokes PostgreSQL `SECURITY DEFINER` RPC `fn_request_identity_reverification(p_provider_id UUID, p_new_phone_number VARCHAR, p_new_business_name VARCHAR)` using the **user-scoped client** (`src/lib/supabase/server.ts`) inside an atomic database transaction:
  - Passes `p_provider_id` originating strictly from the verified session (`session.user.id`).
  - Inside `fn_request_identity_reverification`, the function strictly validates `auth.uid() IS NOT NULL AND auth.uid() = p_provider_id` (raising PostgreSQL error `P0001` / `Unauthorized` if mismatched), preventing any caller from initiating re-verification on another provider's account.
  - Asserts that current status is NOT `'paused'`; if `status = 'paused'`, raises PostgreSQL error `P0004` (*"Cannot request identity re-verification while listing is paused. Resume your listing first."*).
  - Writes unverified changes to dedicated staging columns: sets `pending_phone_number = p_new_phone_number` and `pending_business_name = p_new_business_name`.
  - Leaves the live verified `phone_number` and `business_name` intact and reserved in their primary columns.
  - Automatically transitions `status = 'pending_reverification'` and sets `is_verified = false`.
  - Database trigger `fn_log_listing_status_history` logs the transition with audit reason `"Provider updated critical identity field"` and captures `metadata = jsonb_build_object('old_phone_number', phone_number, 'new_phone_number', pending_phone_number, 'old_business_name', business_name, 'new_business_name', pending_business_name)`.
  - Dispatches an asynchronous Telegram notification to the configured admin Telegram channel (`Story 3.5` pipeline) showing Old vs New phone number and Old vs New business name.
  - Executes Next.js cache revalidation (`revalidatePath` and `revalidateTag`), instantly evicting the provider from public directory search and causing direct profile visits to return HTTP 404 to anonymous visitors.
**And** **Auth Login Identifier Lifecycle:** The provider's Supabase Auth login identifier remains their existing verified phone number until Admin verifies and approves the re-verification. As defined in `Story 3.4`, the Admin approval flow executes in strict sequential order: updates Supabase Auth credentials first (including updating the synthetic email `<phone>@fixnear.invalid` [reserved RFC 2606 `.invalid` domain; email sending disabled in Supabase Auth] if the `Story 1.2` auth spike selects that option) and, only upon confirmed success in Supabase Auth, promotes `pending_phone_number` to `phone_number` in the database. If database promotion fails, Supabase Auth is rolled back.
**And** **Admin Rejection & Revert Collision Behavior:** If Admin rejects the re-verification change, Admin can either keep the listing hidden under `status = 'rejected'` or `'suspended'`, OR revert to the prior verified values:
  - If admin chooses to reject/suspend: the action clears `pending_phone_number = NULL` and `pending_business_name = NULL`, sets `status = 'rejected'` or `'suspended'`, and records `rejection_reason`.
  - If admin chooses to revert: because live `phone_number` and `business_name` were preserved in their primary columns during staging, the action simply clears `pending_phone_number = NULL` and `pending_business_name = NULL` and reinstates `status = 'approved'` and `is_verified = true`. If in any edge case a revert restores an old phone from `listing_status_history`, the action relies on PostgreSQL unique constraint `uq_providers_phone_number`, catches error `23505` if a collision occurs, sets `status = 'suspended'`, and alerts the admin.
**And** while in `status = 'pending_reverification'`, the form fields for phone and business name are strictly disabled in the UI, and PostgreSQL RPC `fn_request_identity_reverification` rejects any further critical update invocations until the active review is resolved.
**And** automated integration test `tests/integration/reverification-guardrail.test.ts` asserts that edits are blocked while `status = 'paused'`, blocked/duplicate phone numbers are rejected, staged changes populate `pending_phone_number` and `pending_business_name` while keeping live columns intact, status transitions to `pending_reverification`, and provider is immediately removed from `public_providers`.

### Story 6.5: Rejected Application Correction, Resubmission & Permanent Rejection Gate

As a provider whose application was previously rejected,
I want to view the administrator's feedback, correct the flagged deficiencies, and resubmit my listing for review,
So that I have a clear path to approval without needing to create a new account or start from scratch.

**Acceptance Criteria:**

**Given** a provider whose listing has `status = 'rejected'`,
**When** they log into `/provider/dashboard`,
**Then** if `is_permanently_rejected = true`:
  - The dashboard displays a permanent crimson alert: *"This application has been permanently rejected. Resubmission is not permitted. If you believe this is an error, please reach out to FixNear Admin on WhatsApp."*
  - The "Edit & Resubmit Application" button is completely disabled and hidden.
  - Server Action and PostgreSQL RPC `fn_resubmit_provider_application` reject execution with error code `P0002` ("Permanent rejection cannot be resubmitted").
  - The admin action that applied permanent rejection automatically records the provider's phone hash (`crypto.createHmac('sha256', process.env.PHONE_BLOCKLIST_SECRET).update(providers.phone_number).digest('hex')`) in `phone_blocklist`, preventing subsequent re-registration even if account deletion is attempted.
**And** if `is_permanently_rejected = false`:
  - The crimson rejection banner displays the admin rejection reason and custom note stored in `rejection_reason`.
  - Tapping "Edit & Resubmit Application" unlocks the profile and photo editing interfaces, allowing the technician to address the specific feedback.
  - Upon completing edits and tapping "Resubmit Application for Verification", Server Action invokes PostgreSQL `SECURITY DEFINER` RPC `fn_resubmit_provider_application(p_provider_id UUID)` using the **user-scoped client** (`src/lib/supabase/server.ts`), passing `p_provider_id` originating strictly from the verified session (`session.user.id`):
    - Inside `fn_resubmit_provider_application`, the function strictly validates `auth.uid() IS NOT NULL AND auth.uid() = p_provider_id` (raising PostgreSQL error `P0001` / `Unauthorized` if mismatched), preventing any caller from resubmitting another provider's application.
    - Sets `status = 'pending_approval'`, clears `rejection_reason = NULL`, sets `is_verified = false`, and records `submitted_at = NOW()`.
    - Database trigger `fn_log_listing_status_history` records the transition from `rejected` to `pending_approval`.
    - Dispatches an asynchronous Telegram alert to the configured admin Telegram channel indicating *"Resubmitted Application from [Business Name] ready for review"*.
    - Places the application back into the chronological active admin review queue (`Story 3.2`).
  - The dashboard transitions to the amber `pending_approval` banner.

### Story 6.6: Mandatory Temporary Password Reset Screen, RLS Enforcement & Invalidation Job

As a provider who received an admin-generated temporary password,
I want a dedicated, forced password reset screen upon logging in with strict database enforcement,
So that I must establish a permanent personal password before accessing any provider capabilities.

**Acceptance Criteria:**

**Given** a provider who logs in with an unexpired temporary password (`must_change_password = true` and `NOW() <= temp_password_expires_at`),
**When** authentication completes,
**Then** Next.js route middleware detects `must_change_password = true` and restricts navigation exclusively to `/provider/reset-password`; any attempt to access `/provider/dashboard/*` or other authenticated routes redirects immediately to `/provider/reset-password`.
**And** every provider Server Action asserts `must_change_password = false`, rejecting execution with an unauthorized exception if temporary password state is active.
**And** Row-Level Security (RLS) write policies on `providers`, `provider_services`, `provider_areas`, and `work_photos` enforce `WITH CHECK ((SELECT must_change_password FROM providers WHERE id = auth.uid()) = false)`, guaranteeing database-level lockdown against writes while using temporary credentials.
**And** `/provider/reset-password` renders an accessible form containing: *New Password* (min 8 chars) and *Confirm New Password* inputs with show/hide password visibility toggles.
**And** Server Action `completePasswordResetAction` validates that the new password is NOT identical to the temporary password used to authenticate.
**And** submitting the form:
  - Updates the provider's permanent password in Supabase Auth via `supabase.auth.updateUser({ password })`.
  - Updates `providers`, setting `must_change_password = false` and `temp_password_expires_at = NULL`.
  - Redirects the provider to `/provider/dashboard` with a success toast notification: *"Password updated successfully. Your account is now secure."*
**And** an automated hourly scheduled job (`cron-expire-temp-passwords` or `pg_cron`) executes `UPDATE providers SET must_change_password = false, temp_password_expires_at = NULL WHERE must_change_password = true AND NOW() > temp_password_expires_at;` to cleanly invalidate abandoned temporary passwords.
**And** if a provider attempts to log in with an expired temporary password (`NOW() > temp_password_expires_at`), login is rejected with an explicit user message: *"Your temporary password has expired. Please contact FixNear on WhatsApp for a new one."*
**And** automated integration test `tests/integration/password-reset-flow.test.ts` asserts that temporary credentials enforce the reset screen, reject server actions and direct database RLS writes, update Supabase Auth, and clear `must_change_password`.

---

## Epic 7: Launch Readiness & Operational Hardening

Execute comprehensive operational hardening prior to public marketing: Cloudflare Turnstile bot verification, PostgreSQL sliding-window rate limit load testing, simple admin metrics dashboard (contact clicks per provider/area, zero-result demand searches, active providers count), host image optimization usage check against free-tier limits, automated 3-day health keep-alive ping, scheduled weekly database and photo storage backups, Supabase Pro plan upgrade gate ($25/mo), WCAG 2.1 AA accessibility audit, mobile 3G/4G network audit, field verification with 15–25 real Negombo technicians, privacy policy & terms of use, provider-initiated account deletion & pause lifecycle, and operations runbook (backup admin, stale review queue SLA, platform upgrade roadmap).
- **Owner:** Shared / Dhanushka
- **Dependencies:** Requires Epics 1 through 6. Final gate before production traffic.

### Story 7.1: Cloudflare Turnstile Bot Protection Hardening & Token Verification

As a system administrator,
I want Cloudflare Turnstile bot verification hardened across public registration and high-risk endpoints with automated server-side verification and fallback handling,
So that malicious automated scrapers and bots are blocked from polluting the directory or exhausting database and storage resources.

**Acceptance Criteria:**

**Given** public endpoints accepting external submissions (Provider Registration `/register` and public contact logging `/api/contact-event`),
**When** a user submits the form or triggers the action,
**Then** the client widget collects a Turnstile token using `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (supporting official Cloudflare test keys `1x00000000000000000000AA` for local testing and CI).
**And** the Server Action or route handler validates the token against `https://challenges.cloudflare.com/turnstile/v0/siteverify` using `TURNSTILE_SECRET_KEY` and the client's IP address.
**And** if validation fails or token is missing/expired, the action immediately aborts execution, returns HTTP 400 with a polite user-facing error message (*"Verification challenge failed. Please refresh the page and try again."*), and increments the security anomaly counter.
**And** Turnstile verification failures are logged with client IP, timestamp, and challenge error codes for auditability without logging sensitive payload data.
**And** automated integration test `tests/integration/turnstile-verification.test.ts` asserts that valid test tokens pass server validation, while missing, empty, or forged tokens fail with a 400 rejection.

### Story 7.2: PostgreSQL Sliding-Window Rate Limiting Stress & Concurrent Load Testing

As a developer and platform maintainer,
I want comprehensive stress and concurrency tests executed against the PostgreSQL `rate_limit_buckets` table,
So that we verify registration, login, and WhatsApp click limits hold under concurrent burst traffic without deadlocks or table lock contention.

**Acceptance Criteria:**

**Given** the PostgreSQL `rate_limit_buckets` table and sliding-window rate-limiting RPC functions established in Epic 1 and configured across Epics 2, 3, and 5,
**When** automated load test `tests/load/rate-limiter.test.ts` executes concurrent bursts simulating realistic pilot traffic and adversarial attacks:
  - Provider registration burst: 5 attempts per 15 minutes per IP (`Story 2.1`).
  - Provider/Admin login brute-force burst: 5 attempts per 15 minutes per IP (`Story 2.6`, `Story 3.1`).
  - WhatsApp click conversion burst: 30 requests per minute per IP (`Story 5.5`).
**Then** the rate-limiting RPC function atomically allows requests up to the configured quota and returns `allowed = false` with accurate `retry_after` seconds for any subsequent requests within the window.
**And** concurrent transactions targeting distinct bucket keys or IP addresses execute without table-level locking, serialization failures, or deadlock errors.
**And** the sliding-window cleanup routine (`DELETE FROM rate_limit_buckets WHERE window_start < NOW() - INTERVAL '1 hour'`) purges expired bucket rows cleanly and executes under 10ms using the `(key, window_start)` composite index.
**And** automated test suite verifies that shared mobile IP addresses (CGNAT simulated with common IP blocks) are handled gracefully under the generous 30/min WhatsApp click quota without prematurely blocking legitimate inquiries.

### Story 7.3: Inactivity Keep-Alive Cron Workflow & Health Endpoint Monitoring

As a platform operator,
I want an automated scheduled health ping that executes an active database query every 3 days,
So that the Supabase Free Tier project never enters dormancy or pauses before the Pro upgrade gate is executed.

**Acceptance Criteria:**

**Given** the Next.js application deployed to the staging/production environment,
**When** a `GET` request is made to `/api/health`,
**Then** the route handler executes a lightweight active query against PostgreSQL (`SELECT 1 FROM areas LIMIT 1;`), asserting live database read capability.
**And** if the query succeeds, the endpoint returns HTTP 200 `{ status: "ok", timestamp: "...", db_latency_ms: 45 }`.
**And** if the database is unreachable or query errors, the endpoint returns HTTP 503 `{ status: "unhealthy", error: "Database unreachable" }`.
**And** a scheduled GitHub Actions workflow (`.github/workflows/keep-alive.yml`) is configured to run every 3 days (`0 4 */3 * *`), issuing an authenticated request with secret header `x-health-token` to `/api/health`.
**And** if the keep-alive ping receives a non-200 response or times out (5000ms), the workflow retries once after 60 seconds; if still failing, it immediately dispatches an urgent alert to the platform administrator's Telegram channel via the Telegram Bot API (`Story 3.5` pipeline).
**And** synthetic monitoring test `tests/integration/health-check.test.ts` asserts that `/api/health` returns valid JSON with database connectivity status and responds in < 300ms.

### Story 7.4: Automated Database and Storage Photo Backup Procedures

As a platform administrator,
I want scripted, automated backup procedures for both the PostgreSQL database schema/data and the Supabase Storage photo bucket,
So that platform data can be restored with zero data loss in the event of an outage, corruption, or catastrophic failure.

**Acceptance Criteria:**

**Given** the operational Supabase environment containing verified provider records, taxonomy, audit logs, and uploaded work photos,
**When** the automated weekly backup workflow (`.github/workflows/weekly-backup.yml`) triggers every Sunday at 02:00 UTC,
**Then** `scripts/backup-db.sh` executes `pg_dump` via direct PostgreSQL connection string, creating a compressed, AES-256 encrypted, timestamped archive (`fixnear-db-backup-YYYY-MM-DD.sql.gz`).
**And** `scripts/backup-storage.sh` invokes the Supabase Storage API using `SUPABASE_SERVICE_ROLE_KEY` to synchronize all objects in the `provider-photos` bucket, producing an encrypted archive of all original WebP images and metadata.
**And** backup archives are transferred to secure offsite secondary storage with a 30-day retention lifecycle policy.
**And** disaster recovery runbook `docs/disaster-recovery.md` documents step-by-step restoration verification: restoring schema and data into an isolated test instance, verifying foreign keys and triggers (`fn_enforce_provider_column_protection`), and verifying storage asset access.
**And** backup completion status, archive sizes, and hash digests are posted to the admin Telegram channel with a success/failure summary.

### Story 7.5: Admin Operational Metrics Dashboard & Image Optimization Usage Monitor

As the platform administrator (Dhanushka),
I want a simple, high-visibility operational metrics view in `/admin/metrics` and a monitor for monthly Next.js image optimization limits,
So that I can track pilot adoption, identify unmet service demand across Negombo, and ensure hosting bandwidth stays safely within free tier limits.

**Acceptance Criteria:**

**Given** an authenticated platform administrator accessing `/admin/metrics`,
**When** the metrics dashboard loads,
**Then** it renders three clear operational summary panels:
  1. **Active Providers Count:** Total approved listings broken down by primary service category (AC, Refrigerator, Washing Machine, Electrical, Plumbing) and base area (Negombo, Katunayake, Kochchikade, Seeduwa).
  2. **WhatsApp Contact Inquiries:** Approximate unique daily contacts per provider and per area over the trailing 7, 14, and 30 days, aggregated from `contact_events` with explanatory tooltip noting that shared mobile IPs make figures approximate.
  3. **Unmet Search Demand:** Top search queries and category/area combinations that yielded zero matching providers over the trailing 30 days (`zero_result_searches`), highlighting specific technician shortages across the pilot corridor.
**And** **Host Image Optimization Usage Monitor:** Displays the current monthly count of optimized images generated by Next.js Image Optimization against the host free tier ceiling (1,000 images/month on Vercel Hobby), displaying green (< 600), amber (600–850), and red (> 850) warning badges to prevent unexpected billing overages or service throttling.
**And** the page is protected by admin session verification (`admin_users` table check) and server-side authorization; unauthorized users are redirected to `/admin/login`.
**And** all aggregation queries execute in under 1.5 seconds using indexed columns on `contact_events`, `zero_result_searches`, and `providers`.

### Story 7.6: Supabase Pro Upgrade Gate, Latency Verification & Production Hardening

As the system architect and product owner,
I want a documented, verified upgrade protocol and network latency audit for upgrading Supabase from Free to Pro ($25/month) prior to public marketing,
So that the platform eliminates inactivity pausing, enables daily point-in-time recovery (PITR), and guarantees sub-120ms API response times across Sri Lanka.

**Acceptance Criteria:**

**Given** the Negombo pilot reaches 20 verified approved providers OR 7 days prior to commencing public consumer marketing,
**When** the Supabase Pro Upgrade Gate protocol (`docs/supabase-pro-upgrade.md`) is initiated,
**Then** the following operational steps are executed and verified:
  1. Supabase organization upgraded to Pro tier ($25/month), disabling automated project inactivity pausing.
  2. Point-in-Time Recovery (PITR) enabled with a 7-day continuous backup retention window.
  3. Database compute confirmed in `ap-south-1` (Mumbai) with connection pooling enabled via Supabase PgBouncer / Supavisor.
**And** automated latency benchmark script `scripts/benchmark-latency.ts` executes 50 sequential queries against the live backend from Dialog and SLT residential/mobile connections in Sri Lanka:
  - Asserts median round-trip database query latency is ≤ 100ms.
  - Asserts 95th percentile TTFB on public server-rendered directory pages is ≤ 350ms.
**And** production environment hardening checklist verifies:
  - Staging and production Supabase projects use completely separate databases, storage buckets, and API keys.
  - Custom domain (`fixnear.lk` or designated domain) configured with automated SSL/TLS certificates and HSTS headers.
  - Vercel Hobby tier confirmed acceptable for staging and non-commercial pilot, with commercial upgrade trigger documented if traffic expands.

### Story 7.7: Comprehensive WCAG 2.1 AA Accessibility & Touch Target Audit

As an inclusive product team,
I want an automated and manual accessibility audit across all public, provider, and admin interfaces,
So that elderly users, low-vision citizens, and blue-collar technicians with varying digital literacy can use FixNear effortlessly.

**Acceptance Criteria:**

**Given** all application pages across public directory (`/`, `/[area]`, `/[area]/[service]`, `/provider/[id]`), provider portal (`/register`, `/provider/login`, `/provider/dashboard`), and admin portal (`/admin/review`, `/admin/taxonomy`, `/admin/metrics`),
**When** automated accessibility testing executes via Axe-core / Pa11y in CI (`tests/a11y/accessibility.test.ts`),
**Then** zero WCAG 2.1 Level A or AA violations are detected across all routes.
**And** **Touch Target Floor (NFR-101 & UX-DR8):** Every interactive control (category cards, filter chips, accordion triggers, button CTAs, form inputs, photo thumbnails, modal close buttons) maintains a minimum bounding box of 44px × 44px (`min-h-[44px] min-w-[44px]`) with adequate tap spacing.
**And** **Typography & Contrast (NFR-103):** All input fields and body text use a base font size of ≥ 16px to prevent automatic iOS Safari viewport zooming; contrast ratios meet or exceed 4.5:1 for standard text and 3.0:1 for large headings and icons against `#F8F9FA` and `#FFFFFF` backgrounds.
**And** **Zero Hover Reliance (NFR-102):** All interactive features, filters, tooltips, and disclosures are fully operable via single tap without hover-dependent tooltips or hover-only buttons.
**And** **Keyboard & Screen Reader Navigation:** All modal dialogs (WhatsApp bottom sheet, photo lightbox, admin reject modal) implement accessible ARIA roles (`role="dialog"`, `aria-modal="true"`), proper focus trapping, escape key dismissal, and return focus to triggering elements upon closing.

### Story 7.8: Mobile Network Performance Audit (3G/4G Throttling & LCP < 2.5s)

As a customer on a slow prepaid mobile connection in Negombo,
I want directory pages and provider profiles to load in under 2.5 seconds with low data consumption,
So that I can find an emergency technician even with poor cell signal or limited data quota.

**Acceptance Criteria:**

**Given** the deployed staging environment accessed over simulated mobile network conditions,
**When** Lighthouse mobile audits execute using "Slow 4G" and "Fast 3G" throttling presets (1.6 Mbps down, 750 Kbps up, 150ms RTT),
**Then** core Web Vitals meet strict performance thresholds:
  - **Largest Contentful Paint (LCP):** ≤ 2.5 seconds on directory search (`/[area]/[service]`) and provider profile (`/provider/[id]`).
  - **Cumulative Layout Shift (CLS):** ≤ 0.1 (zero layout shift or content jumping during photo or badge rendering).
  - **Total Blocking Time (TBT):** ≤ 200ms on mobile CPU emulation.
**And** initial page weight for public directory results is ≤ 500KB total transfer size (excluding lazy-loaded gallery images).
**And** all images utilize Next.js `<Image>` with explicit width/height dimensions, modern WebP/AVIF delivery formats, and `loading="lazy"` on thumbnails below the initial mobile fold.
**And** JavaScript payload for anonymous public browsing contains zero provider dashboard or admin bundles (verified via `@next/bundle-analyzer`).

### Story 7.9: Negombo Corridor Pilot Field Verification & Merchant Smoke Testing

As the product owner and developer team,
I want an on-the-ground smoke test with 15–25 real technicians across Negombo, Katunayake, Kochchikade, and Seeduwa,
So that we validate real WhatsApp deep-linking, workshop location accuracy, and technician comprehension before public announcement.

**Acceptance Criteria:**

**Given** the staging/pilot platform populated with 15 to 25 real onboarded technicians across core pilot categories (Air Conditioner, Refrigerator, Washing Machine, Electrical Wiring, Plumbing) in the 4 launch areas,
**When** on-the-ground field verification is conducted with technicians and pilot test users using everyday Android (e.g., Samsung Galaxy A-series, Xiaomi Redmi) and iOS devices over Dialog and Mobitel cellular networks,
**Then** the complete customer-to-technician journey is tested and verified:
  1. Searching for a specific repair service in Negombo displays the verified technician with correct badges and visiting fee.
  2. Tapping "Contact on WhatsApp" opens the bottom sheet; tapping "Continue to WhatsApp" launches the native WhatsApp mobile app directly into a chat with the technician's real phone number.
  3. Pre-filled WhatsApp message correctly displays customer's name, requested sub-service, and area without encoding artifacts (e.g., no raw `%20` or broken characters).
  4. The contact click increments the provider's daily contact count in `contact_events` with zero customer PII logged.
**And** for Tier 1 providers ("Has physical workshop"), the listed address and landmark directions are confirmed accurate by visiting or cross-checking on Google Maps.
**And** technician usability feedback on the 4-step registration wizard and dashboard is collected and documented in `docs/pilot-feedback.md`.
**And** zero critical blocking bugs remain open before authorization to transition from pilot testing to public marketing.

### Story 7.10: Privacy Policy, Terms of Use & Provider Consent Wording

As a website visitor or registering technician,
I want clear, accessible Privacy Policy and Terms of Use pages with transparent provider consent disclosures,
So that I understand exactly how data (public WhatsApp number, contact clicks, photo storage) is handled with zero ambiguity.

**Acceptance Criteria:**

**Given** a visitor or provider browsing FixNear,
**When** they visit `/privacy` or `/terms` (accessible from the universal footer across all public, provider, and admin pages),
**Then** the page renders plain conversational English adhering to `NFR-401` without legal jargon:
  - **Privacy Policy:** Discloses that FixNear stores zero customer personal information during directory browsing or WhatsApp handoffs; contact clicks use anonymous salted daily hashes (`contact_events`) to record approximate daily lead counts; explains that provider business details, workshop address (if provided), and WhatsApp numbers are published publicly in the directory.
  - **Terms of Use:** Clarifies that FixNear is an unmonetized pilot discovery directory connecting consumers directly with independent local technicians via WhatsApp; FixNear does not intermediate transactions, quote jobs, or guarantee workmanship; outlines honest representation requirements for technicians (accurate pricing models, authentic workshop photos, no deceptive claims).
**And** on the Provider Registration Wizard (`/register` Step 1 & Step 4), a clear, mandatory consent checkbox appears: *"I agree to the Terms of Use and acknowledge that my WhatsApp mobile number and business details will be publicly displayed on FixNear."*
**And** the registration submit button remains disabled until the consent checkbox is checked.
**And** both policy pages meet full mobile responsiveness, sub-2.5s LCP (`NFR-201`), and WCAG 2.1 AA accessibility standards (`NFR-103`).

### Story 7.11: Provider Account Deletion & Listing Pause Lifecycle

As an authenticated provider,
I want the ability to pause my listing or permanently delete my account and associated data directly from my dashboard settings,
So that I maintain full sovereignty over my public presence and stored assets.

**Acceptance Criteria:**

**Given** an authenticated provider on `/provider/dashboard/settings`,
**When** they choose the "Pause Listing" option,
**Then** Server Action invokes PostgreSQL `SECURITY DEFINER` RPC `fn_toggle_provider_listing_pause(p_provider_id := session.user.id, p_paused := TRUE)` using the **user-scoped client** (`src/lib/supabase/server.ts`), passing the provider ID originating strictly from the verified session:
  - Inside `fn_toggle_provider_listing_pause`, the function strictly validates `auth.uid() IS NOT NULL AND auth.uid() = p_provider_id` (raising PostgreSQL error `P0001` / `Unauthorized` if mismatched), preventing any caller from altering another provider's listing.
  - Updates `providers.status` from `'approved'` to `'paused'` while preserving `is_verified = true`.
  - While `status = 'paused'`, edits to WhatsApp Phone Number and Business Name are strictly disabled in the UI with helper message *"Resume your listing first to edit critical contact details."* Direct transition `paused → pending_reverification` is prohibited by the state machine.
  - Next.js cache revalidation (`revalidatePath` and `revalidateTag`) immediately evicts the provider from public directory search, category landing pages, and sitemap; direct profile visits return HTTP 404 to anonymous visitors.
  - Toggling "Resume Listing" invokes `fn_toggle_provider_listing_pause(p_provider_id := session.user.id, p_paused := FALSE)` using the **user-scoped client** (`src/lib/supabase/server.ts`):
    - Asserts that current status is `'paused'`; if the listing was suspended by an administrator (`status = 'suspended'`), the RPC strictly refuses execution with PostgreSQL error `P0003` (*"Listing has been suspended by administration and cannot be resumed by the provider. Please contact FixNear on WhatsApp."*).
    - When valid, transitions status back to `'approved'`, restoring public directory visibility and revalidating public cache paths immediately without requiring administrative re-review.
**And** when they initiate "Delete Account", the interface presents an accessible confirmation modal (`role="dialog"`, `aria-modal="true"`) requiring the provider to type their business name to confirm permanent removal.
**And** confirming deletion invokes Server Action `deleteProviderAccountAction` using the service role (`supabaseAdmin`):
  1. **Step (a) - Storage Deletion:** Lists and deletes all work photo files in Supabase Storage bucket `provider-photos` under path `${auth.uid()}/*` via `supabaseAdmin.storage.from('provider-photos').remove(...)`.
     - *Failure Behavior:* Storage failure stops the action before any database change (this is not a single distributed transaction across storage and database; storage deletion runs first, and if it fails or times out, the Server Action immediately halts without modifying any database records, returning an actionable error: *"Unable to delete photo assets. Deletion stopped before any data changes; please try again."*).
  2. **Step (b) - Database Deletion & Anonymisation:** The Server Action executes pre-deletion blocklist evaluation in Node.js before calling the database:
     - If the provider is marked permanently rejected (`is_permanently_rejected = true`) OR is currently suspended (`status = 'suspended'`), the Server Action computes `p_phone_hash = crypto.createHmac('sha256', process.env.PHONE_BLOCKLIST_SECRET).update(providers.phone_number).digest('hex')`. If neither condition applies, `p_phone_hash = NULL`.
     - The Server Action then calls PostgreSQL `SECURITY DEFINER` RPC `fn_anonymise_and_delete_provider_data(p_provider_id := session.user.id, p_phone_hash := p_phone_hash)` using the **service-role client** (`supabaseAdmin` from `src/lib/supabase/admin.ts`) within an atomic transaction.
     - **RPC Permissions & Session Sourcing:** `p_provider_id` comes strictly from the verified session (`session.user.id`). Permissions are locked down with `REVOKE EXECUTE ON FUNCTION fn_anonymise_and_delete_provider_data FROM PUBLIC, anon, authenticated; GRANT EXECUTE ON FUNCTION fn_anonymise_and_delete_provider_data TO service_role;` so it can only be invoked by trusted server actions.
     - Inside the RPC transaction:
       - If `p_phone_hash IS NOT NULL`, inserts `(p_phone_hash, 'Blocked upon account deletion of suspended or permanently rejected provider', p_provider_id)` into `phone_blocklist`, permanently preventing re-registration.
       - Updates `contact_events`, setting `provider_id = NULL` for all events associated with `p_provider_id`, permanently anonymising conversion metrics while preserving aggregate platform analytics.
       - Deletes all rows in `work_photos`, `provider_services`, `provider_areas`, and `providers`.
     - *Failure Behavior:* If the RPC fails, the database transaction rolls back completely; storage deletion is idempotent and benign.
  3. **Step (c) - Auth Identity Deletion & Session Invalidation:** Calls `supabaseAdmin.auth.admin.deleteUser(auth.uid())` to permanently purge the Supabase Auth identity, destroys session cookies, and evicts all Next.js cached routes.
     - *Failure Behavior & Orphan Cleanup:* If `deleteUser` fails after step (b), the database record is already gone, preventing any profile access. An automated periodic maintenance worker (`.github/workflows/cleanup-orphans.yml`) identifies and purges any `auth.users` records without matching rows in `providers`.
  - Redirects the provider to the homepage with a confirmation toast: *"Your account and data have been permanently deleted."*
**And** automated integration test `tests/integration/account-deletion.test.ts` asserts that pausing hides public visibility while preserving verification, resumption refuses suspended listings, storage failure aborts before DB mutations, and deletion completely removes storage photos, database records, and auth session.

### Story 7.12: Operational Runbook: Backup Admin, Review Queue Staleness & Platform Upgrade Triggers

As the platform maintainer and administrator (Dhanushka),
I want a documented operational runbook covering secondary admin provisioning, review queue SLA monitoring, and formal infrastructure upgrade trigger dates,
So that platform operations remain resilient, predictable, and free from single-point-of-failure bottlenecks.

**Acceptance Criteria:**

**Given** operational documentation located at `docs/operations-runbook.md`,
**When** platform operators consult the runbook,
**Then** it provides actionable, step-by-step procedures across four operational domains:
  1. **Secondary / Backup Admin Account Management:**
     - Step-by-step procedure for provisioning a secure secondary administrator in `admin_users` table using a dedicated migration/seed script with distinct credentials.
     - Outlines emergency recovery steps if the primary administrator loses access or credentials expire.
  2. **Review Queue Staleness & Escalation Protocol:**
     - Reaffirms the standard 12-hour review turnaround target from the PRD.
     - Establishes 48 hours strictly as the stale-queue escalation threshold: automated daily check via GitHub Action (`.github/workflows/queue-monitor.yml`) inspects `providers` table for any application where `submitted_at < NOW() - INTERVAL '48 hours'`.
     - If stale applications exist, dispatches an urgent escalation reminder with direct review links to **both** administrators (primary and secondary/backup channels).
     - Provides a standardized polite WhatsApp check-in template for contacting the technician if verification is stalled or contact info is unconfirmed.
  3. **Infrastructure Tier Upgrade Schedule & Trigger Gates:**
     - **Supabase Pro Upgrade ($25/mo):** Triggered when active approved listings reach 20 providers OR 7 calendar days prior to launching public consumer marketing campaigns in Negombo; documents instructions for enabling 7-day PITR, disabling inactivity pause, and activating compute scaling.
     - **Vercel Pro Upgrade ($20/mo):** Triggered when monthly image optimization usage reaches 850 of the 1,000 free Hobby quota (monitored in `Story 7.5`), or when multi-region bandwidth exceeds Hobby allowances.
  4. **Vercel Plan-Terms Compliance Verification:**
     - Mandates a formal audit to verify against Vercel's current terms of service before public launch (noting that the Negombo pilot operates as an unmonetized, non-commercial directory without listing fees, transaction cuts, or paid ads).
     - Establishes a mandatory commercial upgrade gate: if monetization, paid listings, premium search placement, or sponsor banners are introduced in Phase 2, FixNear must upgrade to Vercel Pro ($20/seat/month) before launching commercial features.
**And** all script references, environment variable requirements, and emergency contacts are documented with zero hardcoded secret values.





