import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin, type UserConfig } from "vite";
import { chromeExtension } from "vite-plugin-chrome-extension";

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

// `?raw` CSS imports bypass Vite's CSS pipeline, so the raw text (comments,
// newlines included) ends up as JS string literals in the bundle. Minify at
// load time: first-non-null-wins + pre enforce beats vite:asset to it.
function minifyRawCss(): Plugin {
  return {
    name: "minify-raw-css",
    enforce: "pre",
    load(id: string) {
      if (!/\.css\?raw/.test(id)) return null;
      const file = id.slice(0, id.indexOf("?"));
      const src = readFileSync(file, "utf8");
      return `export default ${JSON.stringify(minifyCss(src))};`;
    },
  };
}
function rewriteNewtabEntry(): Plugin {
  return {
    name: "rewrite-newtab-entry",
    apply: "build",
    closeBundle() {
      const distIndex = resolve(import.meta.dirname, "dist/index.html");
      const html = readFileSync(distIndex, "utf8");
      writeFileSync(
        distIndex,
        html.replace("/src/newtab.ts", "/src/newtab.js"),
      );
    },
  };
}

export default defineConfig({
  build: {
    minify: "esbuild",
    cssMinify: "esbuild",
    sourcemap: false,
    // Extension files load from disk (no HTTP cost), so never inline assets
    // as base64/data-URIs into JS. Emits real files instead.
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        manifest: resolve(import.meta.dirname, "manifest.json"),
        main: resolve(import.meta.dirname, "./src/newtab.ts"),
        popup: resolve(import.meta.dirname, "./src/popup/popup.ts"),
      },
    },
  },
  plugins: [minifyRawCss(), chromeExtension(), rewriteNewtabEntry()],
}) satisfies UserConfig;
