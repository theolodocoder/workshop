import { defineConfig, devices } from "@playwright/test";

const PORT = 4311;

export default defineConfig({
  testDir: "./e2e",
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: { command: "pnpm start", port: PORT, reuseExistingServer: !process.env.CI },
});
