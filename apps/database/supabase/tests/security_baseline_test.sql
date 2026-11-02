-- Security baseline: runs with `supabase test db` alongside database_test.sql.
-- These tests are schema-wide, so they keep guarding every table and
-- function added in client projects built from this template.
BEGIN;

SELECT plan(3);

-- 1. Every table in the public schema has row level security enabled.
--    A table without RLS is readable and writable by anyone holding the
--    publishable key, which ships in the browser bundle.
SELECT is_empty(
  $$
    SELECT c.relname::text
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p')
      AND NOT c.relrowsecurity
  $$,
  'every public table must have RLS enabled'
);

-- 2. Every RLS-enabled public table has at least one policy.
--    RLS with zero policies silently denies everything, which usually
--    means someone "fixed" it later with the service-role key.
SELECT is_empty(
  $$
    SELECT c.relname::text
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p')
      AND c.relrowsecurity
      AND NOT EXISTS (
        SELECT 1 FROM pg_policy p WHERE p.polrelid = c.oid
      )
  $$,
  'every RLS-enabled public table must have at least one policy'
);

-- 3. SECURITY DEFINER functions in public pin their search_path.
--    Without it, a caller can shadow tables or functions and run code
--    with the definer's privileges.
SELECT is_empty(
  $$
    SELECT p.proname::text
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef
      AND NOT EXISTS (
        SELECT 1
        FROM unnest(coalesce(p.proconfig, '{}'::text[])) AS cfg
        WHERE cfg LIKE 'search_path=%'
      )
  $$,
  'SECURITY DEFINER functions in public must set search_path'
);

SELECT * FROM finish();
ROLLBACK;
