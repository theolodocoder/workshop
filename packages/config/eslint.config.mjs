import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["**/.next/**", "**/dist/**", "**/node_modules/**", "**/playwright-report/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Plain .mjs files are Node scripts (build tools, test helpers).
  { files: ["**/*.mjs"], languageOptions: { globals: globals.node } },
);
