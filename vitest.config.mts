import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Node environment is Vitest's default — no jsdom; these are pure-core
// tests only (no React rendering, no Next.js runtime).
// (.mts so Vite 8's native config loader reads the ESM without warnings.)
export default defineConfig({
  resolve: {
    alias: {
      // Mirror tsconfig.json's "@/*" → repo root. Values must be absolute
      // (fileURLToPath, not URL.pathname — Windows).
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
