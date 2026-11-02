# Contributing

## Database changes

The schema files in `apps/database/supabase/schemas/` are the source of truth. Don't write migrations by hand.

1. Edit the relevant `schemas/*.sql` file.
2. From `apps/database`, run `supabase db diff -f <short_name>` to generate the migration.
3. Review the generated SQL, then run `pnpm test-db`.
4. Regenerate types with `pnpm gen-types-local` from the repo root.

New tables need RLS enabled and at least one policy in the same change. New `SECURITY DEFINER` functions need `SET search_path = ''` and schema-qualified references. `security_baseline_test.sql` fails otherwise.

## Env files

Examples live at the repo root (`.env.local.example`, `.env.development.local.example`). Copy them, never overwrite an existing `.env.local`, and never commit real values.

## Before opening a PR

```bash
pnpm lint && pnpm typecheck && pnpm test
cd apps/database && pnpm test-db
```

Don't commit `.oneignore`. It's a leftover from a deprecated CLI and is gitignored on purpose.
