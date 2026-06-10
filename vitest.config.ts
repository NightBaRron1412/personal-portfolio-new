import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Unit tests only — Playwright e2e specs live in ./e2e and run separately.
    include: ["lib/**/*.test.ts", "data/**/*.test.ts", "app/**/*.test.ts"],
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    environment: "node",
  },
});
