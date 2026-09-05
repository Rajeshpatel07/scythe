import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin, type UserConfig } from "vite";
import { chromeExtension } from "vite-plugin-chrome-extension";

function rewriteNewtabEntry(): Plugin {
  return {
    name: "rewrite-newtab-entry",
    apply: "build",
    closeBundle() {
      const distIndex = resolve(import.meta.dirname, "dist/index.html");
      const html = readFileSync(distIndex, "utf8");
      writeFileSync(distIndex, html.replace("/src/newtab.ts", "/src/newtab.js"));
    },
  };
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        manifest: resolve(import.meta.dirname, "manifest.json"),
        main: resolve(import.meta.dirname, "./src/newtab.ts"),
        popup: resolve(import.meta.dirname, "./src/popup/popup.ts"),
      },
    },
  },
  plugins: [chromeExtension(), rewriteNewtabEntry()],
}) satisfies UserConfig;
