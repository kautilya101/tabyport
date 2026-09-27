import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const DEFAULT_API_URL = "http://localhost:3000";

function manifestPlugin(apiUrl: string): Plugin {
  return {
    name: "tabyport-manifest",
    generateBundle() {
      const manifest = JSON.parse(readFileSync(resolve(import.meta.dirname, "manifest.json"), "utf8"));
      manifest.host_permissions = [`${new URL(apiUrl).origin}/*`];
      this.emitFile({
        type: "asset",
        fileName: "manifest.json",
        source: JSON.stringify(manifest, null, 2),
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, "VITE_");
  const apiUrl = env.VITE_API_URL || DEFAULT_API_URL;

  return {
    plugins: [react(), manifestPlugin(apiUrl)],
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(apiUrl),
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rolldownOptions: {
        input: {
          popup: resolve(import.meta.dirname, "src/popup/index.html"),
          background: resolve(import.meta.dirname, "src/background/index.ts"),
        },
        output: {
          entryFileNames: (chunk) =>
            chunk.name === "background" ? "background.js" : "assets/[name]-[hash].js",
        },
      },
    },
  };
});
