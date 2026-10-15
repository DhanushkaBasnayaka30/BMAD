---
title: 'Story 1.2: Pre-Implementation Phone Authentication Integration Spike Gate'
type: 'feature'
created: '2026-10-15'
status: 'done'
baseline_commit: '6caa5a49495cdfbb30a6b3d3dae59d8ddfbb952e'
route: 'dispatch'
review_loop_iteration: 0
context:
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/implementation-artifacts/epic-1-context.md
  - _bmad-output/planning-artifacts/architecture/architecture-fixnear-2026-10-14/ARCHITECTURE-SPINE.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Provider onboarding in Epic 2 and identity lifecycles in Epics 3 and 6 require a robust, mobile-first credential pipeline. Building UI forms, Server Actions, and identity-edit guardrails without experimentally proving Supabase Auth behavior on the live project risks blocked development, SMS cost traps, and breaking schema changes.

**Approach:** Implement an automated integration spike (`tests/spikes/phone-auth.test.ts`) against the live Supabase instance using only `auth.admin.createUser` with confirmation flags set to `true`. Determine whether Direct Phone Auth or RFC 2606 Synthetic Email (`<digits>@fixnear.invalid`) is supported without an SMS gateway, and rigorously validate wrong-password rejection, duplicate-number collision, admin password reset (`updateUserById`), and identifier migration (`updateUserById`). Enforce hermetic teardown in an `after` hook asserting 0 residual test users, ensure zero credential leakage in logs, and formally record the architectural gate decisions for Epic 2, Story 3.4, Story 6.4, and Story 6.6 in `gate-phone-auth-pipeline.md`.

## Boundaries & Constraints

**Always:**
- Load credentials strictly from `.env.local` (with `.env` fallback) within the test harness using standard variable names (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- Mask all URLs, keys, and identifiers in test output; never log, expose, or print raw secrets, passwords, or full JWT tokens (print masked formats or boolean assertion results only).
- Create all test users strictly via `supabaseAdmin.auth.admin.createUser` with `phone_confirm: true` or `email_confirm: true` to prevent triggering third-party SMS delivery.
- Use obviously fake Sri Lankan E.164 test phone numbers (e.g. `+94770000001`, `+94770000002`, `+94770000003`).
- For synthetic email fallback tests, use the RFC 2606 reserved `.invalid` top-level domain (`<digits>@fixnear.invalid`).
- Guarantee teardown execution in a `finally` block or `after` hook that deletes all created test users and verifies that 0 test users remain in Supabase Auth.
- Formally record the outcome in `gate-phone-auth-pipeline.md` detailing exact SDK signatures, observed limits, and impacts on Epic 2, Story 3.4, Story 6.4, and Story 6.6.

**Never:**
- Never call client-side `supabase.auth.signUp()` with a phone number (avoids initiating SMS gateway attempts).
- Never configure, mock, or call external commercial SMS gateways (Twilio, Vonage, etc.).
- Never leave orphaned test users in the live Supabase Auth database.
- Never modify PostgreSQL schema or build UI forms/routes in this story (strictly scoped to Stories 1.5 and Epic 2).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| 1. Direct Phone Auth Probe | Test fake phone (`+94770000001`), password, `phone_confirm: true` | Probes `admin.createUser` and `signInWithPassword({ phone, password })`. Records whether direct phone login succeeds without SMS gateway | If rejected due to missing SMS provider, catches error and records refusal diagnostic |
| 2. Synthetic Email Fallback Probe | Fake phone converted to `<digits>@fixnear.invalid`, `email_confirm: true`, `user_metadata.phone` | Probes `admin.createUser` and `signInWithPassword({ email, password })`. Confirms whether synthetic email functions cleanly without email confirmation | If both direct phone and synthetic email fail, suite fails with actionable diagnostics |
| 3. Invalid Password Rejection | Registered test user, incorrect password | `signInWithPassword` rejects authentication with error status (e.g., HTTP 400 / `Invalid login credentials`) and no session issued | Asserts rejection error matches expected Supabase Auth failure |
| 4. Duplicate Identifier Collision | Attempt to create second user with existing phone (or synthetic email) | `admin.createUser` returns an error indicating user already exists (duplicate conflict) | Catches duplicate error and asserts user collision is prevented |
| 5. Admin Password Reset | Registered test user, new password applied via `auth.admin.updateUserById(userId, { password: newPassword })` | Admin update succeeds; login with new password succeeds; login with old password fails | Catches update or login failures |
| 6. Identifier Migration | Registered test user, new fake identifier applied via `auth.admin.updateUserById` | Admin update changes phone / synthetic email; login with new identifier succeeds; login with old identifier fails | Catches migration or login failures |
| 7. Guaranteed Teardown & Residual Verification | Any test passes, fails, or throws | `after` hook deletes all tracked test user IDs via `admin.deleteUser()`; queries remaining users; prints and asserts remaining test users count is `0` | If cleanup of an individual user fails, logs masked warning without masking root failure |

</frozen-after-approval>

## Code Map

- `package.json` -- Add `"test:spike": "tsx --test tests/spikes/**/*.test.ts"` script.
- `tests/spikes/phone-auth.test.ts` -- Automated integration spike executing all 7 lifecycle and boundary scenarios against live Supabase project with safe env loading, zero token logging, and hermetic teardown.
- `_bmad-output/planning-artifacts/architecture/gate-phone-auth-pipeline.md` -- Architectural decision record capturing the verified option, exact SDK calls, limits discovered, and downstream impact on Epic 2, Story 3.4, Story 6.4, and Story 6.6.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- Add `"test:spike"` script to run spike tests with `tsx --test` -- Standardizes spike execution command across environments.
- [x] `tests/spikes/phone-auth.test.ts` -- Implement integration spike testing direct phone auth vs synthetic email fallback, wrong password rejection, duplicate collision, admin password reset (`updateUserById`), identifier migration (`updateUserById`), and hermetic teardown -- Validates complete credential lifecycle against live Supabase instance without SMS gateway.
- [x] `tests/spikes/phone-auth.test.ts` -- Execute `npm run test:spike` and assert all lifecycle tests pass and 0 residual test users remain in Supabase Auth -- Proves implementation against live backend.
- [x] `_bmad-output/planning-artifacts/architecture/gate-phone-auth-pipeline.md` -- Record formal decision document with winning pipeline, exact SDK calls, discovered limits, and binding requirements for Epic 2, Story 3.4, Story 6.4, and Story 6.6 -- Satisfies ARCH-3 and AD-3 gating requirement.

**Acceptance Criteria:**
- Given the live Supabase project configured in Story 1.1, when `npm run test:spike` executes, then it asserts whether Direct Phone Auth succeeds or Synthetic Email Fallback (`<digits>@fixnear.invalid`) is required without calling external SMS providers.
- Given whichever authentication option succeeds, when the spike suite runs, then it validates:
  1. Login with an incorrect password is strictly rejected with an auth error.
  2. Registration of an already-existing identifier is strictly rejected as a duplicate.
  3. Admin password reset via `auth.admin.updateUserById` updates credentials so the new password succeeds and old password fails.
  4. Updating the login identifier via `auth.admin.updateUserById` allows login with the new identifier and invalidates the old identifier.
- Given any test outcome, when the test suite concludes, then all created test users are deleted in an `after` hook and the test reports and asserts that `0` test users remain in Supabase Auth.
- Given the test runner execution, then keys and tokens are loaded directly from `.env.local` with zero raw secrets, passwords, or tokens printed to logs.
- Given the completed spike results, then `_bmad-output/planning-artifacts/architecture/gate-phone-auth-pipeline.md` records the confirmed option, exact SDK method calls, observed constraints, and binding impact on Epic 2 (Provider Onboarding & Auth), Story 3.4 (Listing Approval & Re-verification), Story 6.4 (Critical Identity Edit & Phone Re-verification), and Story 6.6 (Mandatory Temporary Password Reset).

## Implementation Notes

- Added script `"test:spike": "tsx --test tests/spikes/**/*.test.ts"` to `package.json`.
- Implemented `tests/spikes/phone-auth.test.ts` covering all 7 lifecycle and boundary scenarios against live Supabase instance (`ap-south-1` Mumbai):
  - Scenario 1 (Direct Phone Auth Probe): Observed that `auth.admin.createUser({ phone, phone_confirm: true })` succeeds, but `signInWithPassword({ phone, password })` is strictly rejected with HTTP 422: `"Phone logins are disabled"` because Supabase Cloud requires an SMS gateway configured.
  - Scenario 2 (Synthetic Email Fallback Probe): Validated that `auth.admin.createUser({ email: '<digits>@fixnear.invalid', email_confirm: true, user_metadata: { phone } })` and `signInWithPassword({ email, password })` succeed cleanly without email sending or SMS gateways.
  - Scenario 3 (Wrong Password Rejection): Verified invalid password attempt is strictly rejected with HTTP 400 (`Invalid login credentials`) and no session issued.
  - Scenario 4 (Duplicate Registration Collision): Verified registering duplicate synthetic email is strictly rejected with HTTP 422 (`A user with this email address has already been registered`).
  - Scenario 5 (Admin Password Reset): Verified `auth.admin.updateUserById(userId, { password: newPassword })` succeeds; login with new password succeeds; login with old password rejected with HTTP 400.
  - Scenario 6 (Identifier Migration): Verified `auth.admin.updateUserById(userId, { email: newSyntheticEmail, email_confirm: true, user_metadata: { phone: newPhone } })` succeeds; login with new identifier succeeds; login with old identifier rejected with HTTP 400.
  - Scenario 7 (Guaranteed Teardown & Residual Verification): Deleted all tracked test users in `after` hook and asserted residual test user count is `0`.
- Authored formal architectural decision record in `_bmad-output/planning-artifacts/architecture/gate-phone-auth-pipeline.md` defining the binding standard (`<digits>@fixnear.invalid`), exact SDK signatures, and downstream contracts for Epic 2, Story 3.4, Story 6.4, and Story 6.6.

## Spec Change Log
- 2026-10-15: Completed implementation of Story 1.2 spike and formal gate documentation.

## Review Triage Log

| Finding ID | Layer | Finding | Verdict | Evidence / Disposition |
|---|---|---|---|---|
| BH-1 | blind-hunter | Missing Phone Number Canonicalization in `phoneToSyntheticEmail` | medium | Verified: Local `077...` format vs `+9477...` format produced mismatched synthetic emails. Patched: added canonicalization converting local `0` to `94` and throwing on empty digits. |
| BH-2 | blind-hunter | Unpaginated User Enumeration in Teardown and Residual Assertions | medium | Verified: GoTrue defaults to 50 users per page. Patched: implemented `listAllUsers` pagination loop traversing all pages. |
| BH-3 | blind-hunter | Tight State Mutation Coupling Across Sequential Scenarios (2–6) | low | Verified: Scenarios share `sharedTestUser` to demonstrate lifecycle progression. Kept as sequential suite; tests run in order and clean up. |
| BH-4 | blind-hunter | Duplicated Teardown Responsibility Between Scenario 7 and Suite `after` Hook | low | Verified: Both cleaned up users. Patched: Scenario 7 asserts residual count and only deletes tracked users if present; `after` guarantees final sweep. |
| BH-5 | blind-hunter | Missing Error Object Guard When Throwing in `gate-phone-auth-pipeline.md` Sample | low | Verified: `throw authError` could throw null if `!authData.user`. Patched: updated sample to `throw authError || new Error(...)`. |
| BH-6 | blind-hunter | Missing Compensatory Rollback Mechanism for Split Auth/Database Mutations in ADR | low | Verified: Two-step update lacked failure recovery description. Patched: added Section 4.4 Compensatory Rollback Protocol. |
| BH-7 | blind-hunter | Missing Status Synchronization in `sprint-status.yaml` | false | Refuted: User explicitly denied write permission to `sprint-status.yaml` with system instruction prohibiting tool circumvention. |
| BH-8 | blind-hunter | Missing Shared Runtime Module for `phoneToSyntheticEmail` | false | Refuted: Scaffolding `src/` modules is strictly out of scope for Story 1.2 and explicitly assigned to Story 1.3 & Epic 2. |
| BH-9 | blind-hunter | Unaddressed Supabase Auth User Lookup Limitations in ADR | low | Verified: GoTrue does not index `user_metadata.phone`. Patched: documented in Section 3 that queries must resolve UUID via `public.providers`. |
| BH-10 | blind-hunter | Hardcoded Test Phone Prefix in Teardown Filters | low | Verified: Secondary filter checked `+9477000000`. Patched: teardown now relies primarily on `trackedUserIds` and cleans all test emails/phones. |
| ECH-1 | edge-case-hunter | `admin.deleteUser` returns `{ error }` without throwing on API failure | low | Verified: Supabase SDK returns `{ data, error }`. Patched: directly inspect `{ error }` and log warnings instead of masked `try/catch`. |
| ECH-2 | edge-case-hunter | `admin.deleteUser` probe user drops ID from `trackedUserIds` unconditionally | low | Verified: Drop occurred before confirming deletion. Patched: user ID removed from `trackedUserIds` only if `!error`. |
| ECH-3 | edge-case-hunter | `listUsers` default pagination in `tests/spikes/phone-auth.test.ts` | medium | Duplicate of BH-2. Patched via `listAllUsers`. |
| ECH-4 | edge-case-hunter | Empty digits in `phoneToSyntheticEmail` produces invalid email without local part | low | Duplicate of BH-1. Patched: throws descriptive error on empty digits. |
| ECH-5 | edge-case-hunter | ADR login sample lacks E.164 normalization for local mobile formats | low | Duplicate of BH-1. Patched: documented canonicalization requirement in ADR Section 4.1. |

## Design Notes

Per AD-3 in `ARCHITECTURE-SPINE.md`:
- Registration flow must never call client-side `signUp()`. Instead, onboarding invokes a Next.js Server Action which uses `supabaseAdmin.auth.admin.createUser` with `phone_confirm: true` (or `email_confirm: true`).
- For admin temporary password resets (Story 3.7 / 6.6), `supabaseAdmin.auth.admin.updateUserById(userId, { password: tempPassword })` sets the password, coupled with a 24-hour expiry check in application state.
- For Option A critical identity edits (Story 6.4), when a provider updates their phone number, `supabaseAdmin.auth.admin.updateUserById` updates the identity, and the listing is locked until admin re-verifies.
- The spike rigorously confirms these operational primitives before any UI or Server Actions are written.

## Verification

**Commands:**
- `npm run test:spike` -- expected: Runs `tests/spikes/phone-auth.test.ts`, completes all 7 probes, prints `Remaining test users: 0`, and exits code 0.
- `npm run typecheck` -- expected: TypeScript compiles with zero errors.
