import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

// 1. Cascading environment variable loading (standard .env, overridden by .env.local)
const envStandardPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envStandardPath)) {
  dotenv.config({ path: envStandardPath });
}
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

export function maskString(str: string | undefined): string {
  if (!str) return 'undefined';
  if (str.length <= 8) return '********';
  return `${str.substring(0, 3)}...${str.substring(str.length - 3)} (length: ${str.length})`;
}

export function maskUrl(urlString: string | undefined): string {
  if (!urlString) return 'undefined';
  try {
    const parsed = new URL(urlString);
    const host = parsed.hostname;
    const port = parsed.port ? `:${parsed.port}` : '';
    const hostParts = host.split('.');

    if (hostParts.length >= 3) {
      const maskedSubdomain = hostParts[0].substring(0, 3) + '***';
      const domain = hostParts.slice(1).join('.');
      return `${parsed.protocol}//${maskedSubdomain}.${domain}${port}`;
    }
    return `${parsed.protocol}//${host.substring(0, 3)}***${port}`;
  } catch {
    return 'invalid-url-format';
  }
}

export function isPlaceholderValue(value: string | undefined): boolean {
  if (!value) return false;
  return (
    value.includes('your-project-ref') ||
    value.includes('dummy_anon_key') ||
    value.includes('dummy_service_role_key') ||
    value.includes('your-contact-hash-salt') ||
    value.includes('your-phone-blocklist')
  );
}

export async function verifySupabase(options?: { exitOnError?: boolean }): Promise<{ success: boolean; details?: string }> {
  const exitOnError = options?.exitOnError ?? true;

  console.log('====================================================');
  console.log('FixNear — Supabase Environment & Connectivity Verification');
  console.log('====================================================\n');

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let hasMissing = false;

  if (!rawUrl) {
    console.error('❌ Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL');
    hasMissing = true;
  } else if (isPlaceholderValue(rawUrl)) {
    console.error('❌ Placeholder detected: NEXT_PUBLIC_SUPABASE_URL contains example template value.');
    hasMissing = true;
  } else {
    console.log(`✅ NEXT_PUBLIC_SUPABASE_URL: Configured (${maskUrl(rawUrl)})`);
  }

  if (!supabaseAnonKey) {
    console.error('❌ Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
    hasMissing = true;
  } else if (isPlaceholderValue(supabaseAnonKey)) {
    console.error('❌ Placeholder detected: NEXT_PUBLIC_SUPABASE_ANON_KEY contains example template value.');
    hasMissing = true;
  } else {
    console.log(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Configured (${maskString(supabaseAnonKey)})`);
  }

  if (!supabaseServiceRoleKey) {
    console.error('❌ Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY');
    hasMissing = true;
  } else if (isPlaceholderValue(supabaseServiceRoleKey)) {
    console.error('❌ Placeholder detected: SUPABASE_SERVICE_ROLE_KEY contains example template value.');
    hasMissing = true;
  } else {
    console.log(`✅ SUPABASE_SERVICE_ROLE_KEY: Configured (${maskString(supabaseServiceRoleKey)})`);
  }

  if (hasMissing) {
    console.error('\nEnvironment validation failed. Please ensure all variables are defined in .env.local');
    if (exitOnError) process.exit(1);
    return { success: false, details: 'Environment validation failed' };
  }

  const supabaseUrl = rawUrl!.replace(/\/+$/, '');

  console.log('\n--- Testing Supabase API Connectivity ---');

  // 1. Verify Anon Client Connectivity via active request to /auth/v1/settings
  try {
    const anonStartTime = Date.now();
    const authSettingsRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey!,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!authSettingsRes.ok) {
      if (authSettingsRes.status === 401) {
        throw new Error(`Anon API key rejected (HTTP 401 Unauthorized)`);
      }
      throw new Error(`Anon endpoint responded with HTTP ${authSettingsRes.status}`);
    }

    const anonLatency = Date.now() - anonStartTime;
    console.log(`✅ Anon Client: Connected and authenticated successfully (response time: ${anonLatency}ms)`);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`❌ Anon Client connection failed: ${errorMessage}`);
    if (exitOnError) process.exit(1);
    return { success: false, details: errorMessage };
  }

  // 2. Verify Service Role Admin Client Connectivity via Auth Admin API & PostgREST
  try {
    const adminStartTime = Date.now();
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error: adminError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    if (adminError) {
      throw new Error(`Admin listUsers returned error: ${adminError.message}`);
    }

    const usersCount = data?.users ? data.users.length : 0;
    const adminLatency = Date.now() - adminStartTime;
    console.log(`✅ Admin Service Role: Authenticated successfully (response time: ${adminLatency}ms)`);
    console.log(`   (Successfully queried Supabase Auth admin API, total users returned: ${usersCount})`);

    // Verify REST gateway accepts service_role key
    const restRes = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: supabaseServiceRoleKey!,
        Authorization: `Bearer ${supabaseServiceRoleKey!}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (restRes.ok) {
      console.log(`✅ REST Gateway: Reachable and accepted service_role key (HTTP 200 OK)`);
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`❌ Admin Service Role connection failed: ${errorMessage}`);
    if (exitOnError) process.exit(1);
    return { success: false, details: errorMessage };
  }

  console.log('\n====================================================');
  console.log('🎉 All Supabase environment variables and connections verified!');
  console.log('====================================================\n');
  return { success: true };
}

// Auto-run if executed directly as a script
if (process.argv[1] && process.argv[1].endsWith('verify-supabase.ts')) {
  verifySupabase().catch((err) => {
    console.error('Fatal verification error:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
