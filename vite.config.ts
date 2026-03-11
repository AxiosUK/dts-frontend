import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  return {
    plugins: [react()],
    port: 80,
    // Pre-bundle heavy dependencies to speed cold dev start (first run)
    optimizeDeps: {
      include: [
        "@mui/material",
        "@mui/icons-material",
        "@mui/x-data-grid",
        "@mui/x-date-pickers",
        "dayjs",
      ],
    },
    build: {
      outDir: "dist",
      sourcemap: false,
    },
  };
});
