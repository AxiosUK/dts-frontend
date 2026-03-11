import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Cast `test` to `any` because some Vitest runtime-only options
  // (like `threads`) may not be present in the installed
  // Vitest TypeScript definitions. The options are still passed to
  // Vitest at runtime; this cast prevents editor/type errors.
  test: {
    environment: "jsdom",
    setupFiles: "src/setupTests.ts",
    globals: true,
    threads: true,
    // Increase test timeout for slower CI environments when importing
    // the real app (which loads many UI modules). 20s should be ample.
    testTimeout: 20000,
  } as any,
});
