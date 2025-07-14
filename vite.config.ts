import { resolve } from "node:path";
import { defineConfig, type UserConfig } from "vite";
import { chromeExtension } from "vite-plugin-chrome-extension";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        manifest: resolve(__dirname, "manifest.json"),
        main: resolve(__dirname, "./src/main.ts"),
      },
    },
  },
  plugins: [chromeExtension()],
}) satisfies UserConfig;
