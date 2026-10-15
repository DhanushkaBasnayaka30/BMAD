---
title: 'Story 1.1: Provision Supabase Project in ap-south-1 & Secrets Verification'
type: 'feature'
created: '2026-10-15'
status: 'done'
baseline_commit: 'd6acc3659c256e0c31dd4d7a2bc7d328b476513f'
route: 'dispatch'
review_loop_iteration: 0
context:
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/implementation-artifacts/epic-1-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The application requires a low-latency database and auth platform hosted in region `ap-south-1` (Mumbai) with validated environment credentials, but currently lacks project dependency initialization, a standardized environment variable template, and an automated connectivity verification script.

**Approach:** Establish `.env.local.example` with standard dummy placeholders, confirm `.gitignore` excludes real credentials from git tracking, initialize `package.json` with `@supabase/supabase-js`, `dotenv`, and `tsx`, and implement a secure verification script that asserts active Supabase connectivity using standard variable names without exposing or logging live secrets.

## Boundaries & Constraints

**Always:**
- Keep `.env.local` and any `.env*` files (except `.env.local.example`) strictly uncommitted and excluded by `.gitignore`.
- Reference only standard environment variable names: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
- Never log, print, or expose raw secrets, auth tokens, or connection strings in script stdout, test output, or git commits. Mask all sensitive values.
- Verify connectivity for both the anon client and service role client.

**Never:**
- Do not create database migrations or table schemas yet (strictly scoped to Story 1.5).
- Do not initialize the full Next.js monolith layout or UI components yet (strictly scoped to Story 1.3 & 1.4).
- Do not inspect or read real `.env.local` files using AI agents or tools.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Valid credentials in `.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` set and valid | Script outputs masked configuration status, verifies anon and service-role connectivity, and exits code 0 | N/A |
| Missing environment variable | One or more required variables undefined | Script outputs specific missing variable name(s) and remediation instructions, exits code 1 | Exits 1 with descriptive error |
| Invalid Supabase URL or network failure | Unreachable or malformed URL | Script catches network error and logs failure without dumping sensitive config, exits code 1 | Exits 1 with masked connection error |
| Invalid Service Role Key | Service role key malformed or rejected by Supabase API | Script catches authentication error from Supabase Admin API and logs failure without printing key, exits code 1 | Exits 1 with Supabase auth error message |

</frozen-after-approval>

## Code Map

- `.gitignore` -- Ensures `.env*` files remain ignored while explicitly allowing `.env.local.example`.
- `.env.local.example` -- Canonical template documenting all required environment variables with dummy values.
- `package.json` -- Project package manifest containing dependencies (`@supabase/supabase-js`, `dotenv`, `tsx`) and `verify:supabase` script.
- `scripts/verify-supabase.ts` -- Secure TypeScript verification script that loads environment variables, tests Supabase connectivity, and prints masked status.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- Initialize root package file with `@supabase/supabase-js`, `dotenv`, and `tsx` dev dependencies and add script `verify:supabase` -- Provides runtime and script harness for Supabase operations without prematurely scaffolding the full Next.js monolith.
- [x] `.env.local.example` -- Create canonical environment template with dummy placeholders for Supabase, Turnstile, Telegram, and app secrets -- Documents required configuration for developers while preventing secret leakage.
- [x] `.gitignore` -- Confirm and preserve exclusion of `.env*` with exception for `!.env.local.example` -- Guarantees secret isolation at the version control boundary.
- [x] `scripts/verify-supabase.ts` -- Implement active connectivity check validating both anon client reachability and service-role administrative API access with masked logging -- Satisfies AC requirement for active Supabase connectivity verification.

**Acceptance Criteria:**
- Given a newly created Supabase project hosted in region `ap-south-1` (Mumbai), when project environment variables are defined per `.env.local.example` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), then `npm run verify:supabase` executes and verifies active connectivity to Supabase using only the standard variable names without requiring AI agents or tools to inspect or log real `.env.local` files.
- Given the workspace git configuration, when executing `git status` and `git check-ignore`, then `.gitignore` confirms `.env*` files (except `.env.local.example`) are uncommitted and excluded from version control.

## Implementation Notes

- Initialized `package.json` with `@supabase/supabase-js` (2.49.1), `dotenv` (16.4.7), `tsx` (4.19.3), and TypeScript (5.8.2).
- Added `verify:supabase` and `test:unit` scripts in `package.json`.
- Created `.env.local.example` documenting all required environment variables with dummy placeholders and no real secrets.
- Verified `.gitignore` actively excludes `.env*` files (tested `.env.local` and `.env.local.save`) while tracking `.env.local.example`.
- Created `scripts/verify-supabase.ts` which loads `.env.local`, masks sensitive keys, verifies anon connectivity via `auth.getSession()`, verifies service-role admin connectivity via `auth.admin.listUsers()`, and tests REST gateway responsiveness.
- Created `tests/unit/verify-supabase.test.ts` covering all 4 scenarios from the I/O & Edge-Case Matrix. All 4 unit tests ran and passed (100% pass rate).
- Verified `npm run verify:supabase` runs successfully against the live Supabase project in ap-south-1.

## Spec Change Log

## Review Triage Log

| Finding ID | Layer | Finding | Verdict | Evidence / Disposition |
|---|---|---|---|---|
| VG-1 | verification-gap | Anon client check does not perform active network verification; REST 401 only logged as info | medium | Verified: `getSession()` is local-only; REST ping was non-fatal. Routed to patch to verify anon key with real network request. |
| VG-2 | verification-gap | Key leakage assertions in test inspect only `stderr`, ignoring `stdout` | low | Verified: `maskString` output goes to stdout via `console.log`. Routed to patch to inspect both stdout and stderr. |
| ECH-1 | edge-case-hunter | Trailing slash on `NEXT_PUBLIC_SUPABASE_URL` creates double slashes in REST ping URL | low | Verified: URL interpolation could create `//rest/v1/`. Routed to patch: strip trailing slashes. |
| ECH-2 | edge-case-hunter | Fetch calls lack AbortSignal timeout | low | Verified: Network stalls could hang the script. Routed to patch: add `AbortSignal.timeout(10000)`. |
| ECH-3 | edge-case-hunter | REST gateway error does not exit process with code 1 | medium | Duplicate of VG-1. Routed to patch. |
| ECH-4 | edge-case-hunter | Admin `listUsers` property access unsafe if users array is null | low | Verified: Safe navigation `data?.users?.length ?? 0` prevents potential crash. Routed to patch. |
| ECH-5 | edge-case-hunter | Scenario 4 test lacks URL fallback when run without `.env.local` | medium | Verified: Test runner in isolated CI needs fallback or mock. Routed to patch. |
| BH-1 | blind-hunter | Anon client lacks network verification | medium | Duplicate of VG-1. Routed to patch. |
| BH-2 | blind-hunter | REST check does not fail on HTTP error | medium | Duplicate of VG-1. Routed to patch. |
| BH-3 | blind-hunter | Unit tests lack isolation without live `.env.local` | low | Verified: Add hermetic fallback for CI test execution. Routed to patch. |
| BH-4 | blind-hunter | Scenario 4 test fails on missing URL when `.env.local` is absent | medium | Duplicate of ECH-5. Routed to patch. |
| BH-5 | blind-hunter | Hardcoded `/tmp` breaks cross-platform execution on Windows | low | Verified: Using `os.tmpdir()` is cross-platform. Routed to patch. |
| BH-6 | blind-hunter | Verification script lacks modular exports | low | Verified: Exporting `maskString`, `maskUrl`, `verifySupabase` aids testing. Routed to patch. |
| BH-7 | blind-hunter | Missing `tsconfig.json` and `typecheck` script | low | Verified: Adding `tsconfig.json` and `"typecheck": "tsc --noEmit"` ensures compile verification. Routed to patch. |
| BH-8 | blind-hunter | Spec status is `in-review` while sprint-status.yaml is `in-progress` | false | Refuted: Per step-04 instructions, sprint status syncs during lifecycle transitions. |
| BH-9 | blind-hunter | `maskUrl` truncates custom port or localhost | low | Verified: Preserving port and IP format improves local dev experience. Routed to patch. |
| BH-10 | blind-hunter | Unpopulated placeholder detection from `.env.local.example` | low | Verified: Early error for placeholder values (`your-project-ref`, `dummy_anon_key`) is helpful. Routed to patch. |
| BH-11 | blind-hunter | Cascade environment loading (.env overridden by .env.local) | low | Verified: Loading `.env` then `.env.local` matches Next.js cascading behavior. Routed to patch. |

## Design Notes

The verification script `scripts/verify-supabase.ts` will:
1. Load environment variables using `dotenv` with path `.env.local` (falling back to process environment).
2. Validate the presence of `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
3. Mask the Supabase host (e.g. `https://***.supabase.co`) and verify URL format.
4. Test anon client connectivity by calling `supabase.auth.getSession()` or REST ping.
5. Test admin client connectivity by invoking `supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 })` to verify the `SUPABASE_SERVICE_ROLE_KEY`.
6. Print clean, masked confirmation output and exit with code 0.

## Verification

**Commands:**
- `npm run verify:supabase` -- expected: Output confirms connectivity for anon and service-role clients, exits 0.
- `git check-ignore -v .env.local` -- expected: Shows `.gitignore` matches `.env*`.
- `git status --porcelain` -- expected: Confirms `.env.local` is untracked and excluded.
