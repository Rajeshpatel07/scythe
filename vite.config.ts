import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin, type UserConfig } from "vite";
import { chromeExtension } from "vite-plugin-chrome-extension";

// Source index.html targets /src/main.ts for `vite dev`; the emitted dist copy
// is written verbatim by the chrome-extension plugin, so rewrite it to the
// bundled /src/main.js after the build finishes writing.
function rewriteNewtabEntry(): Plugin {
  return {
    name: "rewrite-newtab-entry",
    apply: "build",
    closeBundle() {
      const distIndex = resolve(__dirname, "dist/index.html");
      const html = readFileSync(distIndex, "utf8");
      writeFileSync(distIndex, html.replace("/src/main.ts", "/src/main.js"));
    },
  };
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        manifest: resolve(__dirname, "manifest.json"),
        main: resolve(__dirname, "./src/main.ts"),
        popup: resolve(__dirname, "./src/popup/index.ts"),
      },
    },
  },
  plugins: [chromeExtension(), rewriteNewtabEntry()],
}) satisfies UserConfig;
