import "@testing-library/jest-dom";

// Provide a minimal fetch polyfill for tests. Some libraries (or their mocks)
// rely on global.fetch being available. In Node 18+ fetch is global, but CI
// or local environments may not have it; using a jest.fn() avoids network.
if (typeof globalThis.fetch === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: async () => ({}) })
  );
}
