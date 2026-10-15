---
title: 'Architectural Decision Record: Provider Phone Authentication Pipeline Gate'
status: 'accepted'
date: '2026-10-15'
binds:
  - ARCH-3
  - AD-3
  - FR-301
  - FR-302
  - FR-306
  - FR-402
affects:
  - Epic 1 (Story 1.2, Story 1.5, Story 1.7)
  - Epic 2 (Story 2.1, Story 2.2)
  - Epic 3 (Story 3.4, Story 3.7)
  - Epic 6 (Story 6.4, Story 6.6)
---

# Architectural Gate: Provider Phone Authentication Pipeline

## 1. Context & Problem Statement

FixNear connects local Sri Lankan repair technicians and workshops with customers via direct WhatsApp hand-off. Independent technicians in Sri Lanka operate mobile-first, and requiring email accounts for registration introduces high drop-off and friction.

Per **ARCH-3** and **AD-3** in the Architecture Spine, before building UI registration forms or database migrations, an isolated integration spike (`tests/spikes/phone-auth.test.ts`) was executed against the live Supabase project (`ap-south-1` Mumbai) to definitively determine whether:
1. **Direct Phone Authentication** (`auth.admin.createUser({ phone, phone_confirm: true })` + `signInWithPassword({ phone, password })`) functions on Supabase without a third-party commercial SMS gateway (Twilio, MessageBird, etc.).
2. Or **Synthetic Email Fallback** (`<digits>@fixnear.invalid` with RFC 2606 reserved `.invalid` TLD) must be adopted transparently under the hood.

---

## 2. Empirical Spike Results (`tests/spikes/phone-auth.test.ts`)

On 2026-10-15, all 7 integration probes executed against the live Supabase instance with zero mock dependencies:

| Probe Scenario | Tested Operation | Supabase API Response | Observed Verdict |
|---|---|---|---|
| **Scenario 1: Direct Phone Auth** | `auth.admin.createUser({ phone: '+94770000001', phone_confirm: true })`<br/>`signInWithPassword({ phone, password })` | `createUser`: Success (User ID issued)<br/>`signInWithPassword`: Rejected with HTTP 422: `"Phone logins are disabled"` | ❌ **Rejected**. Supabase Cloud strictly blocks phone logins unless an external commercial SMS provider is configured in project settings. |
| **Scenario 2: Synthetic Email Fallback** | `auth.admin.createUser({ email: '94770000002@fixnear.invalid', email_confirm: true, user_metadata: { phone: '+94770000002' } })`<br/>`signInWithPassword({ email, password })` | `createUser`: Success (User ID issued)<br/>`signInWithPassword`: Success (HTTP 200, valid session & JWT issued) | ✅ **Supported & Proven**. Operates with zero SMS costs, zero email delivery, and immediate session issuance. |
| **Scenario 3: Invalid Password Rejection** | `signInWithPassword({ email, password: 'WrongPassword' })` | Rejected with HTTP 400: `"Invalid login credentials"`, `session: null` | ✅ **Verified**. Strict credential enforcement with zero session leakage. |
| **Scenario 4: Duplicate Identifier Collision** | `auth.admin.createUser({ email: '94770000002@fixnear.invalid' })` | Rejected with HTTP 422: `"A user with this email address has already been registered"`, `user: null` | ✅ **Verified**. Collision prevention guaranteed at Auth layer. |
| **Scenario 5: Admin Password Reset** | `auth.admin.updateUserById(userId, { password: newPassword })` | Update: Success.<br/>Login with `newPassword`: Success (Session issued).<br/>Login with `oldPassword`: Rejected with HTTP 400. | ✅ **Verified**. Admin-assisted password reset invalidates old credentials immediately. |
| **Scenario 6: Identifier Migration** | `auth.admin.updateUserById(userId, { email: '94770000003@fixnear.invalid', email_confirm: true, user_metadata: { phone: '+94770000003' } })` | Update: Success.<br/>Login with new synthetic email: Success.<br/>Login with old synthetic email: Rejected with HTTP 400. | ✅ **Verified**. Mobile number update seamlessly migrates login identifier. |
| **Scenario 7: Guaranteed Hermetic Teardown** | `auth.admin.deleteUser(userId)` + `auth.admin.listUsers()` | All test users deleted in `after` hook. Queried residual users count: `0`. | ✅ **Verified**. Zero orphaned test users in live Supabase Auth. |

---

## 3. Decision & Binding Standard

### Formally Adopted Pipeline: **Synthetic Email Fallback (`<digits>@fixnear.invalid`)**

FixNear officially adopts the **Synthetic Email Fallback** pipeline for all provider authentication operations across Phase 1:
- The UI strictly presents **Mobile Number** and **Password** fields. Technicians are never prompted for an email address.
- Server Actions automatically normalize the E.164 phone number (`+94XXXXXXXXX`) to numerical digits and format it as:
  $$\text{synthetic\_email} = \text{digits} + \text{"@fixnear.invalid"}$$
  *(e.g., `+94 77 123 4567` $\rightarrow$ `94771234567@fixnear.invalid`)*
- RFC 2606 reserves `.invalid` as a top-level domain guaranteed never to resolve globally in DNS, ensuring zero accidental email leakage.
- Email confirmation is bypassed via `email_confirm: true` during admin user creation, eliminating SMTP delivery latency and third-party email service quotas.

> [!IMPORTANT]
> **GoTrue Metadata Lookup Limitation**:
> Supabase Auth (GoTrue engine) does not support filtering or querying users by custom `user_metadata` fields (such as `user_metadata.phone`) via client or standard admin APIs. Therefore, all application lookups by mobile number must first query `public.providers.phone_number` to obtain the provider's `auth.users.id` (UUID) or convert the phone number via `phoneToSyntheticEmail(phone)` directly to locate or authenticate the identity.

---

## 4. Exact SDK Signatures & Implementation Contracts

### 4.1 Provider Registration (Server Action in Epic 2)
```typescript
import { createClient } from '@supabase/supabase-js';
import 'server-only';

// Phone normalization helper
export function phoneToSyntheticEmail(e164Phone: string): string {
  let digits = e164Phone.replace(/\D/g, '');
  if (!digits) {
    throw new Error('Invalid phone number: phone string contains no digits');
  }
  if (digits.startsWith('0')) {
    digits = '94' + digits.slice(1);
  }
  return `${digits}@fixnear.invalid`;
}

// In registerProviderAction:
const syntheticEmail = phoneToSyntheticEmail(normalizedPhone);

const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
  email: syntheticEmail,
  password: plainPassword,
  email_confirm: true,
  user_metadata: {
    phone: normalizedPhone,
  },
});

if (authError || !authData.user) {
  // Handle duplicate conflict (HTTP 422) or generic failure
  throw authError || new Error('User creation failed: no user record returned');
}

const providerAuthId = authData.user.id;
```

### 4.2 Provider Login (`loginProviderAction` in Epic 2)
```typescript
// Client or Server Action:
const syntheticEmail = phoneToSyntheticEmail(enteredMobileNumber);

const { data, error } = await supabase.auth.signInWithPassword({
  email: syntheticEmail,
  password: enteredPassword,
});
```

### 4.3 Admin-Assisted Temporary Password Reset (Epic 3 & Epic 6)
```typescript
// In generateTempPasswordAction (Story 3.7 / 6.6):
const { data, error } = await supabaseAdmin.auth.admin.updateUserById(providerId, {
  password: generatedTempPassword,
});

// Accompanied by DB record update:
// providers.must_change_password = true
// providers.temp_password_expires_at = NOW() + INTERVAL '24 hours'
```

### 4.4 Critical Identity Edit & Phone Migration (Story 3.4 & Story 6.4)
```typescript
// In approveIdentityReverificationAction (Admin approval of phone change):
// 1. Supabase Auth FIRST:
const newSyntheticEmail = phoneToSyntheticEmail(pendingPhoneNumber);

const { data, error: authError } = await supabaseAdmin.auth.admin.updateUserById(providerId, {
  email: newSyntheticEmail,
  email_confirm: true,
  user_metadata: {
    phone: pendingPhoneNumber,
  },
});

if (authError) {
  // Halt immediately without promoting DB columns
  throw new Error(`Failed to update Auth credentials: ${authError.message}`);
}

// 2. Only after confirmed Auth update, execute DB RPC:
// const { error: dbError } = await supabaseAdmin.rpc('fn_approve_identity_reverification', {
//   p_provider_id: providerId,
// });
//
// 3. Compensatory Rollback on Database Collision:
// if (dbError) {
//   // If DB promotion fails (e.g. unique constraint uq_providers_phone_number code 23505),
//   // immediately roll back Supabase Auth credentials to the previous verified phone number:
//   const oldSyntheticEmail = phoneToSyntheticEmail(currentVerifiedPhone);
//   const { error: rollbackError } = await supabaseAdmin.auth.admin.updateUserById(providerId, {
//     email: oldSyntheticEmail,
//     email_confirm: true,
//     user_metadata: { phone: currentVerifiedPhone },
//   });
//
//   if (rollbackError) {
//     // Critical dual-write failure: flag for manual repair and alert admins
//     await supabaseAdmin.from('providers').update({ requires_manual_repair: true }).eq('id', providerId);
//     throw new Error(`Dual-write failure: DB promotion failed and Auth rollback failed (${rollbackError.message})`);
//   }
//   throw new Error(`DB promotion failed (${dbError.message}); Auth credentials safely rolled back.`);
// }
```

> [!NOTE]
> **Compensatory Rollback Protocol for Split Auth/DB Updates**:
> Because Supabase Auth (`auth.users`) and PostgreSQL application tables (`public.providers`) do not share a single ACID distributed transaction boundary, identity migration requires sequential coordination with compensatory rollback:
> 1. **Supabase Auth First**: Update `auth.users` via `supabaseAdmin.auth.admin.updateUserById`. If this call fails, abort immediately; database state remains clean and untouched.
> 2. **Database Promotion Second**: Execute `fn_approve_identity_reverification(providerId)` via service-role RPC.
> 3. **Compensatory Rollback on DB Failure**: If DB promotion fails (e.g. unique constraint collision `uq_providers_phone_number` error code `23505`), the Server Action immediately executes a compensatory rollback calling `updateUserById` to restore the original verified synthetic email and metadata, automatically marks the listing `status = 'suspended'`, and dispatches an urgent admin alert.
> 4. **Manual Repair Escalation**: If the compensatory rollback itself fails after a database failure, log full diagnostic context, dispatch urgent alerts to both administrators, and set `requires_manual_repair = true` on the provider record to halt automated workflows.

---

## 5. Downstream Impact Analysis

1. **Epic 1 (Foundation & Schema)**:
   - Story 1.5 DDL: The `providers` table requires only `phone_number VARCHAR(20) NOT NULL UNIQUE`. A separate user-visible `email` column is unnecessary.
   - Story 1.7 Seed Data: Seed provider auth users will be instantiated via `admin.createUser` using `[digits]@fixnear.invalid` and `email_confirm: true`.

2. **Epic 2 (Provider Onboarding)**:
   - Story 2.1: Binds registration logic to `phoneToSyntheticEmail(phone)` and `admin.createUser`.
   - Story 2.2: The 4-step wizard requires only mobile number and password; email field is completely omitted from the UI.
   - Anti-collision: Catches Supabase HTTP 422 and renders friendly status-aware notices (`approved`, `pending_approval`, `suspended`).

3. **Epic 3 (Admin Verification Queue)**:
   - Story 3.4 & 3.7: Admin review actions update credentials safely via `admin.updateUserById`.
   - Admin WhatsApp ping tooling links directly to `providers.phone_number`.

4. **Epic 6 (Provider Self-Management & Security)**:
   - Story 6.4: Option A re-verification lifecycle strictly migrates synthetic email identifier via `admin.updateUserById` before committing DB column promotion.
   - Story 6.6: Temporary password resets operate via `admin.updateUserById` coupled with 24-hour expiration checks.

---

## 6. Verification Status

- Automated Spike: `tests/spikes/phone-auth.test.ts`
- Command: `npm run test:spike`
- Tests: 7 passed, 0 failed, 0 orphaned users remaining.
- Architectural Gate: **PASSED & APPROVED FOR EPICS 2, 3, AND 6**.
