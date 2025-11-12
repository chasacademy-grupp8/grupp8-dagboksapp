# CI Integration Test Setup

This document outlines how to set up and run the integration tests in a CI environment like GitHub Actions.

## 1. Supabase Secrets

The integration tests require direct access to a Supabase database. For security, these credentials should **never** be hardcoded. Instead, they must be configured as secrets in your repository.

Navigate to your GitHub repository's settings: `Settings` > `Secrets and variables` > `Actions`.

Create the following **repository secrets**:

- `NEXT_PUBLIC_SUPABASE_URL`: The public URL for your Supabase project.
- `SUPABASE_SERVICE_ROLE_KEY`: The `service_role` key for your project. This key can bypass Row Level Security and should be protected.
- `TEST_USER_ID`: (Optional but recommended) The UUID of a pre-existing user in your `auth.users` table. The script will try to find a user automatically, but providing one can make tests more reliable.

## 2. Workflow Configuration (`main.yml`)

The CI workflow in `.github/workflows/main.yml` is configured to run integration tests under two conditions:

1.  **Manual Trigger**: You can manually trigger a workflow run with the "Run integration tests" input set to `true`.
2.  **Automatic on PR**: If the required secrets (`SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL`) are present in the repository, the integration tests will run automatically on pushes and pull requests to `main`.

The relevant part of the workflow file looks like this:

```yaml
integration:
  name: Integration tests (optional)
  needs: build
  runs-on: ubuntu-latest
  if: ${{ github.event.inputs.run_integration == 'true' || (secrets.SUPABASE_SERVICE_ROLE_KEY && secrets.NEXT_PUBLIC_SUPABASE_URL) }}
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
    TEST_USER_ID: ${{ secrets.TEST_USER_ID }}
    RUN_INTEGRATION_TESTS: "true"
  steps:
    # ... (checkout, setup, install)
    - name: Run integration script
      run: node ./scripts/run-integration-test.mjs
```

## 3. The Integration Test Script (`run-integration-test.mjs`)

This Node.js script is the core of the integration test. It performs the following steps:

1.  **Loads Environment Variables**: It reads the Supabase credentials from the environment (which are populated by GitHub Actions secrets).
2.  **Initializes Admin Client**: It creates a Supabase admin client using the `service_role` key.
3.  **Finds a Test User**: It attempts to find a user ID to associate the test data with, which is necessary to satisfy foreign key constraints on the `tags` table. It tries several strategies:
    - Reads from `public.users` or `auth.users`.
    - Looks up a user by a known email (`testuser@test.com`).
    - Uses the `TEST_USER_ID` secret as a fallback.
4.  **Runs the Test**:
    - It inserts a known tag ("work") for the test user.
    - It calls the `upsertTagsForUser` function with a mix of existing and new tags (["work", "personal"]).
    - It verifies that the function correctly returns both the existing and the newly created tag.
5.  **Cleans Up**: It deletes the tags created during the test to ensure the database is left in a clean state.
6.  **Exits with Status Code**: It exits with code `0` on success and `1` on failure, which tells GitHub Actions whether the step passed or failed.
