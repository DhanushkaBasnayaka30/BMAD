import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import tailwindConfig from '../../tailwind.config';
import { cn } from '../../src/lib/utils';

test('Next.js 15 Monolith Scaffolding & Design System', async (t) => {
  await t.test('Scenario 2: Design Token & Typography Export from tailwind.config.ts', () => {
    const theme = tailwindConfig.theme?.extend;
    assert.ok(theme, 'Theme extension must be defined in tailwind.config.ts');

    const colors = theme.colors as Record<string, string>;
    assert.ok(colors, 'Theme colors must be defined');

    // Surface colors
    assert.equal(colors['surface-base'], '#F8F9FA');
    assert.equal(colors['surface-raised'], '#FFFFFF');
    assert.equal(colors['surface-sunken'], '#EDF0F2');

    // Ink colors
    assert.equal(colors['ink-primary'], '#0F172A');
    assert.equal(colors['ink-secondary'], '#475569');
    assert.equal(colors['ink-muted'], '#94A3B8');
    assert.equal(colors['ink-inverse'], '#FFFFFF');

    // Brand colors
    assert.equal(colors['primary'], '#0F2942');
    assert.equal(colors['primary-hover'], '#1B3A5B');
    assert.equal(colors['primary-subtle'], '#EBF2F7');
    assert.equal(colors['accent-amber'], '#D97706');
    assert.equal(colors['accent-amber-subtle'], '#FEF3C7');
    assert.equal(colors['whatsapp'], '#25D366');
    assert.equal(colors['whatsapp-hover'], '#1EBE5D');
    assert.equal(colors['whatsapp-text'], '#075E54');

    // Border colors
    assert.equal(colors['border-subtle'], '#E2E8F0');
    assert.equal(colors['border-strong'], '#CBD5E1');

    // Status colors
    assert.equal(colors['status-success'], '#15803D');
    assert.equal(colors['status-success-subtle'], '#DCFCE7');
    assert.equal(colors['status-warning'], '#B45309');
    assert.equal(colors['status-warning-subtle'], '#FEF3C7');
    assert.equal(colors['status-error'], '#B91C1C');
    assert.equal(colors['status-error-subtle'], '#FEE2E2');

    // Spacing & Touch targets
    const spacing = theme.spacing as Record<string, string>;
    assert.ok(spacing, 'Spacing scale must be defined');
    assert.equal(spacing['touch-target'], '44px');
    assert.equal(spacing['1'], '4px');
    assert.equal(spacing['12'], '48px');

    // Typography ramp
    const fontSize = theme.fontSize as Record<string, [string, { lineHeight: string; fontWeight: string }]>;
    assert.ok(fontSize, 'FontSize scale must be defined');
    assert.equal(fontSize['display'][0], '28px');
    assert.equal(fontSize['heading-1'][0], '22px');
    assert.equal(fontSize['heading-2'][0], '18px');
    assert.equal(fontSize['heading-3'][0], '16px');
    assert.equal(fontSize['body'][0], '16px');
    assert.equal(fontSize['meta'][0], '14px');
    assert.equal(fontSize['badge'][0], '12px');

    // Border radius
    const borderRadius = theme.borderRadius as Record<string, string>;
    assert.ok(borderRadius, 'BorderRadius scale must be defined');
    assert.equal(borderRadius['sm'], '4px');
    assert.equal(borderRadius['md'], '8px');
    assert.equal(borderRadius['lg'], '12px');
    assert.equal(borderRadius['full'], '9999px');

    // Font family with Sinhala & Tamil fallbacks
    const fontFamily = theme.fontFamily as Record<string, string[]>;
    assert.ok(fontFamily?.base, 'Base font family must be defined');
    assert.ok(fontFamily.base.includes('"Iskoola Pota"'), 'Sinhala font fallback Iskoola Pota must be included');
    assert.ok(fontFamily.base.includes('"Latha"'), 'Tamil font fallback Latha must be included');
  });

  await t.test('Scenario 3: Server-Only Static Guardrail on Privileged Services', async () => {
    const servicePath = path.resolve(process.cwd(), 'src/services/canary.service.ts');
    assert.ok(fs.existsSync(servicePath), 'canary.service.ts must exist');

    const content = fs.readFileSync(servicePath, 'utf-8');
    const lines = content.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('//'));
    assert.equal(lines[0], "import 'server-only';", "First line of privileged service must be import 'server-only';");

    // Dynamic assertion: importing server-only in standard Node.js (client / non-react-server) strictly throws
    const { spawnSync } = await import('node:child_process');
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', 'import "server-only";']);
    assert.notEqual(result.status, 0, 'server-only must fail outside react-server environment');
    assert.match(
      result.stderr.toString(),
      /This module cannot be imported from a Client Component module/,
      'server-only must produce descriptive client import error'
    );

    // In react-server environment, canaryService executes and produces typed response
    const { canaryService } = await import('../../src/services/canary.service');
    const serviceRes = await canaryService();
    assert.equal(serviceRes.status, 'ok');
    assert.equal(serviceRes.source, 'canary-service');
    assert.ok(serviceRes.timestamp);
  });

  await t.test('Scenario 4: Class Name Merging Utility (cn) & Token Conflict Resolution', () => {
    const result = cn('bg-surface-base text-ink-primary', false && 'hidden', 'p-4');
    assert.equal(result, 'bg-surface-base text-ink-primary p-4');

    const overridden = cn('p-2', 'p-4');
    assert.equal(overridden, 'p-4');

    // Verify custom font-size is not dropped when combined with custom ink color
    const typographyAndColor = cn('text-heading-1', 'text-ink-primary');
    assert.ok(typographyAndColor.includes('text-heading-1'), 'Custom font size text-heading-1 must not be dropped by text-ink-primary');
    assert.ok(typographyAndColor.includes('text-ink-primary'), 'text-ink-primary must be preserved');
  });

  await t.test('Scenario 4b: QueryProvider Server-Side Rendering & QueryClient Integration', async () => {
    const { spawnSync } = await import('node:child_process');
    const script = `
      import React from 'react';
      import { renderToString } from 'react-dom/server';
      import { QueryProvider } from './src/components/providers/QueryProvider';
      import { useQueryClient } from '@tanstack/react-query';

      function TestConsumer() {
        const client = useQueryClient();
        return React.createElement('div', null, client ? 'query-client-initialized' : 'failed');
      }

      const html = renderToString(React.createElement(QueryProvider, null, React.createElement(TestConsumer)));
      if (!html.includes('query-client-initialized')) {
        process.exit(1);
      }
    `;
    const result = spawnSync('npx', ['tsx', '-e', script], {
      cwd: process.cwd(),
      encoding: 'utf-8',
    });
    assert.equal(result.status, 0, `QueryProvider SSR test failed: ${result.stderr}`);
  });

  await t.test('Scenario 5: End-to-End Canary Slice Contracts and Action Execution', async () => {
    // Check canary action declaration
    const actionPath = path.resolve(process.cwd(), 'src/actions/canary.action.ts');
    assert.ok(fs.existsSync(actionPath), 'canary.action.ts must exist');
    const actionContent = fs.readFileSync(actionPath, 'utf-8');
    const actionLines = actionContent.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('//'));
    assert.equal(actionLines[0], "'use server';", "First line of Server Action must be 'use server';");
    assert.ok(actionContent.includes("import { canaryService } from '@/services/canary.service';"), 'Action must delegate to canaryService');

    // Check canary hook declaration
    const hookPath = path.resolve(process.cwd(), 'src/hooks/use-canary.ts');
    assert.ok(fs.existsSync(hookPath), 'use-canary.ts must exist');
    const hookContent = fs.readFileSync(hookPath, 'utf-8');
    const hookLines = hookContent.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('//'));
    assert.equal(hookLines[0], "'use client';", "First line of TanStack hook must be 'use client';");
    assert.ok(hookContent.includes("import { canaryAction } from '@/actions/canary.action';"), 'Hook must wrap canaryAction');
    assert.ok(hookContent.includes("useQuery"), 'Hook must use TanStack useQuery');

    // Runtime execution: invoke canaryAction directly
    const { canaryAction } = await import('../../src/actions/canary.action');
    const actionRes = await canaryAction();
    assert.equal(actionRes.success, true);
    assert.equal(actionRes.data?.status, 'ok');
    assert.equal(actionRes.data?.source, 'canary-service');
  });

  await t.test('Layering Directories Existence', () => {
    const requiredDirs = [
      'src/types',
      'src/services',
      'src/actions',
      'src/hooks',
      'src/components',
      'src/components/ui',
      'src/components/providers',
      'src/app/(public)',
      'src/app/(provider)',
      'src/app/(provider)/provider',
      'src/app/(admin)',
      'src/app/(admin)/admin',
    ];

    for (const dir of requiredDirs) {
      assert.ok(fs.existsSync(path.resolve(process.cwd(), dir)), `Directory ${dir} must exist`);
    }
  });

  await t.test('Scenario 6: Route Group Isolation & Portal URL Hierarchy', async () => {
    // Provider pages must be placed under src/app/(provider)/provider/ to resolve to /provider/*
    const providerDashboard = path.resolve(process.cwd(), 'src/app/(provider)/provider/dashboard/page.tsx');
    assert.ok(fs.existsSync(providerDashboard), 'Provider dashboard page must exist under src/app/(provider)/provider/dashboard/page.tsx');

    const mismatchedProviderDashboard = path.resolve(process.cwd(), 'src/app/(provider)/dashboard');
    assert.ok(!fs.existsSync(mismatchedProviderDashboard), 'src/app/(provider)/dashboard must not exist (would mismatch to /dashboard)');

    // Admin pages must be placed under src/app/(admin)/admin/ to resolve to /admin/*
    const adminDashboard = path.resolve(process.cwd(), 'src/app/(admin)/admin/dashboard/page.tsx');
    assert.ok(fs.existsSync(adminDashboard), 'Admin dashboard page must exist under src/app/(admin)/admin/dashboard/page.tsx');

    const mismatchedAdminDashboard = path.resolve(process.cwd(), 'src/app/(admin)/dashboard');
    assert.ok(!fs.existsSync(mismatchedAdminDashboard), 'src/app/(admin)/dashboard must not exist (would collide with /dashboard)');

    // Public pages must resolve to /
    const publicPage = path.resolve(process.cwd(), 'src/app/(public)/page.tsx');
    assert.ok(fs.existsSync(publicPage), 'Public page must exist under src/app/(public)/page.tsx');

    // If production build artifacts exist, verify compiled route bindings in app-path-routes-manifest.json
    const manifestPath = path.resolve(process.cwd(), '.next/app-path-routes-manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      assert.equal(
        manifest['/(provider)/provider/dashboard/page'],
        '/provider/dashboard',
        'Provider dashboard route must resolve to /provider/dashboard'
      );
      assert.equal(
        manifest['/(provider)/dashboard/page'],
        undefined,
        'Old /dashboard route must not exist in provider routes'
      );
      assert.equal(
        manifest['/(admin)/admin/dashboard/page'],
        '/admin/dashboard',
        'Admin dashboard route must resolve to /admin/dashboard'
      );
      assert.equal(
        manifest['/(public)/page'],
        '/',
        'Public root route must resolve to /'
      );
    }

    // If Next.js build output exists, run live server check verifying /provider/dashboard returns 200 and /dashboard returns 404
    const buildIdPath = path.resolve(process.cwd(), '.next/BUILD_ID');
    if (fs.existsSync(buildIdPath)) {
      const { spawn } = await import('node:child_process');
      const server = spawn('npx', ['next', 'start', '-p', '0']);
      let port: string | undefined;

      const readyPromise = new Promise<string>((resolve, reject) => {
        server.stdout.on('data', (data: Buffer) => {
          const text = data.toString();
          const match = text.match(/http:\/\/localhost:(\d+)/);
          if (match) {
            port = match[1];
            resolve(port);
          }
        });
        server.on('error', reject);
        server.on('exit', (code) => {
          if (code !== 0 && !port) reject(new Error(`Next start exited with code ${code}`));
        });
      });

      try {
        const assignedPort = await readyPromise;
        const resProvider = await fetch(`http://localhost:${assignedPort}/provider/dashboard`);
        assert.equal(resProvider.status, 200, '/provider/dashboard must return HTTP 200');
        const providerHtml = await resProvider.text();
        assert.ok(providerHtml.includes('Provider Dashboard'), 'Provider dashboard page must render content');

        const resDashboard = await fetch(`http://localhost:${assignedPort}/dashboard`);
        assert.equal(resDashboard.status, 404, '/dashboard must return HTTP 404');
      } finally {
        server.kill();
      }
    }
  });
});

