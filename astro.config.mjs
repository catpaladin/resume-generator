import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), tailwind()],
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
