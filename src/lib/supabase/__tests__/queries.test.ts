import { jest } from "@jest/globals";

// Simple mock for the supabase client used in queries
jest.mock("@/lib/supabase/client", () => {
  return {
    supabase: {
      auth: { getUser: jest.fn() },
      from: jest.fn(),
    },
  };
});

import { supabase } from "@/lib/supabase/client";
import { upsertTagsForUser } from "@/lib/supabase/queries";

describe("upsertTagsForUser", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("returns existing and newly inserted tags", async () => {
    const userId = "user-1";
    const input = ["work", "personal"];

    // mock behavior for supabase.from when called with 'tags'
    (supabase.from as unknown as jest.Mock).mockImplementation(
      (...args: unknown[]) => {
        type Row = { user_id: string; name: string };
        const table = String(args[0] ?? "");
        if (table === "tags") {
          return {
            select: () => ({
              data: [
                {
                  id: "t1",
                  user_id: userId,
                  name: "work",
                  created_at: new Date().toISOString(),
                },
              ],
              error: null,
            }),
            eq: () => ({
              in: () => ({
                data: [
                  {
                    id: "t1",
                    user_id: userId,
                    name: "work",
                    created_at: new Date().toISOString(),
                  },
                ],
                error: null,
              }),
              select: () => ({
                data: [
                  {
                    id: "t1",
                    user_id: userId,
                    name: "work",
                    created_at: new Date().toISOString(),
                  },
                ],
                error: null,
              }),
            }),
            in: () => ({
              data: [
                {
                  id: "t1",
                  user_id: userId,
                  name: "work",
                  created_at: new Date().toISOString(),
                },
              ],
              error: null,
            }),
            insert: (rows: Row[]) => ({
              data: rows.map((r: Row, i: number) => ({
                id: `new-${i}`,
                user_id: r.user_id,
                name: r.name,
                created_at: new Date().toISOString(),
              })),
              error: null,
            }),
          };
        }
        return {
          select: () => ({ data: [], error: null }),
          eq: () => ({ data: [], error: null }),
          in: () => ({ data: [], error: null }),
          insert: () => ({ data: [], error: null }),
        };
      }
    );

    const result = await upsertTagsForUser(input, userId);

    expect(Array.isArray(result)).toBe(true);
    const names = (result as Array<{ name: string }>).map((t) => t.name).sort();
    expect(names).toEqual(["personal", "work"].sort());
  });
});
