import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import os from 'node:os';
import dotenv from 'dotenv';
import { maskString, maskUrl, isPlaceholderValue } from '../../scripts/verify-supabase.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const execFileAsync = promisify(execFile);
const scriptPath = path.resolve(process.cwd(), 'scripts/verify-supabase.ts');
const tempDir = os.tmpdir();

describe('Supabase Environment & Connectivity Verification', () => {
  it('Unit: maskString masks sensitive strings and reports length', () => {
    assert.equal(maskString(undefined), 'undefined');
    assert.equal(maskString('short'), '********');
    const masked = maskString('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_secret');
    assert.match(masked, /^eyJ\.\.\.ret \(length: 49\)$/);
  });

  it('Unit: maskUrl masks subdomains while preserving protocol and ports', () => {
    assert.equal(maskUrl(undefined), 'undefined');
    assert.equal(maskUrl('invalid-url'), 'invalid-url-format');
    assert.equal(maskUrl('https://abcdefghijk.supabase.co'), 'https://abc***.supabase.co');
    assert.equal(maskUrl('http://127.0.0.1:54321'), 'http://127***.0.0.1:54321');
  });

  it('Unit: isPlaceholderValue correctly identifies template strings', () => {
    assert.equal(isPlaceholderValue('https://your-project-ref.supabase.co'), true);
    assert.equal(isPlaceholderValue('eyJ...dummy_anon_key'), true);
    assert.equal(isPlaceholderValue('https://realproject.supabase.co'), false);
  });

  it('Scenario 1 (Happy Path): verifies active connectivity with valid credentials without leaking secrets', async () => {
    const { stdout, stderr } = await execFileAsync('npx', ['tsx', scriptPath], {
      cwd: process.cwd(),
      env: process.env,
    });

    assert.match(stdout, /NEXT_PUBLIC_SUPABASE_URL: Configured/);
    assert.match(stdout, /NEXT_PUBLIC_SUPABASE_ANON_KEY: Configured/);
    assert.match(stdout, /SUPABASE_SERVICE_ROLE_KEY: Configured/);
    assert.match(stdout, /Anon Client: Connected and authenticated successfully/);
    assert.match(stdout, /Admin Service Role: Authenticated successfully/);
    assert.match(stdout, /🎉 All Supabase environment variables and connections verified!/);
    assert.equal(stderr, '');

    // Critical invariant: assert raw secrets are NEVER present in stdout or stderr
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      assert.doesNotMatch(stdout, new RegExp(process.env.SUPABASE_SERVICE_ROLE_KEY));
      assert.doesNotMatch(stderr, new RegExp(process.env.SUPABASE_SERVICE_ROLE_KEY));
    }
  });

  it('Scenario 2 (Missing Env): fails when required environment variables are missing', async () => {
    let failed = false;
    try {
      await execFileAsync('npx', ['tsx', scriptPath], {
        cwd: tempDir, // cross-platform temp directory without .env.local
        env: {
          PATH: process.env.PATH,
          NODE_ENV: 'test',
        },
      });
    } catch (err: any) {
      failed = true;
      assert.equal(err.code, 1);
      assert.match(err.stderr, /Missing required environment variable/);
      assert.match(err.stderr, /NEXT_PUBLIC_SUPABASE_URL/);
    }
    assert.equal(failed, true, 'Script should exit with code 1 when env vars are missing');
  });

  it('Scenario 3 (Invalid URL): fails cleanly on malformed or unreachable URL', async () => {
    let failed = false;
    try {
      await execFileAsync('npx', ['tsx', scriptPath], {
        cwd: tempDir,
        env: {
          PATH: process.env.PATH,
          NODE_ENV: 'test',
          NEXT_PUBLIC_SUPABASE_URL: 'https://non-existent-project-000000.supabase.co',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: 'valid-format-anon-key-that-will-not-match',
          SUPABASE_SERVICE_ROLE_KEY: 'valid-format-service-role-key-that-will-not-match',
        },
      });
    } catch (err: any) {
      failed = true;
      assert.equal(err.code, 1);
      assert.match(err.stderr, /connection failed/i);
      // Ensure raw keys are not leaked in stdout or stderr
      assert.doesNotMatch(err.stderr, /valid-format-anon-key/);
      assert.doesNotMatch(err.stdout, /valid-format-anon-key/);
      assert.doesNotMatch(err.stderr, /valid-format-service-role-key/);
      assert.doesNotMatch(err.stdout, /valid-format-service-role-key/);
    }
    assert.equal(failed, true, 'Script should exit with code 1 on unreachable URL');
  });

  it('Scenario 4 (Invalid Anon Key): fails when anon key is rejected by Supabase API', async () => {
    let failed = false;
    const testUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://non-existent-proj.supabase.co';
    const testServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key';

    try {
      await execFileAsync('npx', ['tsx', scriptPath], {
        cwd: tempDir,
        env: {
          PATH: process.env.PATH,
          NODE_ENV: 'test',
          NEXT_PUBLIC_SUPABASE_URL: testUrl,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: 'invalid.anon.key.that.will.fail',
          SUPABASE_SERVICE_ROLE_KEY: testServiceRoleKey,
        },
      });
    } catch (err: any) {
      failed = true;
      assert.equal(err.code, 1);
      assert.match(err.stderr, /Anon Client connection failed/);
      // Ensure invalid key is masked and not printed to either stdout or stderr
      assert.doesNotMatch(err.stderr, /invalid\.anon\.key/);
      assert.doesNotMatch(err.stdout, /invalid\.anon\.key/);
    }
    assert.equal(failed, true, 'Script should exit with code 1 on invalid anon key');
  });

  it('Scenario 5 (Invalid Service Role Key): fails when admin service-role authentication is rejected', async () => {
    let failed = false;
    const testUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://non-existent-proj.supabase.co';
    const testAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';

    try {
      await execFileAsync('npx', ['tsx', scriptPath], {
        cwd: tempDir,
        env: {
          PATH: process.env.PATH,
          NODE_ENV: 'test',
          NEXT_PUBLIC_SUPABASE_URL: testUrl,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: testAnonKey,
          SUPABASE_SERVICE_ROLE_KEY: 'invalid.service.role.key.that.will.fail',
        },
      });
    } catch (err: any) {
      failed = true;
      assert.equal(err.code, 1);
      assert.match(err.stderr, /Admin Service Role connection failed|Anon Client connection failed/);
      // Ensure invalid key is masked and not printed to either stdout or stderr
      assert.doesNotMatch(err.stderr, /invalid\.service\.role\.key/);
      assert.doesNotMatch(err.stdout, /invalid\.service\.role\.key/);
    }
    assert.equal(failed, true, 'Script should exit with code 1 on invalid service role key');
  });

  it('Scenario 6 (Placeholder Detection): fails when template placeholders are left unchanged', async () => {
    let failed = false;
    try {
      await execFileAsync('npx', ['tsx', scriptPath], {
        cwd: tempDir,
        env: {
          PATH: process.env.PATH,
          NODE_ENV: 'test',
          NEXT_PUBLIC_SUPABASE_URL: 'https://your-project-ref.supabase.co',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOi...dummy_anon_key',
          SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOi...dummy_service_role_key',
        },
      });
    } catch (err: any) {
      failed = true;
      assert.equal(err.code, 1);
      assert.match(err.stderr, /Placeholder detected/);
    }
    assert.equal(failed, true, 'Script should exit with code 1 on placeholder values');
  });
});
