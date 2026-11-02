# Security Baseline

Pre-launch checklist for every project built from this template. Check numbers refer to the Adeola Forge App Security Handbook (internal).

Mark each item **PASS / FAIL / UNKNOWN / N/A** with evidence (file, query output, screenshot). No evidence means UNKNOWN, never PASS. Review on staging only.

## Automated in CI

These fail the build on their own. Confirm the latest run is green.

| Guard | Handbook | Where |
|---|---|---|
| Every public table has RLS and at least one policy | 06 | `apps/database/supabase/tests/security_baseline_test.sql` |
| SECURITY DEFINER functions pin `search_path` | 06 | same file |
| No leaked secrets in commits or history | 13 | `.github/workflows/security.yml` (Gitleaks) |
| No server env vars in client code, no secret-named public vars, no hardcoded service-role or live Stripe keys | 01, 05, 14 | `scripts/check-client-secrets.mjs` |

## Manual, every project

| # | Check | Handbook | Result | Evidence |
|---|---|---|---|---|
| 1 | Production bundle contains no service-role key or private API key (search the built JS) | 01, 14 | | |
| 2 | RLS policies actually scope rows to the owner or org. Test as user A reading user B's rows | 06, 36 | | |
| 3 | Staging environment exists and is separate from production data | 29 | | |
| 4 | No default or seed credentials left in the deployed database or admin | 30 | | |
| 5 | Secrets rotated if they ever touched git history or a previous AI builder | 13 | | |

## When the project has these features

| Feature | Check | Handbook | Result | Evidence |
|---|---|---|---|---|
| Payments | Webhook signature verified server-side | 31 | | |
| Payments | Duplicate webhook events ignored (idempotent on event id) | 32 | | |
| Uploads | File types restricted, private buckets for private files | 21 | | |
| AI tools or agents | Tool permissions scoped, prompt injection and spend limits considered | 28 | | |
| Admin or roles | Role checks enforced server-side, not only hidden in the UI | 09 | | |

## Scope

- App:
- Repo revision:
- Deployment:
- Date:
- Reviewer:
