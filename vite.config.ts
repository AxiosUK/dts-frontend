import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  return {
    plugins: [react()],
    port: 80,
    build: {
      outDir: "dist",
      sourcemap: false,
    },
  };
});
