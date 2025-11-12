import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Load .env.local (simple parser)
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (typeof process.env[key] === "undefined") process.env[key] = val;
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(2);
}

const admin = createClient(url, serviceKey);

async function upsertTagsForUser(tagNames, userId) {
  const normalized = Array.from(
    new Set(tagNames.map((t) => t.trim()).filter((t) => t && t.length))
  );
  if (!normalized.length) return [];

  const { data: existingTags, error: selErr } = await admin
    .from("tags")
    .select("*")
    .eq("user_id", userId)
    .in("name", normalized);
  if (selErr) throw selErr;
  const existing = existingTags || [];
  const existingNames = new Set(existing.map((t) => t.name));
  const toInsert = normalized.filter((n) => !existingNames.has(n));
  let inserted = [];
  if (toInsert.length) {
    const rows = toInsert.map((name) => ({ user_id: userId, name }));
    const { data: insData, error: insErr } = await admin
      .from("tags")
      .insert(rows)
      .select();
    if (insErr) throw insErr;
    inserted = insData || [];
  }
  return [...existing, ...inserted];
}

(async () => {
  const testUserId = crypto.randomUUID();
  console.log("Using Supabase URL:", url);
  console.log("Test user id:", testUserId);
  try {
    // Try to reuse an existing user id from the `users` table so FK constraints are
    // satisfied. This avoids having to create/delete auth users which is more
    // complex via the client library.
    let createdUserId = null;
    try {
      const candidates = ["users", "auth.users", "public.users"];
      for (const tbl of candidates) {
        try {
          const { data: users, error: usersErr } = await admin
            .from(tbl)
            .select("id")
            .limit(1);
          if (!usersErr && Array.isArray(users) && users.length > 0) {
            createdUserId = users[0].id;
            console.log(
              `Reusing existing user id from table ${tbl}:`,
              createdUserId
            );
            break;
          }
        } catch {
          // try next candidate
        }
      }
    } catch (e) {
      console.warn(
        "Could not read users table to find an existing user id:",
        e
      );
    }
    if (!createdUserId) {
      console.log(
        "No existing user id found in candidate tables, attempting to locate auth user by email..."
      );
      try {
        const knownEmail = process.env.TEST_USER_EMAIL || "testuser@test.com";
        const { data: authRows, error: authErr } = await admin
          .from("auth.users")
          .select("id,email")
          .eq("email", knownEmail)
          .limit(1);
        if (!authErr && Array.isArray(authRows) && authRows.length > 0) {
          createdUserId = authRows[0].id;
          console.log("Found auth user id by email:", createdUserId);
          // Try ensure a matching public.users row exists so FK constraints succeed
          const userRow = {
            id: createdUserId,
            created_at: new Date().toISOString(),
          };
          const userTables = ["public.users", "users"];
          let insertedUser = false;
          for (const ut of userTables) {
            try {
              const res = await admin.from(ut).insert([userRow]).select();
              if (!res.error) {
                console.log(`Inserted minimal user row into ${ut}`);
                insertedUser = true;
                break;
              }
            } catch {
              // ignore and try next
            }
          }
          if (!insertedUser) {
            console.warn(
              "Could not insert into public/users tables; FK may still fail. Proceeding to attempt tag operations anyway."
            );
          }
        } else {
          const envId = process.env.TEST_USER_ID;
          if (envId) {
            createdUserId = envId;
            console.log(
              "Using TEST_USER_ID from env as fallback:",
              createdUserId
            );
            // try insert minimal public.users row as above
            const userRow = {
              id: createdUserId,
              created_at: new Date().toISOString(),
            };
            const userTables = ["public.users", "users"];
            let insertedUser = false;
            for (const ut of userTables) {
              try {
                const res = await admin.from(ut).insert([userRow]).select();
                if (!res.error) {
                  console.log(`Inserted minimal user row into ${ut}`);
                  insertedUser = true;
                  break;
                }
              } catch {
                // ignore
              }
            }
            if (!insertedUser)
              console.warn(
                "Could not insert fallback user row into public/users; FK may fail."
              );
          } else {
            console.error("Could not find auth user by email", knownEmail);
            process.exit(2);
          }
        }
      } catch (e) {
        console.error(
          "Error while locating or creating minimal public.users row:",
          e
        );
        process.exit(2);
      }
    }

    // ensure existing tag
    console.log('Inserting existing tag "work"...');
    await admin.from("tags").insert([{ user_id: createdUserId, name: "work" }]);

    const result = await upsertTagsForUser(["work", "personal"], createdUserId);
    console.log(
      "Result tags:",
      result.map((t) => ({ id: t.id, name: t.name }))
    );

    const names = result.map((t) => t.name).sort();
    const expected = ["personal", "work"].sort();
    const ok = JSON.stringify(names) === JSON.stringify(expected);
    console.log("Test OK?", ok);
    process.exit(ok ? 0 : 1);
  } catch (err) {
    console.error("Integration test failed:", err);
    process.exit(1);
  } finally {
    try {
      await admin.from("tags").delete().eq("user_id", createdUserId);
      console.log("Cleaned up test tags");
    } catch (e) {
      console.warn("Cleanup failed:", e);
    }
    // remove the created auth user if we created one
    try {
      if (createdUserId && createdUserId !== testUserId) {
        const { error: delErr } = await admin.auth.admin.deleteUser(
          createdUserId
        );
        if (delErr) console.warn("Failed to delete test user:", delErr);
        else console.log("Deleted test user:", createdUserId);
      }
    } catch (e) {
      console.warn("User cleanup failed:", e);
    }
  }
})();
