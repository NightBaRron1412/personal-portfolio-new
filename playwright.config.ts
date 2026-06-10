import { defineConfig, devices } from "@playwright/test";

// Port is configurable (default 3000) so the suite can run on a free port when
// 3000 is occupied: `PORT=3100 pnpm exec playwright test`.
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: 0,
  use: {
    baseURL,
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Run against the production build — it serves instantly, whereas `next dev`
  // cold-compiles this heavy page on first request and trips the timeouts.
  webServer: {
    command: `pnpm build && pnpm start -- -p ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
});
