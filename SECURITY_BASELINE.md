# Security Baseline

Pre-launch checklist for every project built from this template.

Mark each item **PASS / FAIL / UNKNOWN / N/A** with evidence (file, query output, screenshot). No evidence means UNKNOWN, never PASS. Review on staging only.

## Automated in CI

These fail the build on their own. Confirm the latest run is green.

| Guard | Where |
|---|---|
| Every public table has RLS and at least one policy | `apps/database/supabase/tests/security_baseline_test.sql` |
| SECURITY DEFINER functions pin `search_path` | same file |
| No leaked secrets in commits or history | `.github/workflows/security.yml` (Gitleaks) |
| No server env vars in client code, no secret-named public vars, no hardcoded service-role or live Stripe keys | `scripts/check-client-secrets.mjs` |

## Manual, every project

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Production bundle contains no service-role key or private API key (search the built JS) | | |
| 2 | RLS policies actually scope rows to the owner or org. Test as user A reading user B's rows | | |
| 3 | Staging environment exists and is separate from production data | | |
| 4 | No default or seed credentials left in the deployed database or admin | | |
| 5 | Secrets rotated if they ever touched git history or a previous AI builder | | |

## When the project has these features

| Feature | Check | Result | Evidence |
|---|---|---|---|
| Payments | Webhook signature verified server-side | | |
| Payments | Duplicate webhook events ignored (idempotent on event id) | | |
| Uploads | File types restricted, private buckets for private files | | |
| AI tools or agents | Tool permissions scoped, prompt injection and spend limits considered | | |
| Admin or roles | Role checks enforced server-side, not only hidden in the UI | | |

## Scope

- App:
- Repo revision:
- Deployment:
- Date:
- Reviewer:
