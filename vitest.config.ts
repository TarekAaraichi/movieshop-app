import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.test.js"],
    globals: false,
  },
  // avoid heavy Vite transforms for PostCSS during unit tests
  esbuild: {
    loader: "ts",
  },
});
