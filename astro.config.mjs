import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  output: "static",
  build: {
    outDir: "dist",
  },
  vite: {
    optimizeDeps: {
      exclude: ["pdfjs-dist"],
    },
    ssr: {
      external: ["pdfjs-dist"],
    },
    build: {
      target: "esnext",
    },
  },
});
