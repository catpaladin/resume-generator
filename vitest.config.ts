/// <reference types="vitest" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["src/**/*.{test,spec}.{js,ts}"],
    exclude: [
      "src/**/*.tsx",
      "src/**/__tests__/**/*.tsx",
      "node_modules",
      "dist",
    ],
    setupFiles: ["./vitest.setup.ts"],
    deps: {
      optimizer: {
        web: {
          include: ["@testing-library/svelte"],
        },
      },
    },
  },
});
