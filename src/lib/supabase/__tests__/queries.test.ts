import { jest } from "@jest/globals";

// Unit test that mocks the Supabase client. This runs quickly in CI and local
// dev and does not require real network access.
const clientMock = () => {
  // create a jest.fn() implementation for `from` which returns chainable
  // objects for the common patterns used in `upsertTagsForUser`.
  const fromFn = jest.fn((/* table: string */) => {
    return {
      // select(...).eq(...).in(...)
      select: () => ({
        eq: (_col: string, _val: unknown) => ({
          in: (_col2: string, _vals: unknown[]) =>
            Promise.resolve({
              data: [
                {
                  id: "t1",
                  user_id: "user-1",
                  name: "work",
                  created_at: new Date().toISOString(),
                },
              ],
              error: null,
            }),
        }),
        in: (_col2: string, _vals: unknown[]) =>
          Promise.resolve({ data: [], error: null }),
      }),
      // insert(rows).select()
      insert: (rows: any[]) => ({
        select: () =>
          Promise.resolve({
            data: rows.map((r, i) => ({
              id: `new-${i}`,
              user_id: r.user_id,
              name: r.name,
              created_at: new Date().toISOString(),
            })),
            error: null,
          }),
      }),
      eq: () => ({ in: () => Promise.resolve({ data: [], error: null }) }),
      in: () => Promise.resolve({ data: [], error: null }),
    };
  });

  return {
    supabase: {
      from: fromFn,
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
    },
  };
};

jest.mock("@/lib/supabase/client", clientMock);
// Also mock the relative path used inside `queries.ts` (./client)
jest.mock("../client", clientMock);

import { supabase } from "@/lib/supabase/client";
import { upsertTagsForUser } from "@/lib/supabase/queries";

describe("upsertTagsForUser", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // spy on the real supabase.from and provide a mocked implementation
    jest.spyOn(supabase, "from").mockImplementation((/* table: string */) => {
      return {
        select: () => ({
          eq: (_col: string, _val: unknown) => ({
            in: (_col2: string, _vals: unknown[]) =>
              Promise.resolve({
                data: [
                  {
                    id: "t1",
                    user_id: "user-1",
                    name: "work",
                    created_at: new Date().toISOString(),
                  },
                ],
                error: null,
              }),
          }),
          in: (_col2: string, _vals: unknown[]) =>
            Promise.resolve({ data: [], error: null }),
        }),
        insert: (rows: any[]) => ({
          select: () =>
            Promise.resolve({
              data: rows.map((r, i) => ({
                id: `new-${i}`,
                user_id: r.user_id,
                name: r.name,
                created_at: new Date().toISOString(),
              })),
              error: null,
            }),
        }),
        eq: () => ({ in: () => Promise.resolve({ data: [], error: null }) }),
        in: () => Promise.resolve({ data: [], error: null }),
      } as any;
    });
  });

  test("returns existing and newly inserted tags", async () => {
    const userId = "user-1";
    const input = ["work", "personal"];

    // The mocked `supabase.from` implementation (set at module mock) already
    // returns an existing 'work' tag and maps inserted rows — no runtime
    // override is necessary here.

    let result;
    try {
      result = await upsertTagsForUser(input, userId);
    } catch (err) {
      // Log full stack to help debug where the error originates in tests
      // eslint-disable-next-line no-console
      console.error("upsertTagsForUser threw:", err);
      throw err;
    }

    expect(Array.isArray(result)).toBe(true);
    const names = (result as { name: string }[]).map((t) => t.name).sort();
    expect(names).toEqual(["personal", "work"].sort());
  });
});
