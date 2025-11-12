# CI integration tests

This project runs unit tests on every push/PR. Integration tests against a real Supabase project are optional and must be explicitly enabled in CI.

## Secrets required for integration job

Add the following repository secrets in GitHub (Settings → Secrets):

- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- (optional) TEST_USER_ID — a UUID of a test user in your Supabase project to use for test data

## How the workflow behaves

- The `test` job always runs (unit tests).
- The `integration` job runs when either:
  - The workflow is manually triggered (Actions → Run workflow) and the `run_integration` input is set to `true` AND the required secrets are set.
  - OR the repository has the required secrets configured; the job will run automatically.

## Local usage

To run the same integration flow locally (recommended):

1. Ensure you have a `.env.local` with the Supabase URL and service role key (do NOT commit this file):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
TEST_USER_ID=<optional-test-user-uuid>
```

2. Run the integration script with Node (Node 18+ / 22 recommended):

```powershell
$env:TEST_USER_ID='<your-test-user-uuid>'
node .\scripts\run-integration-test.mjs
```

The script will attempt to reuse an existing user id, or use `TEST_USER_ID` fallback, then upsert tags and clean them up.
