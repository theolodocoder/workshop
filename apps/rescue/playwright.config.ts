import { defineConfig, devices } from "@playwright/test";

const PORT = 4310;
const DOWN_PORT = 4320;
const MEASURED_PORT = 4330;
const CHECK_PORT = 4340;
const MOCK_PORT = 4398;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e-tools/reset-check-counters.mjs",
  fullyParallel: true,
  reporter: [["list"]],
  projects: [
    {
      name: "chromium",
      testIgnore: /(store-down|report-measured|report-unmeasured|check)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${PORT}` },
    },
    {
      // The same build, but its server talks to a database address nobody answers.
      name: "store-down",
      testMatch: /(store-down|report-unmeasured)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${DOWN_PORT}` },
    },
    {
      // The same build, given a results file, to check how the report shows real numbers.
      name: "measured",
      testMatch: /report-measured\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${MEASURED_PORT}` },
    },
    {
      // The same build, with PageSpeed and the AI pointed at local mocks (e2e-tools/mock-apis.mjs).
      name: "check",
      testMatch: /check\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${CHECK_PORT}` },
    },
  ],
  webServer: [
    { command: "pnpm start", port: PORT, reuseExistingServer: !process.env.CI },
    {
      command: `pnpm exec next start --port ${DOWN_PORT}`,
      port: DOWN_PORT,
      reuseExistingServer: false,
      env: { SUPABASE_URL: "http://127.0.0.1:59999", BEFORE_SUPABASE_URL: "http://127.0.0.1:59998", BEFORE_SUPABASE_ANON_KEY: "any", RESULTS_PATH: "e2e/fixtures/no-such-results.json" },
    },
    {
      command: `pnpm exec next start --port ${MEASURED_PORT}`,
      port: MEASURED_PORT,
      reuseExistingServer: false,
      env: { RESULTS_PATH: "e2e/fixtures/results.json" },
    },
    { command: `node e2e-tools/mock-apis.mjs ${MOCK_PORT}`, port: MOCK_PORT, reuseExistingServer: false },
    {
      command: `pnpm exec next start --port ${CHECK_PORT}`,
      port: CHECK_PORT,
      reuseExistingServer: false,
      env: {
        PAGESPEED_API_URL: `http://127.0.0.1:${MOCK_PORT}/pagespeed`,
        PAGESPEED_API_KEY: "test-key",
        CF_AI_BASE_URL: `http://127.0.0.1:${MOCK_PORT}/cf`,
        CF_ACCOUNT_ID: "test-account",
        CF_AI_TOKEN: "test-token",
        CHECK_SALT: "test-salt-not-a-secret-0123456789",
      },
    },
  ],
});
