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
  } as any,
});
