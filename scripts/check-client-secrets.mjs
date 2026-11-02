#!/usr/bin/env node
/**
 * Fails the build when code that can reach the browser touches a
 * server-only secret.
 *
 * Next.js inlines only NEXT_PUBLIC_* variables into the client bundle,
 * so anything else read from process.env in a 'use client' file is
 * either undefined in production (a silent bug) or, worse, a secret
 * someone is about to expose by renaming it NEXT_PUBLIC_*.
 *
 * Rules:
 *   1. A 'use client' file may only read process.env.NEXT_PUBLIC_*.
 *   2. No NEXT_PUBLIC_* variable may be named like a secret
 *      (SERVICE_ROLE, SECRET, PRIVATE, WEBHOOK, PASSWORD, TOKEN).
 *   3. No source file may contain a literal Supabase service-role JWT
 *      or a live Stripe secret key.
 *
 * Usage: node scripts/check-client-secrets.mjs [rootDir]
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.argv[2] ?? 'apps/web/src';
const SKIP = new Set(['node_modules', '.next', 'dist', 'coverage']);
const EXT = /\.(ts|tsx|js|jsx|mjs)$/;

const SECRETISH = /(SERVICE_ROLE|SECRET|PRIVATE|WEBHOOK|PASSWORD|TOKEN)/;
const ENV_READ = /process\.env\.([A-Z0-9_]+)|process\.env\[['"]([A-Z0-9_]+)['"]\]/g;
const LITERALS = [
  { re: /sk_live_[0-9a-zA-Z]{16,}/, label: 'live Stripe secret key' },
  { re: /eyJ[\w-]+\.eyJ[\w-]*cm9sZSI6InNlcnZpY2Vfcm9sZS[\w-]*\.[\w-]+/, label: 'Supabase service-role JWT' },
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (EXT.test(name)) out.push(path);
  }
  return out;
}

const problems = [];
for (const file of walk(root)) {
  const src = readFileSync(file, 'utf8');
  const rel = relative(process.cwd(), file);
  const isClient = /^\s*(['"])use client\1/m.test(src.slice(0, 200));

  for (const m of src.matchAll(ENV_READ)) {
    const name = m[1] ?? m[2];
    if (isClient && !name.startsWith('NEXT_PUBLIC_')) {
      problems.push(`${rel}: client file reads server-only env "${name}"`);
    }
    if (name.startsWith('NEXT_PUBLIC_') && SECRETISH.test(name)) {
      problems.push(`${rel}: "${name}" looks like a secret but is public (NEXT_PUBLIC_ ships to every browser)`);
    }
  }
  for (const { re, label } of LITERALS) {
    if (re.test(src)) problems.push(`${rel}: contains a hardcoded ${label}`);
  }
}

if (problems.length) {
  console.error(`Client secret check failed (${problems.length}):\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
console.log('Client secret check passed.');
