import { defineConfig } from "vitest/config";

// Root config runs the database tests and the repo scripts' tests; each package runs its own tests.
export default defineConfig({ test: { include: ["supabase/tests/**/*.test.ts", "scripts/**/*.test.ts"], testTimeout: 15000 } });
