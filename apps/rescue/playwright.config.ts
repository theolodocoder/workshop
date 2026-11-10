import { defineConfig, devices } from "@playwright/test";

const PORT = 4310;
const DOWN_PORT = 4320;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: [["list"]],
  projects: [
    {
      name: "chromium",
      testIgnore: /store-down\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${PORT}` },
    },
    {
      // The same build, but its server talks to a database address nobody answers.
      name: "store-down",
      testMatch: /store-down\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${DOWN_PORT}` },
    },
  ],
  webServer: [
    { command: "pnpm start", port: PORT, reuseExistingServer: !process.env.CI },
    {
      command: `pnpm exec next start --port ${DOWN_PORT}`,
      port: DOWN_PORT,
      reuseExistingServer: false,
      env: { SUPABASE_URL: "http://127.0.0.1:59999" },
    },
  ],
});
