# Adeola Forge SaaS Starter

The Next.js 16 and Supabase starter I use as the base for SaaS builds. It ships with auth, row-level security, a token-based theme, and CI that fails the build on the security mistakes I see most often in client projects.

Click **Use this template** to start a project from it.

## Stack

- Next.js 16 (App Router, Cache Components), React 19, TypeScript
- Supabase: Postgres with RLS, Auth via `@supabase/ssr`, declarative schemas, pgTAP tests
- Tailwind CSS 4 and shadcn/ui
- next-safe-action with Zod for server actions, TanStack Query on the client
- Vitest and Playwright
- pnpm workspaces and Turborepo

## Renaming and rebranding

Two files make a project yours:

- `apps/web/src/constants.ts` holds `PRODUCT_NAME` and `REPO_URL`. The navbar, footer, auth screens, about page, page titles and the e2e tests all read from it.
- `apps/web/src/styles/tokens.css` holds the brand hue, intensity and lightness, plus the type and spacing scales. Every shadcn color (buttons, focus rings, sidebar, charts) is derived from it in light and dark mode. The default palette passes WCAG AA for every text pair.

## Security checks in CI

**Database.** `apps/database/supabase/tests/security_baseline_test.sql` runs against the whole `public` schema, so it keeps covering tables added later:

- every table has RLS enabled
- every RLS table has at least one policy
- every `SECURITY DEFINER` function pins `search_path`

The last check caught a real issue in the owner-assignment trigger, which ran as `SECURITY DEFINER` with no `search_path`. It's fixed in the declarative schema and a migration.

**Secrets.** `.github/workflows/security.yml` runs Gitleaks over the full history, plus `scripts/check-client-secrets.mjs`, which fails on server env vars read in `'use client'` files, secret-looking `NEXT_PUBLIC_` names, and hardcoded service-role JWTs or live Stripe keys. The same check is available for any repo as [Secret Guard](https://github.com/Joyhacks/secret-guard).

**Tests.** CI runs lint, typecheck, unit tests, Playwright end-to-end tests against a local Supabase stack, and the pgTAP suite. All of it runs on every repo created from the template.

## Getting started

```bash
pnpm install
cp .env.local.example .env.local
cp .env.development.local.example .env.development.local

pnpm database#start      # local Supabase in Docker
pnpm supabase:sync-env   # copies the local keys into your env files
pnpm gen-types-local
pnpm dev                 # http://localhost:3000
```

For a hosted Supabase project instead, set `SUPABASE_PROJECT_REF`, `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, then:

```bash
pnpm supabase link --project-ref $SUPABASE_PROJECT_REF
pnpm supabase db push
pnpm gen-types
```

Never put the service-role key in a `NEXT_PUBLIC_` variable. CI will fail if you do.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test                         # Vitest
pnpm test:e2e                     # Playwright, needs the local stack running
cd apps/database && pnpm test-db  # pgTAP: schema, RLS, security baseline
```

Before launching a project built on this, go through [`SECURITY_BASELINE.md`](SECURITY_BASELINE.md). It lists what CI already enforces and what still needs a person to check.

## Layout

```
apps/
  web/          Next.js app
    src/app/      (external-pages), (auth-pages), (app-pages)
    src/data/     server-side data access, split into anon, auth and user
    src/styles/   tokens.css and globals.css
  database/     Supabase config, declarative schemas, migrations, pgTAP tests
packages/       shared TypeScript config
scripts/        env sync, client secret check
docs/           caching and auth notes
```

Schema changes go in `apps/database/supabase/schemas/*.sql`. Generate migrations from them with `supabase db diff`. See [CONTRIBUTING.md](CONTRIBUTING.md).
