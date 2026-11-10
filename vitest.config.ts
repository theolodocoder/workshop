import { defineConfig } from "vitest/config";

// Root config only runs the database tests; each package runs its own tests.
export default defineConfig({ test: { include: ["supabase/tests/**/*.test.ts"], testTimeout: 15000 } });
