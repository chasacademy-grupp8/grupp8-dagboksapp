import { jest } from "@jest/globals";
import { createClient } from "@supabase/supabase-js";

// Integration test that runs only when env vars are present. This file is
// intended for local/manual runs or CI configured with a dedicated test DB
// (do NOT use production credentials).

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!url || !serviceKey) {
  describe("upsertTagsForUser (integration skipped)", () => {
    test("skipped because SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is missing", () => {
      console.warn(
        "Skipping upsertTagsForUser integration test: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to run."
      );
    });
  });
} else {
  jest.resetModules();

  const admin = createClient(url, serviceKey);

  // Mock the app's client module so the queries import will use our admin client
  jest.mock("@/lib/supabase/client", () => ({ supabase: admin }));

  // Import the queries module AFTER mocking the client
  const { upsertTagsForUser } = require("@/lib/supabase/queries");

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
