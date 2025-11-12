import { jest } from "@jest/globals";
import { supabase } from "@/lib/supabase/client";
import { upsertTagsForUser } from "@/lib/supabase/queries";

describe("upsertTagsForUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Spy on supabase.from and mock its return value for different tables
    jest.spyOn(supabase, "from").mockImplementation((tableName: string) => {
      if (tableName === "tags") {
        return {
          // select(...).eq(...).in(...) chain for fetching existing tags
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              in: jest.fn(() =>
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
                })
              ),
            })),
          })),
          // insert(rows).select() chain for inserting new tags
          insert: jest.fn((rows: { user_id: string; name: string }[]) => ({
            select: jest.fn(() =>
              Promise.resolve({
                data: rows.map((r, i) => ({
                  id: `new-${i}`,
                  user_id: r.user_id,
                  name: r.name,
                  created_at: new Date().toISOString(),
                })),
                error: null,
              })
            ),
          })),
        } as any;
      }
      // Default for other tables
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn(() => Promise.resolve({ data: [], error: null })),
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      } as any;
    });
    
    // Mock auth.getUser
    jest.spyOn(supabase.auth, "getUser").mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    } as any);
  });

  test("returns existing and newly inserted tags", async () => {
    const userId = "user-1";
    const input = ["work", "personal"];

    const result = await upsertTagsForUser(input, userId);

    expect(Array.isArray(result)).toBe(true);
    const names = (result as { name: string }[]).map((t) => t.name).sort();
    expect(names).toEqual(["personal", "work"].sort());
  });
});
