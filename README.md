# Adeola Forge SaaS Starter

Next.js 16 and Supabase starter I use as the base for client SaaS builds. It's a fork of [NextBase Starter](https://github.com/imbhargav5/nextbase-nextjs-supabase-starter) with a token-based theme, CI that runs on forks, and security checks that fail the build instead of relying on someone to remember them.

Click **Use this template** to start a project from it.

## Stack

- Next.js 16 (App Router, Cache Components), React 19, TypeScript
- Supabase: Postgres with RLS, Auth via `@supabase/ssr`, declarative schemas, pgTAP tests
- Tailwind CSS 4 and shadcn/ui
- next-safe-action with Zod for server actions, TanStack Query on the client
- Vitest and Playwright
- pnpm workspaces and Turborepo

## What I changed from upstream

**Theme.** `apps/web/src/styles/tokens.css` holds the brand hue, intensity and lightness, plus type and spacing scales. Every shadcn color (buttons, focus rings, sidebar, charts) is derived from it, in light and dark mode. Rebranding a project means editing four numbers. The default palette passes WCAG AA for every text pair.

**CI.** Upstream gates every workflow on `github.repository == 'imbhargav5/...'`, so forks and template copies silently skip all checks. I removed the gates, dropped the maintainer-only release and dependency bots, and added `supabase test db` to the integration job. Upstream had pgTAP tests that CI never ran.

**Database security tests.** `apps/database/supabase/tests/security_baseline_test.sql` checks the whole `public` schema, so it keeps covering tables you add later:

- every table has RLS enabled
- every RLS table has at least one policy
- every `SECURITY DEFINER` function pins `search_path`

The third one caught a real issue: upstream's `set_private_item_owner_id()` trigger was `SECURITY DEFINER` with no `search_path`. Fixed in both the declarative schema and a migration.

**Secret checks.** `.github/workflows/security.yml` runs Gitleaks over the full history, plus `scripts/check-client-secrets.mjs`, which fails on server env vars read in `'use client'` files, secret-looking `NEXT_PUBLIC_` names, and hardcoded service-role JWTs or live Stripe keys. The same check is available for any repo as [Secret Guard](https://github.com/Joyhacks/secret-guard).

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
```

Schema changes go in `apps/database/supabase/schemas/*.sql`. Generate migrations from them with `supabase db diff`. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Docs

- [`docs/NEXTJS_CACHE_COMPONENTS.md`](docs/NEXTJS_CACHE_COMPONENTS.md): caching and Partial Prerendering
- [`docs/SUPABASE_GETCLAIMS_AUTHENTICATION.md`](docs/SUPABASE_GETCLAIMS_AUTHENTICATION.md): how auth is verified on the server
- [Upstream NextBase README](https://github.com/imbhargav5/nextbase-nextjs-supabase-starter#readme) for the original feature docs

## License

MIT. Original work by Bhargav Ponnapalli, changes by Adeola Ilori. See [LICENSE](LICENSE).
