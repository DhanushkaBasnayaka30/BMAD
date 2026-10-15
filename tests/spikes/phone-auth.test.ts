import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// 1. Cascading environment loading: standard .env, overridden by .env.local
const envStandardPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envStandardPath)) {
  dotenv.config({ path: envStandardPath });
}
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

// 2. Secret and Identifier Masking Helpers (Never leak credentials, tokens, or raw PII)
export function maskIdentifier(identifier?: string): string {
  if (!identifier) return 'undefined';
  if (identifier.includes('@')) {
    const [local, domain] = identifier.split('@');
    if (local.length <= 4) return `***@${domain}`;
    return `${local.substring(0, 3)}***${local.substring(local.length - 2)}@${domain}`;
  }
  if (identifier.length <= 6) return '********';
  return `${identifier.substring(0, 5)}***${identifier.substring(identifier.length - 3)}`;
}

export function maskSecret(secret?: string): string {
  if (!secret) return 'undefined';
  if (secret.length <= 8) return '********';
  return `${secret.substring(0, 3)}...${secret.substring(secret.length - 3)} (length: ${secret.length})`;
}

export function maskUrl(urlString?: string): string {
  if (!urlString) return 'undefined';
  try {
    const parsed = new URL(urlString);
    const hostParts = parsed.hostname.split('.');
    if (hostParts.length >= 3) {
      const maskedSubdomain = hostParts[0].substring(0, 3) + '***';
      return `${parsed.protocol}//${maskedSubdomain}.${hostParts.slice(1).join('.')}`;
    }
    return `${parsed.protocol}//${parsed.hostname.substring(0, 3)}***`;
  } catch {
    return 'invalid-url-format';
  }
}

export function phoneToSyntheticEmail(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (!digits) {
    throw new Error('Invalid phone number: phone string contains no digits');
  }
  if (digits.startsWith('0')) {
    digits = '94' + digits.slice(1);
  }
  return `${digits}@fixnear.invalid`;
}

export async function listAllUsers(adminClient: SupabaseClient): Promise<User[]> {
  const allUsers: User[] = [];
  const perPage = 100;
  let page = 1;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      throw new Error(`Failed to list users on page ${page}: ${error.message}`);
    }
    const users = data?.users ?? [];
    allUsers.push(...users);

    if (users.length < perPage || !data.nextPage) {
      break;
    }
    page = data.nextPage;
  }

  return allUsers;
}

describe('Story 1.2: Pre-Implementation Phone Authentication Integration Spike Gate', () => {
  let supabaseAdmin: SupabaseClient;
  let supabaseAnon: SupabaseClient;
  const trackedUserIds = new Set<string>();

  // Test data (RFC 2606 reserved .invalid domain & fake Sri Lankan E.164 phone numbers)
  const fakePhone1 = '+94770000001';
  const fakePhone2 = '+94770000002';
  const fakePhone3 = '+94770000003';
  const initialPassword = 'InitialSpikePassword123!';
  const wrongPassword = 'WrongSpikePassword999!';
  const updatedPassword = 'UpdatedSpikePassword456!';

  let sharedTestUser: User | null = null;
  let directPhoneAuthSupported = false;
  let syntheticEmailFallbackSupported = false;

  before(async () => {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    assert.ok(rawUrl, 'NEXT_PUBLIC_SUPABASE_URL must be defined');
    assert.ok(anonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined');
    assert.ok(serviceRoleKey, 'SUPABASE_SERVICE_ROLE_KEY must be defined');

    const supabaseUrl = rawUrl.replace(/\/+$/, '');

    // Initialize unpersisted clients
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    supabaseAnon = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    console.log('\n--- Spike Initialized ---');
    console.log(`Supabase URL: ${maskUrl(supabaseUrl)}`);
    console.log(`Anon Key: ${maskSecret(anonKey)}`);
    console.log(`Service Role Key: ${maskSecret(serviceRoleKey)}`);

    // Clean up any stale spike test users before running with full pagination
    const allUsers = await listAllUsers(supabaseAdmin);
    for (const user of allUsers) {
      const email = user.email || '';
      const phone = user.phone || '';
      if (
        email.endsWith('@fixnear.invalid') ||
        phone.startsWith('+9477000000') ||
        phone.startsWith('077000000')
      ) {
        const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        if (delError) {
          console.warn(`[Warning] Failed to delete stale test user ${user.id}: ${delError.message}`);
        }
      }
    }
  });

  after(async () => {
    console.log('\n--- Guaranteed Teardown Execution ---');
    for (const userId of trackedUserIds) {
      const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (delError) {
        console.warn(`[Warning] Failed to delete test user ${userId}: ${delError.message}`);
      }
    }
    trackedUserIds.clear();

    // Verify residual test users count across all pages
    const remainingUsers = await listAllUsers(supabaseAdmin);
    const residualTestUsers = remainingUsers.filter((user) => {
      const email = user.email || '';
      const phone = user.phone || '';
      return (
        email.endsWith('@fixnear.invalid') ||
        phone.startsWith('+9477000000') ||
        phone.startsWith('077000000')
      );
    });

    console.log(`Remaining test users: ${residualTestUsers.length}`);
    assert.equal(residualTestUsers.length, 0, 'Residual test users count in Supabase Auth must be 0');
  });

  it('Unit: phoneToSyntheticEmail canonicalizes local Sri Lankan numbers and rejects empty inputs', () => {
    // International E.164
    assert.equal(phoneToSyntheticEmail('+94770000001'), '94770000001@fixnear.invalid');
    // Local 0-prefixed number
    assert.equal(phoneToSyntheticEmail('0770000001'), '94770000001@fixnear.invalid');
    // Formatted local number with whitespace and hyphens
    assert.equal(phoneToSyntheticEmail('077 123 4567'), '94771234567@fixnear.invalid');
    assert.equal(phoneToSyntheticEmail('077-123-4567'), '94771234567@fixnear.invalid');
    // Empty or non-digit inputs throw
    assert.throws(() => phoneToSyntheticEmail(''), /no digits/i);
    assert.throws(() => phoneToSyntheticEmail('   '), /no digits/i);
    assert.throws(() => phoneToSyntheticEmail('abc-xyz'), /no digits/i);
  });

  it('Scenario 1: Direct Phone Auth Probe - probes direct phone creation and login behavior without SMS provider', async () => {
    console.log(`\nProbing Direct Phone Auth with fake phone: ${maskIdentifier(fakePhone1)}...`);

    // 1. Create user with direct phone and phone_confirm: true via Admin API
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      phone: fakePhone1,
      password: initialPassword,
      phone_confirm: true,
    });

    if (createError) {
      console.log(`[Diagnostic] Direct phone user creation rejected: ${createError.message} (status: ${createError.status})`);
      directPhoneAuthSupported = false;
      return;
    }

    assert.ok(createData?.user?.id, 'Direct phone user created with ID');
    trackedUserIds.add(createData.user.id);

    // 2. Attempt client-side password authentication using phone number
    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      phone: fakePhone1,
      password: initialPassword,
    });

    if (signInError) {
      console.log(`[Diagnostic] Direct phone signInWithPassword rejected: "${signInError.message}" (status: ${signInError.status})`);
      console.log(`[Diagnostic] Direct phone login without SMS provider is NOT supported by current Supabase Auth configuration.`);
      directPhoneAuthSupported = false;
    } else {
      console.log(`[Diagnostic] Direct phone signInWithPassword succeeded without SMS gateway.`);
      assert.ok(signInData?.session, 'Session issued for direct phone login');
      directPhoneAuthSupported = true;
    }

    // Clean up Scenario 1 probe user and check error directly
    const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(createData.user.id);
    if (delError) {
      console.warn(`[Warning] Failed to delete Scenario 1 test user ${createData.user.id}: ${delError.message}`);
    } else {
      trackedUserIds.delete(createData.user.id);
    }
  });

  it('Scenario 2: Synthetic Email Fallback Probe - verifies RFC 2606 synthetic email creation and password login', async () => {
    const syntheticEmail = phoneToSyntheticEmail(fakePhone2);
    console.log(`\nProbing Synthetic Email Fallback: ${maskIdentifier(syntheticEmail)}...`);

    // 1. Create user with synthetic email and email_confirm: true via Admin API
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: syntheticEmail,
      password: initialPassword,
      email_confirm: true,
      user_metadata: { phone: fakePhone2 },
    });

    assert.equal(createError, null, `Admin createUser for synthetic email failed: ${createError?.message}`);
    assert.ok(createData?.user?.id, 'User record must be returned with an ID');

    sharedTestUser = createData.user;
    trackedUserIds.add(sharedTestUser.id);

    // 2. Authenticate using synthetic email and password via Anon client
    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email: syntheticEmail,
      password: initialPassword,
    });

    assert.equal(signInError, null, `Synthetic email signInWithPassword failed: ${signInError?.message}`);
    assert.ok(signInData?.session, 'Session must be returned upon successful authentication');
    assert.ok(signInData.session.access_token, 'Access token must be present');
    assert.equal(signInData.user.id, sharedTestUser.id, 'Authenticated user ID must match created user ID');

    syntheticEmailFallbackSupported = true;
    console.log('✅ Synthetic email creation and password login succeeded cleanly without email sending.');

    // Gate assertion: either direct phone or synthetic email must succeed
    assert.ok(
      directPhoneAuthSupported || syntheticEmailFallbackSupported,
      'Either Direct Phone Auth or Synthetic Email Fallback must be supported by the Supabase project'
    );
  });

  it('Scenario 3: Invalid Password Rejection - asserts wrong credentials are strictly rejected', async () => {
    assert.ok(sharedTestUser, 'Shared test user must exist from Scenario 2');
    const syntheticEmail = phoneToSyntheticEmail(fakePhone2);

    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email: syntheticEmail,
      password: wrongPassword,
    });

    assert.equal(signInData.session, null, 'Session must not be issued for invalid password');
    assert.ok(signInError, 'Auth error must be returned for invalid password');
    assert.equal(signInError.status, 400, 'Supabase Auth must return HTTP 400 for invalid password');
    assert.match(
      signInError.message,
      /Invalid login credentials/i,
      'Error message must indicate invalid login credentials'
    );
    console.log('✅ Invalid password strictly rejected with HTTP 400 and zero session issued.');
  });

  it('Scenario 4: Duplicate Identifier Collision - asserts registration with existing identifier is blocked', async () => {
    assert.ok(sharedTestUser, 'Shared test user must exist from Scenario 2');
    const syntheticEmail = phoneToSyntheticEmail(fakePhone2);

    const { data: dupData, error: dupError } = await supabaseAdmin.auth.admin.createUser({
      email: syntheticEmail,
      password: initialPassword,
      email_confirm: true,
    });

    assert.equal(dupData.user, null, 'Duplicate user must not be created');
    assert.ok(dupError, 'Admin createUser must reject duplicate identifier');
    assert.equal(dupError.status, 422, 'Duplicate creation must return HTTP 422 conflict status');
    assert.match(
      dupError.message,
      /already been registered/i,
      'Error message must state user already registered'
    );
    console.log('✅ Duplicate registration collision strictly blocked with HTTP 422.');
  });

  it('Scenario 5: Admin Password Reset - validates updateUserById password update and old password invalidation', async () => {
    assert.ok(sharedTestUser, 'Shared test user must exist from Scenario 2');
    const syntheticEmail = phoneToSyntheticEmail(fakePhone2);

    // 1. Admin updates user password via updateUserById
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      sharedTestUser.id,
      { password: updatedPassword }
    );

    assert.equal(updateError, null, `Admin updateUserById password reset failed: ${updateError?.message}`);
    assert.ok(updateData.user, 'Updated user must be returned');

    // 2. Validate login succeeds with the NEW password
    const { data: newLoginData, error: newLoginError } = await supabaseAnon.auth.signInWithPassword({
      email: syntheticEmail,
      password: updatedPassword,
    });

    assert.equal(newLoginError, null, `Login with updated password failed: ${newLoginError?.message}`);
    assert.ok(newLoginData?.session, 'Session must be issued with new password');

    // 3. Validate login fails with the OLD password
    const { data: oldLoginData, error: oldLoginError } = await supabaseAnon.auth.signInWithPassword({
      email: syntheticEmail,
      password: initialPassword,
    });

    assert.equal(oldLoginData.session, null, 'Session must not be issued for old password');
    assert.ok(oldLoginError, 'Old password must be rejected');
    assert.equal(oldLoginError.status, 400, 'Old password rejection must return HTTP 400');
    console.log('✅ Admin password reset via updateUserById verified: new password succeeds, old password rejected.');
  });

  it('Scenario 6: Identifier Migration - validates updateUserById identifier update and old identifier invalidation', async () => {
    assert.ok(sharedTestUser, 'Shared test user must exist from Scenario 2');
    const oldSyntheticEmail = phoneToSyntheticEmail(fakePhone2);
    const newSyntheticEmail = phoneToSyntheticEmail(fakePhone3);

    // 1. Admin migrates the identifier via updateUserById
    const { data: migData, error: migError } = await supabaseAdmin.auth.admin.updateUserById(
      sharedTestUser.id,
      {
        email: newSyntheticEmail,
        email_confirm: true,
        user_metadata: { phone: fakePhone3 },
      }
    );

    assert.equal(migError, null, `Identifier migration failed: ${migError?.message}`);
    assert.equal(migData.user.email, newSyntheticEmail, 'User email must match new synthetic email');

    // 2. Validate login succeeds with the NEW identifier
    const { data: newMigLogin, error: newMigError } = await supabaseAnon.auth.signInWithPassword({
      email: newSyntheticEmail,
      password: updatedPassword,
    });

    assert.equal(newMigError, null, `Login with new identifier failed: ${newMigError?.message}`);
    assert.ok(newMigLogin?.session, 'Session must be issued for new migrated identifier');

    // 3. Validate login fails with the OLD identifier
    const { data: oldMigLogin, error: oldMigError } = await supabaseAnon.auth.signInWithPassword({
      email: oldSyntheticEmail,
      password: updatedPassword,
    });

    assert.equal(oldMigLogin.session, null, 'Session must not be issued for old identifier');
    assert.ok(oldMigError, 'Old identifier must be rejected');
    assert.equal(oldMigError.status, 400, 'Old identifier rejection must return HTTP 400');
    console.log('✅ Identifier migration verified: new identifier succeeds, old identifier rejected.');
  });

  it('Scenario 7: Guaranteed Teardown & Residual Verification - asserts 0 residual test users remain in Supabase Auth', async () => {
    // Delete all tracked test users
    for (const userId of Array.from(trackedUserIds)) {
      const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (delError) {
        console.warn(`[Warning] Failed to delete test user ${userId}: ${delError.message}`);
      } else {
        trackedUserIds.delete(userId);
      }
    }

    // Query all users with full pagination to assert zero residual spike users remain
    const remainingUsers = await listAllUsers(supabaseAdmin);
    const residualTestUsers = remainingUsers.filter((user) => {
      const email = user.email || '';
      const phone = user.phone || '';
      return (
        email.endsWith('@fixnear.invalid') ||
        phone.startsWith('+9477000000') ||
        phone.startsWith('077000000')
      );
    });

    console.log(`Remaining test users: ${residualTestUsers.length}`);
    assert.equal(residualTestUsers.length, 0, 'Residual test users count in Supabase Auth must be 0');
  });
});
