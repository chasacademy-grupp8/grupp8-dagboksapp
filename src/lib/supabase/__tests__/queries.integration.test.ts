// Run integration tests in a Node environment (provides global fetch/streams).
// This file is intentionally node-environment-only.
/** @jest-environment node */

import { jest } from "@jest/globals";
import { createClient } from "@supabase/supabase-js";
import { upsertTagsForUser } from "@/lib/supabase/queries";

// Integration test that runs only when env vars are present. This file is
// intended for local/manual runs or CI configured with a dedicated test DB
// (do NOT use production credentials).

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

// Require an explicit opt-in to run integration tests. This prevents CI/local
// runs from accidentally hitting real databases. To run: set RUN_INTEGRATION_TESTS=true
// and ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.
const runIntegration = Boolean(
  process.env.RUN_INTEGRATION_TESTS === "true" && url && serviceKey
);

if (!runIntegration) {
  describe("upsertTagsForUser (integration skipped)", () => {
    test("skipped because SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is missing", () => {
      console.warn(
        "Skipping upsertTagsForUser integration test: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to run."
      );
    });
  });
} else {
  jest.resetModules();

  // Ensure url and serviceKey are defined before using them
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase URL or Service Key is missing. Ensure environment variables are set."
    );
  }

  const admin = createClient(url, serviceKey);

  // Mock the app's client module so the queries import will use our admin client
  jest.mock("@/lib/supabase/client", () => ({ supabase: admin }));

  describe("upsertTagsForUser (integration)", () => {
    const testUserId = `test-user-${Date.now()}`;

    afterAll(async () => {
      // cleanup: remove any tags created for the test user
      await admin.from("tags").delete().eq("user_id", testUserId);
    });

    test("returns existing and newly inserted tags", async () => {
      // ensure existing tag
      await admin.from("tags").insert([{ user_id: testUserId, name: "work" }]);

      const input = ["work", "personal"];
      const result = await upsertTagsForUser(input, testUserId);

      expect(Array.isArray(result)).toBe(true);
      const names = result.map((t: { name: string }) => t.name).sort();
      expect(names).toEqual(["personal", "work"].sort());
    });
  });
}
