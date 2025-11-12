import "@testing-library/jest-dom";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local for tests if present.
// Jest doesn't load Next.js .env files automatically, so we do a small,
// dependency-free loader here. It will not overwrite already-set env vars.
try {
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
      // Remove surrounding quotes if present
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (typeof process.env[key] === "undefined") {
        process.env[key] = val;
      }
    }
  }
} catch (err) {
  // If reading .env.local fails for any reason, don't block tests.
  console.warn("Could not load .env.local for tests:", err);
}

// Provide a minimal fetch polyfill for tests when we DON'T intend to run
// integration tests that require real network access. Integration mode must
// be explicitly opted in by setting RUN_INTEGRATION_TESTS=true in the test
// environment; having Supabase env vars alone is not enough. This avoids
// importing ESM-only `undici` into Jest (which can fail with missing web
// stream globals like ReadableStream)
const integrationEnvPresent =
  process.env.RUN_INTEGRATION_TESTS === "true" &&
  Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_ROLE)
  );

// If integration env is present but `fetch` is missing (Node <18), try to
// provide a fetch implementation from 'undici' if available. If not, the
// integration tests will fail with a clear message instructing the user.
if (integrationEnvPresent) {
  if (typeof globalThis.fetch === "undefined") {
    // Ensure TextEncoder/TextDecoder exist for undici (jsdom or older Node may not provide them)
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const util = require("util");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (
        typeof (globalThis as any).TextEncoder === "undefined" &&
        util.TextEncoder
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).TextEncoder = util.TextEncoder;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (
        typeof (globalThis as any).TextDecoder === "undefined" &&
        util.TextDecoder
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).TextDecoder = util.TextDecoder;
      }
    } catch (err) {
      // ignore — we'll handle missing globals when importing undici
    }

    // undici is ESM-only in recent versions; require() will fail in CommonJS.
    // We'll install a small lazy wrapper that dynamically imports undici on
    // first use and then replaces global.fetch with the real implementation.
    // This avoids blocking startup while still providing fetch when needed.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = (...args: any[]) => {
      // dynamic import returns a promise resolving to the module with `fetch`
      return import("undici")
        .then((m) => {
          // replace the wrapper with the real fetch
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (globalThis as any).fetch = m.fetch;
          return (m.fetch as any)(...args);
        })
        .catch((err) => {
          console.warn(
            "Failed to import 'undici' for fetch polyfill. Integration tests may fail.",
            err
          );
          throw err;
        });
    };
  }
} else if (typeof globalThis.fetch === "undefined") {
  // Provide a minimal mock fetch for unit tests that must not hit network.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: async () => ({}) })
  );
}
