import path from "node:path";
import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  plugins: [
    tailwindcss(),
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    mdx({
      jsxImportSource: "react",
      providerImportSource: "@mdx-js/react",
    }),
  ],
  build: {
    sourcemap: true,
  },
});
